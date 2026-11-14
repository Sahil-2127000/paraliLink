import { RATES } from '../config/rates.js'
import { Cluster } from '../models/cluster.model.js'
import { Listing } from '../models/listing.model.js'
import { nextSequence } from '../utils/counters.js'
import { centroid, haversineKm, orderStops, toLatLng } from '../utils/geo.js'

/**
 * Serialises cluster work (rebuilds and orders) inside this server process, so a
 * rebuild can never reshuffle farms while a buyer is ordering them.
 * (One API process is enough for the pilot; multiple instances would need a DB lock.)
 */
let chain = Promise.resolve()
export function withClusterLock(task) {
  const run = chain.then(task, task)
  chain = run.catch(() => {})
  return run
}

/**
 * Rebuilds every open cluster from scratch.
 *
 * 1. Clusters already ordered by a buyer are frozen and left alone.
 * 2. All other clusters are dissolved; their farms go back to "listed".
 * 3. For each harvest week, seed at the unassigned farm with the most neighbours
 *    and pull in unassigned farms within `radiusKm` of it (MongoDB $nearSphere
 *    geo query, nearest first) until the cluster reaches `maxTonnes`.
 * 4. Clusters with at least `minTonnes` become "ready" (orderable) and their
 *    farms show "Grouped with nearby farms"; smaller ones stay "forming".
 *
 * Simple and predictable at pilot scale (hundreds of listings). Runs after
 * listing changes and can be triggered by an admin.
 */
export async function rebuildClusters() {
  // Read at run time: an admin can change these.
  const { radiusKm, minTonnes, maxTonnes } = RATES.clustering

  // 1–2. Dissolve open clusters.
  await Cluster.deleteMany({ status: { $in: ['forming', 'ready'] } })
  await Listing.updateMany({ status: { $in: ['listed', 'clustered'] } }, { $set: { status: 'listed' }, $unset: { clusterRef: 1, cluster: 1 } })

  const pending = await Listing.find({ status: 'listed' }).sort({ createdAt: 1 }).lean()
  const weeks = [...new Set(pending.map((l) => l.harvestWeek))]
  const assigned = new Set()
  const created = []

  for (const week of weeks) {
    const inWeek = pending.filter((l) => l.harvestWeek === week)
    const points = new Map(inWeek.map((l) => [String(l._id), toLatLng(l.location)]))
    const neighbours = (l) =>
      inWeek.filter((o) => !assigned.has(String(o._id)) && haversineKm(points.get(String(l._id)), points.get(String(o._id))) <= radiusKm).length

    for (;;) {
      // Seed = the unassigned farm with the most unassigned neighbours (densest spot first),
      // so a village isn't split just because its first listing was at the edge.
      const open = inWeek.filter((l) => !assigned.has(String(l._id)))
      if (!open.length) break
      const seed = open.reduce((best, l) => (neighbours(l) > neighbours(best) ? l : best), open[0])

      // 3. Geo query: unassigned farms harvesting the same week, nearest first.
      const nearby = await Listing.find({
        status: 'listed',
        harvestWeek: week,
        _id: { $nin: [...assigned] },
        location: { $nearSphere: { $geometry: seed.location, $maxDistance: radiusKm * 1000 } },
      }).lean()

      const members = []
      let tonnes = 0
      for (const listing of nearby) {
        if (members.length && tonnes + listing.estTonnes > maxTonnes) continue
        members.push(listing)
        tonnes += listing.estTonnes
        assigned.add(String(listing._id))
      }
      if (!members.length) {
        assigned.add(String(seed._id)) // shouldn't happen (the seed is within 0 km of itself); avoid looping
        continue
      }

      const memberPoints = members.map((m) => toLatLng(m.location))
      const center = centroid(memberPoints)
      const { km } = orderStops(memberPoints, center)
      const ready = tonnes >= minTonnes
      const code = `C-${100 + (await nextSequence('cluster'))}`

      const cluster = await Cluster.create({
        code,
        place: seed.village,
        district: seed.district,
        harvestWeek: week,
        center: { type: 'Point', coordinates: [center.lng, center.lat] },
        listings: members.map((m) => m._id),
        farmCount: members.length,
        totalAcres: Math.round(members.reduce((s, m) => s + m.acres, 0) * 10) / 10,
        totalTonnes: Math.round(tonnes * 10) / 10,
        routeKm: Math.round(km * 10) / 10,
        status: ready ? 'ready' : 'forming',
      })
      created.push(cluster)

      // 4. Link farms to the cluster; ready clusters move farms to "clustered".
      const ids = members.map((m) => m._id)
      const clusterInfo = { name: `${code} · ${seed.village}`, farmCount: members.length }
      if (ready) {
        await Listing.updateMany({ _id: { $in: ids } }, { $set: { status: 'clustered', clusterRef: cluster._id, cluster: clusterInfo } })
        // Record "clustered" in history once (rebuilds shouldn't repeat it).
        await Listing.updateMany(
          { _id: { $in: ids }, 'statusHistory.status': { $ne: 'clustered' } },
          { $push: { statusHistory: { status: 'clustered', at: new Date() } } },
        )
      } else {
        await Listing.updateMany({ _id: { $in: ids } }, { $set: { clusterRef: cluster._id, cluster: clusterInfo } })
      }
    }
  }

  return {
    clusters: created.length,
    ready: created.filter((c) => c.status === 'ready').length,
    forming: created.filter((c) => c.status === 'forming').length,
  }
}

/**
 * Rebuild after a listing change without slowing the request. Bursts of changes
 * collapse into one extra rebuild.
 */
let queued = false
export function scheduleRebuild() {
  if (queued) return
  queued = true
  setImmediate(() => {
    queued = false
    withClusterLock(rebuildClusters).catch((error) => console.error('[clustering] rebuild failed:', error))
  })
}

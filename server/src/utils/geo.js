import { RATES } from '../config/rates.js'

const EARTH_KM = 6371

/** Great-circle distance in km between two { lat, lng } points. */
export function haversineKm(a, b) {
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_KM * Math.asin(Math.sqrt(h))
}

/** Approximate road distance. */
export function roadKm(a, b) {
  return haversineKm(a, b) * RATES.roadFactor
}

/** GeoJSON Point → { lat, lng }. */
export function toLatLng(point) {
  return { lat: point.coordinates[1], lng: point.coordinates[0] }
}

export function centroid(points) {
  const n = points.length
  return {
    lat: points.reduce((s, p) => s + p.lat, 0) / n,
    lng: points.reduce((s, p) => s + p.lng, 0) / n,
  }
}

/**
 * Orders stops with a nearest-neighbour walk that ends near `end` (the plant):
 * start from the stop farthest from the plant, then always go to the closest
 * remaining stop. Good enough for 3–8 stops. Returns { order, km } where km is
 * the road distance between the stops.
 */
export function orderStops(stops, end) {
  if (stops.length === 0) return { order: [], km: 0 }
  const remaining = stops.map((s, i) => ({ ...s, i }))
  remaining.sort((a, b) => haversineKm(b, end) - haversineKm(a, end))
  const order = [remaining.shift()]
  let km = 0
  while (remaining.length) {
    const last = order[order.length - 1]
    remaining.sort((a, b) => haversineKm(last, a) - haversineKm(last, b))
    const next = remaining.shift()
    km += roadKm(last, next)
    order.push(next)
  }
  return { order: order.map((s) => s.i), km }
}

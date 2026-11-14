import { useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '../../lib/cn'
import { useHomeCopy } from './useHomeCopy'

/**
 * Real street map (Bhawanigarh, Sangrur) where example farm listings slide
 * into three pickup clusters. Leaflet loads only when the map is near the
 * viewport, so it costs nothing on first page load.
 */
export function ClusterMap() {
  const m = useHomeCopy().t.system.map
  const frameRef = useRef(null)
  const mapRef = useRef(null)
  const near = useInView(frameRef, { once: true, margin: '400px 0px' })
  const inView = useInView(frameRef, { once: true, margin: '0px 0px -25% 0px' })
  const reduce = useReducedMotion()
  const [status, setStatus] = useState('idle') // idle | loading | ready | error
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (!near || mapRef.current) return
    let cancelled = false
    setStatus('loading')
    import('./clusterMapSetup')
      .then(({ createClusterMap }) => {
        if (cancelled || !frameRef.current) return
        mapRef.current = createClusterMap(frameRef.current.querySelector('[data-map]'))
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
    }
  }, [near])

  // Cluster tags on the map follow the site language.
  useEffect(() => {
    if (status !== 'ready') return
    frameRef.current?.querySelectorAll('.pl-label[data-cluster]').forEach((el) => {
      el.textContent = m.clusterLabel(Number(el.dataset.cluster), Number(el.dataset.farms))
    })
  }, [status, m])

  // Remove the map when the section unmounts.
  useEffect(() => () => mapRef.current?.remove(), [])

  useEffect(() => {
    if (status !== 'ready') return
    if (reduce) return setSettled(true)
    if (!inView) return
    const t = setTimeout(() => setSettled(true), 400)
    return () => clearTimeout(t)
  }, [status, inView, reduce])

  function replay() {
    setSettled(false)
    setTimeout(() => setSettled(true), 700)
  }

  return (
    <figure className="m-0">
      <div
        ref={frameRef}
        className={cn(
          'pl-map relative h-[460px] overflow-hidden border border-soil/20 bg-survey shadow-[0_40px_70px_-45px_rgb(18_36_26/0.5)] sm:h-[620px]',
          settled && 'is-settled',
        )}
      >
        <div
          data-map
          role="region"
          aria-label="Map of Bhawanigarh, Sangrur, showing three example pickup clusters of nearby farms"
          className="absolute inset-0"
        />

        {status !== 'ready' && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="label text-stone">{status === 'error' ? m.offline : m.loading}</span>
          </div>
        )}

      </div>
      <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-sm text-stone">
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>{m.caption}</span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2.5 bg-forest" />
            <span className="label text-xs">{m.farm}</span>
            <span aria-hidden="true" className="ml-2 size-3 rounded-full border-2 border-dashed border-forest bg-straw/30" />
            <span className="label text-xs">{m.cluster}</span>
          </span>
        </span>
        <button type="button" onClick={replay} disabled={status !== 'ready'} className="label min-h-11 shrink-0 text-forest underline underline-offset-4 disabled:opacity-40">
          {m.replay}
        </button>
      </figcaption>
    </figure>
  )
}

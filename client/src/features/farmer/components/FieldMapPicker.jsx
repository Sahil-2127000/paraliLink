import { useEffect, useRef, useState } from 'react'
import { T } from '../copy'

const PUNJAB_CENTER = [30.9, 75.85]

/**
 * Map for choosing a field: tap the map or drag the pin, or use the phone's
 * GPS. Reports { lat, lng } through onChange.
 */
export function FieldMapPicker({ value, initialCenter, language, onChange }) {
  const holder = useRef(null)
  const picker = useRef(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const [status, setStatus] = useState('loading')
  const [gps, setGps] = useState({ busy: false, error: '' })

  useEffect(() => {
    let cancelled = false
    import('../fieldMapSetup')
      .then(({ createFieldPicker }) => {
        if (cancelled || !holder.current) return
        const start = value ? [value.lat, value.lng] : initialCenter ?? PUNJAB_CENTER
        picker.current = createFieldPicker(holder.current, {
          center: start,
          zoom: value ? 16 : initialCenter ? 14 : 8,
          pin: value ? [value.lat, value.lng] : null,
          onChange: (p) => onChangeRef.current(p),
        })
        setStatus('ready')
      })
      .catch(() => !cancelled && setStatus('error'))
    return () => {
      cancelled = true
      picker.current?.destroy()
      picker.current = null
    }
    // The map is created once; later pin moves go through picker.setPin.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function locateMe() {
    if (!('geolocation' in navigator)) {
      setGps({ busy: false, error: 'This phone can’t share its location. Tap the map instead.' })
      return
    }
    setGps({ busy: true, error: '' })
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        picker.current?.setPin(pos.coords.latitude, pos.coords.longitude)
        setGps({ busy: false, error: '' })
      },
      () => setGps({ busy: false, error: 'Couldn’t get your location. Tap your field on the map instead.' }),
      { enableHighAccuracy: true, timeout: 12000 },
    )
  }

  return (
    <div>
      <div className="relative h-[300px] overflow-hidden border border-soil/20 bg-survey lg:h-[460px]">
        <div ref={holder} className="absolute inset-0" role="application" aria-label="Map. Tap your field or drag the pin to it." />
        {status !== 'ready' && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="label text-stone">{status === 'error' ? 'Map unavailable' : 'Loading map…'}</span>
          </div>
        )}
        {value && (
          <span className="label pointer-events-none absolute top-2.5 left-2.5 z-[500] bg-paper/95 px-2 py-1 text-xs">
            {value.lat.toFixed(4)}° N / {value.lng.toFixed(4)}° E
          </span>
        )}
        <button
          type="button"
          onClick={locateMe}
          disabled={gps.busy || status !== 'ready'}
          className="label absolute right-2.5 bottom-6 z-[500] flex h-11 items-center gap-2 bg-forest px-3.5 text-paper disabled:opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
          </svg>
          <span lang={language} className="pa text-[15px] font-semibold tracking-normal normal-case">
            {gps.busy ? '…' : T.myLocation[language]}
          </span>
        </button>
      </div>
      <p className="mt-2 min-h-5 text-sm text-stone-dark" aria-live="polite">
        {gps.error || (value ? 'Pin placed. Drag it if it’s not exactly on your field.' : 'Tap your field on the map, or use My location.')}
      </p>
    </div>
  )
}

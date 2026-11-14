import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { formatNumber, formatRupees } from '../../../lib/format'
import { useAsync } from '../../../lib/useAsync'
import { useAuth } from '../../auth/AuthContext'
import { FieldError } from '../../auth/components/FieldError'
import { Bilingual } from '../components/Bilingual'
import { FieldMapPicker } from '../components/FieldMapPicker'
import { ErrorBlock } from '../components/LoadState'
import { FarmerPage, PageHeader } from '../components/PageHeader'
import { BOOKING_STATUS, PUNJAB_DISTRICTS, shortDate, T } from '../copy'
import { farmerApi } from '../farmerApi'
import { reverseGeocode } from '../reverseGeocode'

const DAY = 86_400_000
const toInputDate = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
const TONE = {
  straw: 'bg-straw text-forest-deep',
  forest: 'bg-forest text-paper',
  danger: 'border border-danger text-danger',
  muted: 'border border-soil/25 text-stone',
}
const MACHINE = { square: { pa: 'ਚੌਰਸ ਗੱਠ', en: 'Square baler' }, round: { pa: 'ਗੋਲ ਗੱਠ', en: 'Round baler' }, other: { pa: 'ਹੋਰ', en: 'Baler' } }

function Phone({ phone, name, language }) {
  return (
    <a
      href={`tel:${phone}`}
      aria-label={`${T.call.en} ${name}`}
      className="flex h-12 items-center justify-center gap-2 border border-forest px-3 text-forest transition-colors hover:bg-forest hover:text-paper"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
      </svg>
      <span lang={language} className="pa font-semibold">
        {T.call[language]}
      </span>
    </a>
  )
}

function BalerCard({ baler, language, acres, onRequest, busy }) {
  return (
    <li className="border-b border-soil/15 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-lg font-semibold">{baler.name}</p>
          <p className="text-[13px] text-stone-dark">
            {baler.vehicle} · <span lang={language}>{(MACHINE[baler.machine] ?? MACHINE.other)[language]}</span> · {formatNumber(baler.distanceKm, 0)} km
          </p>
        </div>
        <div className="shrink-0 text-right">
          {baler.ratePerAcre != null ? (
            <>
              <p className="display text-3xl">{formatRupees(baler.ratePerAcre)}</p>
              <p className="text-xs text-stone">{language === 'en' ? 'per acre' : 'ਪ੍ਰਤੀ ਏਕੜ'}</p>
            </>
          ) : (
            <p className="text-sm text-stone">{language === 'en' ? 'Rate on call' : 'ਰੇਟ ਫ਼ੋਨ ’ਤੇ'}</p>
          )}
        </div>
      </div>
      {baler.estCost != null && (
        <p className="mt-1.5 text-sm text-stone-dark">
          {formatNumber(acres, 1)} {language === 'en' ? 'acres' : 'ਏਕੜ'} ≈ <strong className="text-soil">{formatRupees(baler.estCost)}</strong>
        </p>
      )}
      <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
        <Phone phone={baler.phone} name={baler.name} language={language} />
        <button
          type="button"
          disabled={busy}
          onClick={() => onRequest(baler)}
          className="flex h-12 items-center justify-between bg-straw px-4 text-forest-deep transition-colors hover:bg-straw-light disabled:opacity-60"
        >
          <span lang={language} className="pa font-bold">
            {T.request[language]}
          </span>
          <span aria-hidden="true">{busy ? '…' : '→'}</span>
        </button>
      </div>
    </li>
  )
}

function BookingRow({ booking, language, onCancel, busy }) {
  const st = BOOKING_STATUS[booking.status] ?? BOOKING_STATUS.requested
  const open = ['requested', 'accepted'].includes(booking.status)
  return (
    <li className="border-b border-soil/15 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            {booking.baler?.name} · {booking.baler?.vehicle}
          </p>
          <p className="text-[13px] text-stone-dark">
            {shortDate(booking.date, language)} · {booking.village} · {formatNumber(booking.acres, 1)} {language === 'en' ? 'acres' : 'ਏਕੜ'}
            {booking.estCost != null && ` · ≈ ${formatRupees(booking.estCost)}`}
          </p>
        </div>
        <span lang={language} className={cn('pa shrink-0 px-2 py-1 text-xs font-semibold', TONE[st.tone])}>
          {st[language]}
        </span>
      </div>
      {booking.declineReason && <p className="mt-1 text-[13px] text-danger">{booking.declineReason}</p>}
      <div className="mt-2.5 flex flex-wrap gap-2">
        {booking.baler?.phone && open && <Phone phone={booking.baler.phone} name={booking.baler.name} language={language} />}
        {['accepted', 'done'].includes(booking.status) && (
          <Link to={`/farmer/sell?booking=${booking.id}`} className="flex h-12 items-center gap-2 bg-forest px-4 font-semibold text-paper hover:bg-forest-deep">
            <span lang={language} className="pa">
              {language === 'en' ? 'Bales ready? List them' : 'ਗੱਠਾਂ ਤਿਆਰ? ਵੇਚਣ ਲਈ ਪਾਓ'}
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        )}
        {open && (
          <button type="button" disabled={busy} onClick={() => onCancel(booking)} className="h-12 px-3 text-sm text-stone-dark underline underline-offset-4 hover:text-danger disabled:opacity-60">
            {language === 'en' ? 'Cancel booking' : 'ਬੁਕਿੰਗ ਰੱਦ ਕਰੋ'}
          </button>
        )}
      </div>
    </li>
  )
}

/**
 * Farmers arrange baling themselves: call a baler they know, or find a
 * registered baler near the field and send a booking request for a day.
 * The baler is paid directly by the farmer.
 */
export default function BalerBookingPage() {
  const { user } = useAuth()
  const language = user.language
  const { data: mine, loading: mineLoading } = useAsync((signal) => farmerApi.mine(signal))
  const bookingsQ = useAsync((signal) => farmerApi.bookings(signal))
  const lastPlace = mine?.listings?.[0]?.location ?? bookingsQ.data?.bookings?.[0]?.location

  const [pin, setPin] = useState(null)
  const [village, setVillage] = useState('')
  const [district, setDistrict] = useState('')
  const [acres, setAcres] = useState(5)
  const [date, setDate] = useState(() => toInputDate(new Date(Date.now() + DAY)))
  const [balers, setBalers] = useState(null)
  const [searchErr, setSearchErr] = useState(null)
  const [errors, setErrors] = useState({})
  const [busyId, setBusyId] = useState(null)
  const [notice, setNotice] = useState(null)
  const touched = useRef({ village: false, district: false })
  const today = useMemo(() => new Date(), [])

  // Village/district from the pin, unless typed.
  useEffect(() => {
    if (!pin) return
    const controller = new AbortController()
    const t = setTimeout(() => {
      reverseGeocode(pin.lat, pin.lng, controller.signal)
        .then(({ village: v, district: d }) => {
          if (v && !touched.current.village) setVillage(v)
          if (d && !touched.current.district) setDistrict(d)
        })
        .catch(() => {})
    }, 700)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [pin])

  // Balers near the pin; refreshed when the pin or acres change.
  useEffect(() => {
    if (!pin) return
    const controller = new AbortController()
    const t = setTimeout(() => {
      setSearchErr(null)
      farmerApi
        .balersNear({ ...pin, acres }, controller.signal)
        .then((d) => setBalers(d.balers))
        .catch((err) => err.name !== 'AbortError' && setSearchErr(err))
    }, 300)
    return () => {
      clearTimeout(t)
      controller.abort()
    }
  }, [pin, acres])

  async function request(baler) {
    const next = {}
    if (village.trim().length < 2) next.village = language === 'en' ? 'Enter the village name.' : 'ਪਿੰਡ ਦਾ ਨਾਮ ਲਿਖੋ।'
    if (!district) next.district = language === 'en' ? 'Choose the district.' : 'ਜ਼ਿਲ੍ਹਾ ਚੁਣੋ।'
    setErrors(next)
    if (Object.keys(next).length) return
    setBusyId(baler.id)
    setNotice(null)
    try {
      await farmerApi.bookBaler({ balerId: baler.id, lat: pin.lat, lng: pin.lng, village: village.trim(), district, acres, date })
      setNotice({
        text:
          language === 'en'
            ? `Request sent to ${baler.name} for ${shortDate(date)}. You’ll see here when they reply.`
            : `${baler.name} ਨੂੰ ${shortDate(date, 'pa')} ਲਈ ਬੁਕਿੰਗ ਭੇਜ ਦਿੱਤੀ। ਜਵਾਬ ਇੱਥੇ ਦਿਸੇਗਾ।`,
      })
      bookingsQ.reload()
    } catch (err) {
      setNotice({ text: err.details?.fields ? Object.values(err.details.fields).join(' ') : err.message, error: true })
    } finally {
      setBusyId(null)
    }
  }

  async function cancel(booking) {
    setBusyId(booking.id)
    try {
      await farmerApi.cancelBooking(booking.id)
      bookingsQ.reload()
    } catch (err) {
      setNotice({ text: err.message, error: true })
    } finally {
      setBusyId(null)
    }
  }

  // Open bookings first (soonest day first), then the rest, newest first.
  const isOpen = (b) => ['requested', 'accepted'].includes(b.status)
  const bookings = [...(bookingsQ.data?.bookings ?? [])].sort((a, b) =>
    isOpen(a) !== isOpen(b) ? (isOpen(a) ? -1 : 1) : isOpen(a) ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date),
  )

  return (
    <FarmerPage>
      <PageHeader speak={`${T.bookBaler[language]}. ${T.payBaler[language]}.`} language={language} />
      <h1 className="pt-3 lg:pt-6">
        <span lang={language} className="pa block text-3xl font-bold lg:text-4xl">
          {T.bookBaler[language]}
        </span>
        {language !== 'en' && <span className="display mt-1 block text-3xl text-sage">Book a baler</span>}
      </h1>
      <p className="mt-2 max-w-2xl text-stone-dark">
        {language === 'en'
          ? 'Call a baler you know, or ask one registered near your field. You agree the day and pay the baler directly; then list the bales here so an industry can buy them.'
          : 'ਆਪਣੇ ਜਾਣੂ ਬੇਲਰ ਨੂੰ ਫ਼ੋਨ ਕਰੋ, ਜਾਂ ਖੇਤ ਦੇ ਨੇੜੇ ਰਜਿਸਟਰਡ ਬੇਲਰ ਨੂੰ ਬੁਕਿੰਗ ਭੇਜੋ। ਦਿਨ ਤੈਅ ਕਰੋ ਅਤੇ ਬੇਲਰ ਨੂੰ ਪੈਸੇ ਸਿੱਧੇ ਦਿਓ; ਫਿਰ ਗੱਠਾਂ ਇੱਥੇ ਵੇਚਣ ਲਈ ਪਾਓ।'}
      </p>

      {notice && (
        <div role="status" className={cn('mt-4 border-l-[3px] px-4 py-3 text-sm', notice.error ? 'border-danger bg-[#f4dfd6] text-[#6e1f12]' : 'border-forest bg-sage-light text-forest-deep')}>
          {notice.text}
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <section aria-labelledby="field-title" className="min-w-0">
          <h2 id="field-title">
            <Bilingual copy={T.whichField} language={language} nativeClassName="text-xl" englishClassName="text-xs" />
          </h2>
          <div className="mt-2">
            {mineLoading ? (
              <div className="h-[300px] animate-pulse bg-husk lg:h-[380px]" role="status" aria-label="Loading map" />
            ) : (
              <FieldMapPicker value={pin} initialCenter={lastPlace ? [lastPlace.lat, lastPlace.lng] : undefined} language={language} onChange={setPin} />
            )}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="b-village" className="label text-stone-dark">
                {language === 'en' ? 'Village' : 'ਪਿੰਡ · Village'}
              </label>
              <input
                id="b-village"
                value={village}
                onChange={(e) => {
                  touched.current.village = true
                  setVillage(e.target.value)
                }}
                aria-invalid={Boolean(errors.village)}
                aria-describedby="b-village-error"
                className="mt-1.5 h-12 w-full border-b-2 border-soil bg-paper-light px-3.5 font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
              />
              <FieldError id="b-village-error" message={errors.village} />
            </div>
            <div>
              <label htmlFor="b-district" className="label text-stone-dark">
                {language === 'en' ? 'District' : 'ਜ਼ਿਲ੍ਹਾ · District'}
              </label>
              <select
                id="b-district"
                value={district}
                onChange={(e) => {
                  touched.current.district = true
                  setDistrict(e.target.value)
                }}
                aria-invalid={Boolean(errors.district)}
                aria-describedby="b-district-error"
                className="mt-1.5 h-12 w-full border-b-2 border-soil bg-paper-light px-3 font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
              >
                <option value="">Choose…</option>
                {PUNJAB_DISTRICTS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <FieldError id="b-district-error" message={errors.district} />
            </div>
            <div>
              <span id="b-acres" className="label text-stone-dark">
                {language === 'en' ? 'Acres' : 'ਏਕੜ · Acres'}
              </span>
              <div role="group" aria-labelledby="b-acres" className="mt-1.5 flex h-12 items-center justify-between border-b-2 border-soil bg-paper-light">
                <button type="button" aria-label="Fewer acres" onClick={() => setAcres((a) => Math.max(0.5, a - 0.5))} className="grid h-full w-12 place-items-center text-2xl">
                  −
                </button>
                <span className="display text-3xl tabular-nums" aria-live="polite">
                  {formatNumber(acres, acres % 1 ? 1 : 0)}
                </span>
                <button type="button" aria-label="More acres" onClick={() => setAcres((a) => Math.min(200, a + 0.5))} className="grid h-full w-12 place-items-center text-2xl">
                  +
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="b-date" className="label text-stone-dark">
                {language === 'en' ? 'Which day?' : 'ਕਿਸ ਦਿਨ? · Day'}
              </label>
              <input
                id="b-date"
                type="date"
                value={date}
                min={toInputDate(today)}
                max={toInputDate(new Date(today.getTime() + 45 * DAY))}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1.5 h-12 w-full border-b-2 border-soil bg-paper-light px-3.5 font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="balers-title" className="min-w-0">
          <h2 id="balers-title" className="flex items-baseline justify-between gap-3">
            <Bilingual copy={T.findBaler} language={language} nativeClassName="text-xl" englishClassName="text-xs" />
            {balers && <span className="text-sm text-stone">{balers.length} · 50 km</span>}
          </h2>
          <p className="mt-1 border-l-[3px] border-straw bg-husk px-3 py-2 text-[13px] text-stone-dark">
            <span lang={language} className="pa font-semibold text-soil">
              {T.payBaler[language]}
            </span>
            {language !== 'en' && ' · You pay the baler directly'}
          </p>
          {!pin && <p className="mt-4 border border-dashed border-soil/30 p-5 text-center text-sm text-stone-dark">{language === 'en' ? 'Tap your field on the map to see balers nearby.' : 'ਨੇੜੇ ਦੇ ਬੇਲਰ ਦੇਖਣ ਲਈ ਨਕਸ਼ੇ ’ਤੇ ਆਪਣਾ ਖੇਤ ਚੁਣੋ।'}</p>}
          {searchErr && <ErrorBlock error={searchErr} />}
          {pin && balers && balers.length === 0 && (
            <p className="mt-4 border border-dashed border-soil/30 p-5 text-center text-sm text-stone-dark">
              {language === 'en' ? 'No registered baler within 50 km yet. Call a baler you know, then list your bales.' : '50 km ਵਿੱਚ ਹਾਲੇ ਕੋਈ ਰਜਿਸਟਰਡ ਬੇਲਰ ਨਹੀਂ। ਆਪਣੇ ਜਾਣੂ ਬੇਲਰ ਨੂੰ ਫ਼ੋਨ ਕਰੋ, ਫਿਰ ਗੱਠਾਂ ਵੇਚਣ ਲਈ ਪਾਓ।'}
            </p>
          )}
          {pin && balers?.length > 0 && (
            <ul className="mt-2 border-t-2 border-forest">
              {balers.map((b) => (
                <BalerCard key={b.id} baler={b} language={language} acres={acres} busy={busyId === b.id} onRequest={request} />
              ))}
            </ul>
          )}
        </section>
      </div>

      <section aria-labelledby="bookings-title" className="mt-10 lg:max-w-[760px]">
        <h2 id="bookings-title">
          <Bilingual copy={T.myBookings} language={language} nativeClassName="text-xl" englishClassName="text-xs" />
        </h2>
        {bookingsQ.error && <ErrorBlock error={bookingsQ.error} onRetry={bookingsQ.reload} />}
        {bookingsQ.data && bookings.length === 0 && (
          <p className="mt-3 border border-dashed border-soil/30 p-5 text-center text-sm text-stone-dark">{language === 'en' ? 'No bookings yet.' : 'ਹਾਲੇ ਕੋਈ ਬੁਕਿੰਗ ਨਹੀਂ।'}</p>
        )}
        {bookings.length > 0 && (
          <ul className="mt-2 border-t border-soil/15">
            {bookings.map((b) => (
              <BookingRow key={b.id} booking={b} language={language} busy={busyId === b.id} onCancel={cancel} />
            ))}
          </ul>
        )}
      </section>
    </FarmerPage>
  )
}

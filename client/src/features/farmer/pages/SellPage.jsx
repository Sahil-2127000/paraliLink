import { m, useReducedMotion } from 'motion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { formatNumber, formatRupees } from '../../../lib/format'
import { EASE } from '../../../lib/motion'
import { useAsync } from '../../../lib/useAsync'
import { useAuth } from '../../auth/AuthContext'
import { FieldError } from '../../auth/components/FieldError'
import { Bilingual } from '../components/Bilingual'
import { FieldMapPicker } from '../components/FieldMapPicker'
import { FarmerPage, PageHeader } from '../components/PageHeader'
import { BOOKING_STATUS, PUNJAB_DISTRICTS, shortDate, T, TONNES_PER_ACRE } from '../copy'
import { farmerApi } from '../farmerApi'
import { reverseGeocode } from '../reverseGeocode'

const DAY = 86_400_000
const toInputDate = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)

function Slab({ language, copy, disabled, busy, type = 'button', onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      className="group label flex h-[58px] w-full items-center justify-between bg-straw px-5 text-[13px] text-forest-deep transition-colors hover:bg-straw-light disabled:cursor-not-allowed disabled:bg-husk disabled:text-stone"
    >
      <span>
        <span lang={language} className="pa text-[17px] font-bold tracking-normal normal-case">
          {copy[language]}
        </span>
        {language !== 'en' && <span lang="en"> · {copy.en}</span>}
      </span>
      {busy ? (
        <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1.5">
          →
        </span>
      )}
    </button>
  )
}

function StepTitle({ copy, language }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  useEffect(() => ref.current?.focus({ preventScroll: true }), [copy])
  const anim = reduce ? {} : { initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease: EASE } }
  return (
    <m.h1 {...anim} ref={ref} tabIndex={-1} className="outline-none">
      <span lang={language} className="pa block text-[30px] leading-tight font-bold">
        {copy[language]}
      </span>
      {language !== 'en' && <span className="display mt-1.5 block text-[28px] text-sage">{copy.en}</span>}
    </m.h1>
  )
}

export default function SellPage() {
  const { user } = useAuth()
  const language = user.language
  const { data: mine, loading: mineLoading } = useAsync((signal) => farmerApi.mine(signal))
  const { data: summary } = useAsync((signal) => farmerApi.summary(signal))
  const { data: bookingData } = useAsync((signal) => farmerApi.bookings(signal))
  const [params] = useSearchParams()
  const lastPlace = mine?.listings?.[0]
  const bookings = (bookingData?.bookings ?? []).filter((b) => ['accepted', 'requested', 'done'].includes(b.status))
  const rate = summary?.farmerRate ?? 1800
  const advancePct = summary?.advancePct ?? 25
  const balanceDays = summary?.balanceDays ?? 7

  const [step, setStep] = useState(0)
  const [pin, setPin] = useState(null)
  const [village, setVillage] = useState('')
  const [district, setDistrict] = useState('')
  const [fieldName, setFieldName] = useState('')
  const [acres, setAcres] = useState(5)
  const [harvest, setHarvest] = useState(() => toInputDate(new Date()))
  const [bales, setBales] = useState('')
  const [baledBy, setBaledBy] = useState(null) // 'own' | 'app'
  const [ownName, setOwnName] = useState('')
  const [ownPhone, setOwnPhone] = useState('')
  const [bookingId, setBookingId] = useState(null)
  const prefilled = useRef(false)
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState(null)
  const touched = useRef({ village: false, district: false })

  // Fill village/district from the pin unless the farmer already typed them.
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

  // Coming from a baler booking ("bales ready? list them"): start with that field and baler.
  useEffect(() => {
    const id = params.get('booking')
    if (!id || prefilled.current || !bookingData) return
    const b = bookingData.bookings.find((x) => x.id === id)
    if (!b) return
    prefilled.current = true
    setPin(b.location)
    setVillage(b.village)
    setDistrict(b.district)
    touched.current = { village: true, district: true }
    setAcres(b.acres)
    setBaledBy('app')
    setBookingId(b.id)
    if (new Date(b.date) > new Date()) setHarvest(toInputDate(new Date(b.date)))
  }, [params, bookingData])

  const tonnes = Math.round(acres * TONNES_PER_ACRE * 10) / 10
  const estimate = tonnes * rate
  const today = useMemo(() => new Date(), [])
  const readyChips = [
    { copy: T.readyNow, date: today },
    { copy: T.tomorrow, date: new Date(today.getTime() + DAY) },
    { copy: T.inThreeDays, date: new Date(today.getTime() + 3 * DAY) },
  ]

  function goLocation() {
    const next = {}
    if (!pin) next.pin = 'Tap your field on the map.'
    if (village.trim().length < 2) next.village = 'Enter the village name.'
    if (!district) next.district = 'Choose the district.'
    setErrors(next)
    if (!Object.keys(next).length) setStep(1)
  }

  async function submit(e) {
    e.preventDefault()
    if (!baledBy) return setErrors({ baledBy: language === 'en' ? 'Choose who is baling the field.' : 'ਚੁਣੋ ਕਿ ਗੱਠਾਂ ਕੌਣ ਬਣਾ ਰਿਹਾ ਹੈ।' })
    const phone = ownPhone.replace(/\D/g, '').replace(/^91(?=\d{10}$)/, '')
    if (baledBy === 'own' && phone && !/^[6-9]\d{9}$/.test(phone)) return setErrors({ ownPhone: 'Enter a 10-digit mobile number, or leave it empty.' })
    setBusy(true)
    setErrors({})
    try {
      const data = await farmerApi.create({
        lat: pin.lat,
        lng: pin.lng,
        village: village.trim(),
        district,
        acres,
        harvestDate: harvest,
        baledBy,
        ...(bales ? { bales: Number(bales) } : {}),
        ...(baledBy === 'own' && ownName.trim() ? { ownBalerName: ownName.trim() } : {}),
        ...(baledBy === 'own' && phone ? { ownBalerPhone: phone } : {}),
        ...(baledBy === 'app' && bookingId ? { bookingId } : {}),
        ...(fieldName.trim() ? { fieldName: fieldName.trim() } : {}),
      })
      setCreated(data.listing)
      setStep(3)
    } catch (err) {
      setErrors({ form: err.details?.fields ? Object.values(err.details.fields).join(' ') : err.message })
    } finally {
      setBusy(false)
    }
  }

  if (step === 3 && created) {
    return (
      <div className="flex flex-1 flex-col bg-forest px-5.5 pt-6 pb-6 text-paper lg:mx-auto lg:my-10 lg:w-full lg:max-w-[720px] lg:flex-none lg:p-12">
        <span className="label text-sage">{created.label} · created</span>
        <span className="mt-16 grid size-24 place-items-center bg-straw">
          <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#12241A" strokeWidth="2.6" strokeLinecap="square" aria-hidden="true">
            <path d="M4 12.5 9.5 18 20 6" />
          </svg>
        </span>
        <h1 className="mt-9">
          <span lang={language} className="pa block text-[34px] leading-tight font-bold">
            {T.listed[language]}
          </span>
          {language !== 'en' && <span className="display mt-2 block text-[40px] text-straw-light">Straw listed.</span>}
        </h1>
        <p className="mt-4.5 leading-relaxed text-sage-light">
          Industries near you can now book your bales. When one does, you get a {advancePct}% advance and a truck pickup date by SMS. The rest is paid
          within {balanceDays} days of the truck weighing your straw.
        </p>
        <dl className="mt-6.5 grid grid-cols-3 border-t border-paper/20">
          {[
            ['Acres', formatNumber(created.acres, 1)],
            [created.bales ? 'Bales' : 'Straw', created.bales ? formatNumber(created.bales) : `≈ ${formatNumber(created.estTonnes, 1)} t`],
            ['Ready', shortDate(created.harvestDate)],
          ].map(([k, v]) => (
            <div key={k} className="pt-3">
              <dt className="label text-sage">{k}</dt>
              <dd className="mt-1 text-lg font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto grid gap-2 pt-10">
          <Link to={`/farmer/listings/${created.id}`} className="label flex h-[58px] items-center justify-between bg-paper px-5 text-forest-deep">
            See this listing <span aria-hidden="true">→</span>
          </Link>
          <Link to="/farmer" className="label flex h-[58px] items-center justify-between border border-paper/50 px-5 text-paper hover:bg-paper/10">
            <span>
              <span lang={language} className="pa text-[17px] font-bold tracking-normal normal-case">
                {T.backHome[language]}
              </span>
              {language !== 'en' && ' · Back to home'}
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    )
  }

  const titles = [T.whereField, T.howManyAcres, T.whoBales]

  return (
    <FarmerPage>
      <PageHeader back={step === 0 ? '/farmer' : undefined} speak={titles[step][language]} language={language} />
      {step > 0 && (
        <div className="pt-3">
          <button type="button" onClick={() => setStep(step - 1)} className="label min-h-11 text-forest underline underline-offset-4">
            ← Back
          </button>
        </div>
      )}
      <div className="mt-3 grid grid-cols-3 gap-1 lg:max-w-[1100px]" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn('h-[3px] transition-colors duration-500', i <= step ? 'bg-forest' : 'bg-soil/12')} />
        ))}
      </div>

      <div className="flex flex-1 flex-col pt-6 lg:max-w-[1100px] lg:pt-8">
        <StepTitle copy={titles[step]} language={language} />

        {step === 0 && (
          <div className="mt-5 flex flex-1 flex-col lg:grid lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-x-10">
            <div>
            {mineLoading ? (
              <div className="h-[300px] animate-pulse bg-husk lg:h-[460px]" role="status" aria-label="Loading map" />
            ) : (
            <FieldMapPicker
              value={pin}
              initialCenter={lastPlace ? [lastPlace.location.lat, lastPlace.location.lng] : undefined}
              language={language}
              onChange={(p) => {
                setPin(p)
                setErrors((er) => ({ ...er, pin: undefined }))
              }}
            />
            )}
            <FieldError id="pin-error" message={errors.pin} />
            </div>
            <div className="flex flex-col">

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label htmlFor="village" className="label text-stone-dark">
                  {language === 'en' ? 'Village' : 'ਪਿੰਡ · Village'}
                </label>
                <input
                  id="village"
                  value={village}
                  onChange={(e) => {
                    touched.current.village = true
                    setVillage(e.target.value)
                  }}
                  aria-invalid={Boolean(errors.village)}
                  aria-describedby="village-error"
                  className="mt-1.5 h-13 w-full border-b-2 border-soil bg-paper-light px-3.5 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
                />
                <FieldError id="village-error" message={errors.village} />
              </div>
              <div>
                <label htmlFor="district" className="label text-stone-dark">
                  {language === 'en' ? 'District' : 'ਜ਼ਿਲ੍ਹਾ · District'}
                </label>
                <select
                  id="district"
                  value={district}
                  onChange={(e) => {
                    touched.current.district = true
                    setDistrict(e.target.value)
                  }}
                  aria-invalid={Boolean(errors.district)}
                  aria-describedby="district-error"
                  className="mt-1.5 h-13 w-full border-b-2 border-soil bg-paper-light px-3 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
                >
                  <option value="">Choose…</option>
                  {PUNJAB_DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
                <FieldError id="district-error" message={errors.district} />
              </div>
            </div>
            <label htmlFor="fieldName" className="label text-stone-dark">
              Field name (optional) · e.g. “Canal field”
            </label>
            <input
              id="fieldName"
              value={fieldName}
              maxLength={60}
              onChange={(e) => setFieldName(e.target.value)}
              className="mt-1.5 h-13 w-full border-b-2 border-soil bg-paper-light px-3.5 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
            />
            <p className="mt-2 text-[11px] text-stone">Village lookup © OpenStreetMap contributors (Nominatim).</p>
            <div className="mt-auto pt-8 lg:mt-6 lg:pt-2">
              <Slab language={language} copy={T.thisIsField} onClick={goLocation} />
            </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-8 flex flex-1 flex-col lg:max-w-[640px]">
            <div className="flex items-center justify-between border-y border-soil/15 py-4.5">
              <button
                type="button"
                onClick={() => setAcres((a) => Math.max(0.5, a - 0.5))}
                aria-label="Fewer acres"
                className="grid size-[72px] place-items-center border border-soil transition-transform active:scale-95"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-hidden="true">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <p aria-live="polite" className="text-center">
                <span className="display block text-[104px] text-forest tabular-nums">{formatNumber(acres, acres % 1 ? 1 : 0)}</span>
                <Bilingual copy={T.acres} language={language} nativeClassName="text-lg" />
              </p>
              <button
                type="button"
                onClick={() => setAcres((a) => Math.min(200, a + 0.5))}
                aria-label="More acres"
                className="grid size-[72px] place-items-center bg-forest text-paper transition-transform active:scale-95"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1.5">
              {[2, 5, 10, 15].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAcres(q)}
                  aria-pressed={acres === q}
                  className={cn('label h-12 border border-soil/30 transition-colors', acres === q ? 'bg-soil text-paper' : 'hover:bg-husk')}
                >
                  {q} ac
                </button>
              ))}
            </div>
            <label htmlFor="bales" className="mt-5 block">
              <Bilingual copy={T.howManyBales} language={language} nativeClassName="text-base" englishClassName="text-xs" />
            </label>
            <input
              id="bales"
              inputMode="numeric"
              value={bales}
              placeholder={String(Math.round(acres * 96))}
              onChange={(e) => setBales(e.target.value.replace(/\D/g, '').slice(0, 5))}
              className="mt-1.5 h-13 w-full border-b-2 border-soil bg-paper-light px-3.5 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
            />
            <div className="mt-5.5 bg-forest p-4.5 text-paper">
              <p className="label text-sage">Estimated</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-4">
                <span className="display text-[52px] text-straw-light">≈ {formatNumber(tonnes, 1)} t</span>
                <span className="display text-3xl">≈ {formatRupees(estimate)}</span>
              </p>
              <p className="mt-2 text-[13px] leading-normal text-sage-light">
                About 2.4 tonnes per acre at {formatRupees(rate)} per tonne for baled straw. The industry pays {advancePct}% ({formatRupees(estimate * advancePct / 100)})
                when it books, and the rest on the weighed tonnes within {balanceDays} days of pickup.
              </p>
            </div>
            <div className="mt-auto pt-8">
              <Slab language={language} copy={T.next} onClick={() => setStep(2)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={submit} noValidate className="mt-6 flex flex-1 flex-col lg:max-w-[640px]">
            <fieldset aria-describedby="baledBy-error">
              <legend className="sr-only">Who is baling the field</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {[
                  { id: 'own', copy: T.ownBaler, hint: language === 'en' ? 'Someone you already know' : 'ਜਿਸਨੂੰ ਤੁਸੀਂ ਜਾਣਦੇ ਹੋ' },
                  { id: 'app', copy: T.appBaler, hint: language === 'en' ? 'A baler you booked in the app' : 'ਐਪ ਵਿੱਚ ਬੁੱਕ ਕੀਤਾ ਬੇਲਰ' },
                ].map((o) => {
                  const on = baledBy === o.id
                  return (
                    <label
                      key={o.id}
                      className={cn('flex min-h-[76px] cursor-pointer items-center justify-between gap-3 border px-4 py-3 transition-colors', on ? 'border-forest bg-forest text-paper' : 'border-soil/20 bg-paper-light hover:border-soil/40')}
                    >
                      <input
                        type="radio"
                        name="baledBy"
                        value={o.id}
                        checked={on}
                        onChange={() => {
                          setBaledBy(o.id)
                          setErrors((er) => ({ ...er, baledBy: undefined }))
                        }}
                        className="sr-only"
                      />
                      <span>
                        <span lang={language} className="pa block text-lg font-bold">
                          {o.copy[language]}
                        </span>
                        <span className="text-[13px] opacity-80">{o.hint}</span>
                      </span>
                      <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center border-2 border-current">
                        <span className={cn('size-2.5', on && 'bg-straw')} />
                      </span>
                    </label>
                  )
                })}
              </div>
              <FieldError id="baledBy-error" message={errors.baledBy} />
            </fieldset>

            {baledBy === 'own' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="ownName" className="label text-stone-dark">
                    {language === 'en' ? 'Baler’s name (optional)' : 'ਬੇਲਰ ਵਾਲੇ ਦਾ ਨਾਮ (ਜੇ ਚਾਹੋ)'}
                  </label>
                  <input
                    id="ownName"
                    value={ownName}
                    maxLength={80}
                    onChange={(e) => setOwnName(e.target.value)}
                    className="mt-1.5 h-13 w-full border-b-2 border-soil bg-paper-light px-3.5 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
                  />
                </div>
                <div>
                  <label htmlFor="ownPhone" className="label text-stone-dark">
                    {language === 'en' ? 'Baler’s phone (optional)' : 'ਬੇਲਰ ਵਾਲੇ ਦਾ ਫ਼ੋਨ (ਜੇ ਚਾਹੋ)'}
                  </label>
                  <input
                    id="ownPhone"
                    inputMode="tel"
                    value={ownPhone}
                    onChange={(e) => setOwnPhone(e.target.value.replace(/[^\d+\s]/g, '').slice(0, 15))}
                    aria-invalid={Boolean(errors.ownPhone)}
                    aria-describedby="ownPhone-error"
                    className="mt-1.5 h-13 w-full border-b-2 border-soil bg-paper-light px-3.5 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
                  />
                  <FieldError id="ownPhone-error" message={errors.ownPhone} />
                </div>
              </div>
            )}

            {baledBy === 'app' &&
              (bookings.length ? (
                <fieldset className="mt-1">
                  <legend className="label text-stone-dark">{language === 'en' ? 'Which booking?' : 'ਕਿਹੜੀ ਬੁਕਿੰਗ?'}</legend>
                  <div className="mt-1.5 border-t border-soil/15">
                    {bookings.map((b) => {
                      const on = bookingId === b.id
                      const st = BOOKING_STATUS[b.status]
                      return (
                        <label key={b.id} className={cn('flex cursor-pointer items-center justify-between gap-3 border-b border-soil/15 px-3.5 py-3 transition-colors', on ? 'bg-husk' : 'hover:bg-husk/60')}>
                          <input type="radio" name="booking" value={b.id} checked={on} onChange={() => setBookingId(b.id)} className="sr-only" />
                          <span>
                            <span className="block font-semibold">
                              {b.baler?.name} · {b.baler?.vehicle}
                            </span>
                            <span className="text-[13px] text-stone-dark">
                              {shortDate(b.date, language)} · {b.village} · {formatNumber(b.acres, 1)} {language === 'en' ? 'acres' : 'ਏਕੜ'} ·{' '}
                              <span lang={language}>{st?.[language]}</span>
                            </span>
                          </span>
                          <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center border-2 border-current">
                            <span className={cn('size-2.5', on && 'bg-straw')} />
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ) : (
                <div className="border border-dashed border-soil/30 p-4 text-sm text-stone-dark">
                  {language === 'en' ? 'You haven’t booked a baler in the app yet.' : 'ਤੁਸੀਂ ਹਾਲੇ ਐਪ ਵਿੱਚ ਬੇਲਰ ਬੁੱਕ ਨਹੀਂ ਕੀਤਾ।'}{' '}
                  <Link to="/farmer/baler" className="font-semibold text-forest underline underline-offset-4">
                    {T.bookBaler[language]}
                  </Link>
                </div>
              ))}

            <p className="mt-6">
              <Bilingual copy={T.whenReady} language={language} nativeClassName="text-xl" englishClassName="text-xs" stacked />
            </p>
            <fieldset className="mt-2">
              <legend className="sr-only">Ready date</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {readyChips.map((chip) => {
                  const value = toInputDate(chip.date)
                  const selected = harvest === value
                  return (
                    <label
                      key={value}
                      className={cn('flex min-h-[64px] cursor-pointer flex-col justify-center border px-3 text-center transition-colors', selected ? 'border-forest bg-forest text-paper' : 'border-soil/20 hover:bg-husk')}
                    >
                      <input type="radio" name="ready" value={value} checked={selected} onChange={() => setHarvest(value)} className="sr-only" />
                      <span lang={language} className="pa font-bold">
                        {chip.copy[language]}
                      </span>
                      <span className="text-xs opacity-80">{shortDate(chip.date, language)}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <label htmlFor="harvestDate" className="mt-3 block">
              <Bilingual copy={T.pickDate} language={language} nativeClassName="text-sm" englishClassName="text-xs" />
            </label>
            <input
              id="harvestDate"
              type="date"
              value={harvest}
              min={toInputDate(new Date(today.getTime() - 14 * DAY))}
              max={toInputDate(new Date(today.getTime() + 30 * DAY))}
              onChange={(e) => setHarvest(e.target.value)}
              className="mt-1.5 h-13 w-full border-b-2 border-soil bg-paper-light px-3.5 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
            />

            <p className="mt-4 flex justify-between border-t border-soil/15 pt-3 text-sm text-stone-dark">
              <span>
                {village || 'Field'} · {formatNumber(acres, 1)} acres{bales ? ` · ${formatNumber(Number(bales))} bales` : ''}
              </span>
              <span>≈ {formatNumber(tonnes, 1)} t</span>
            </p>
            <FieldError id="form-error" message={errors.form} />

            <div className="mt-auto pt-6">
              <Slab type="submit" language={language} copy={T.submitListing} busy={busy} />
            </div>
          </form>
        )}
      </div>
    </FarmerPage>
  )
}

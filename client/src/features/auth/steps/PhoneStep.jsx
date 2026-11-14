import { useState } from 'react'
import { FieldError } from '../components/FieldError'
import { PrimaryAction } from '../components/PrimaryAction'
import { StepHeading } from '../components/StepHeading'
import { COPY } from '../copy'

/** Shows 10 digits as "98765 43210". */
function formatPhone(digits) {
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits
}

export function PhoneStep({ language, phone, onSubmit }) {
  const [digits, setDigits] = useState(phone.replace(/^\+91/, ''))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError('Enter a valid 10-digit mobile number.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onSubmit(digits)
    } catch (err) {
      setError(err.details?.fields?.phone ?? err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
      <StepHeading copy={COPY.phone} language={language} />

      <label htmlFor="phone" className="label mt-10 text-stone-dark">
        {language === 'en' ? 'Mobile' : 'ਮੋਬਾਈਲ · Mobile'}
      </label>
      <div className="mt-2 flex h-16 items-center gap-3 border-b-2 border-soil bg-paper-light px-4 focus-within:border-forest focus-within:ring-4 focus-within:ring-straw/30">
        <span className="label text-base tracking-wide text-stone">+91</span>
        <input
          id="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="98765 43210"
          value={formatPhone(digits)}
          onChange={(e) => {
            setDigits(e.target.value.replace(/\D/g, '').slice(0, 10))
            setError('')
          }}
          aria-invalid={Boolean(error)}
          aria-describedby="phone-help phone-error"
          className="min-w-0 flex-1 bg-transparent text-2xl font-semibold tracking-wide outline-none placeholder:text-stone/50"
        />
      </div>
      <FieldError id="phone-error" message={error} />
      <p id="phone-help" lang={language} className="mt-2 leading-relaxed text-stone-dark">
        {COPY.phoneHelp[language]}
      </p>

      <div className="mt-auto pt-10">
        <PrimaryAction copy={COPY.sendCode} language={language} busy={busy} disabled={digits.length !== 10} />
      </div>
    </form>
  )
}

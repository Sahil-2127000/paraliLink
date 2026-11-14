import { useEffect, useRef, useState } from 'react'
import { FieldError } from '../components/FieldError'
import { PrimaryAction } from '../components/PrimaryAction'
import { StepHeading } from '../components/StepHeading'
import { COPY } from '../copy'

export function OtpStep({ language, phone, resendIn, devCode, onVerify, onResend, onChangeNumber }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [wait, setWait] = useState(resendIn)
  const inputRef = useRef(null)
  const submitted = useRef('')

  // Resend countdown.
  useEffect(() => setWait(resendIn), [resendIn])
  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  async function verify(value) {
    if (value.length !== 6 || busy) return
    submitted.current = value
    setBusy(true)
    setError('')
    try {
      await onVerify(value)
    } catch (err) {
      setError(err.message)
      setCode('')
      inputRef.current?.focus()
    } finally {
      setBusy(false)
    }
  }

  function onChange(e) {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setCode(value)
    setError('')
    // Submit automatically once all 6 digits are in (once per value).
    if (value.length === 6 && submitted.current !== value) verify(value)
  }

  async function resend() {
    setError('')
    try {
      const next = await onResend()
      setWait(next.resendIn)
      setCode('')
      submitted.current = ''
      inputRef.current?.focus()
    } catch (err) {
      setError(err.message)
      if (err.details?.retryAfter) setWait(err.details.retryAfter)
    }
  }

  const pretty = `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        verify(code)
      }}
      noValidate
      className="flex flex-1 flex-col"
    >
      <StepHeading copy={COPY.otp} language={language} />
      <p className="mt-4 text-stone-dark">
        Sent to <strong className="font-semibold text-soil">{pretty}</strong> ·{' '}
        <button type="button" onClick={onChangeNumber} className="text-forest underline underline-offset-4">
          Change
        </button>
      </p>

      <label htmlFor="otp" className="sr-only">
        6-digit code
      </label>
      <input
        ref={inputRef}
        id="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        autoFocus
        placeholder="······"
        value={code}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby="otp-error"
        className="mt-9 h-21 w-full border-b-2 border-soil bg-paper-light pl-[0.5em] text-center text-4xl font-semibold tracking-[0.5em] tabular-nums outline-none placeholder:text-stone/40 focus:border-forest focus:ring-4 focus:ring-straw/30"
      />
      <FieldError id="otp-error" message={error} />

      <div className="flex items-center justify-between">
        {wait > 0 ? (
          <span className="label text-stone">Resend in 0:{String(wait).padStart(2, '0')}</span>
        ) : (
          <button type="button" onClick={resend} className="label min-h-11 text-forest underline underline-offset-4">
            Send a new code
          </button>
        )}
        <span className="label text-stone">Valid 5 min</span>
      </div>

      {devCode && (
        <p className="label mt-6 border-l-2 border-straw bg-husk px-3 py-2 text-stone-dark">Demo number · code {devCode}</p>
      )}

      <div className="mt-auto pt-10">
        <PrimaryAction copy={COPY.verify} language={language} busy={busy} disabled={code.length !== 6} />
      </div>
    </form>
  )
}

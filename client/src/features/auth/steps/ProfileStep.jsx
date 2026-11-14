import { useState } from 'react'
import { cn } from '../../../lib/cn'
import { FieldError } from '../components/FieldError'
import { PrimaryAction } from '../components/PrimaryAction'
import { StepHeading } from '../components/StepHeading'
import { COPY, ROLE_OPTIONS } from '../copy'

/** Onboarding: pick a role (once) and give a name. */
export function ProfileStep({ language, user, initialRole, onSubmit }) {
  const roleLocked = Boolean(user?.role)
  const [role, setRole] = useState(user?.role ?? initialRole ?? '')
  const [name, setName] = useState(user?.name ?? '')
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (!role) next.role = 'Choose who you are.'
    if (name.trim().length < 2) next.name = 'Please enter your name.'
    setErrors(next)
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await onSubmit({ name: name.trim(), ...(roleLocked ? {} : { role }) })
    } catch (err) {
      setErrors({ form: err.message, ...err.details?.fields })
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-1 flex-col">
      <StepHeading copy={COPY.profile} language={language} />

      <fieldset className="mt-7" aria-describedby="role-error">
        <legend className="sr-only">Role</legend>
        <div className="grid gap-2.5">
          {ROLE_OPTIONS.map((option) => {
            const selected = role === option.id
            const disabled = roleLocked && !selected
            return (
              <label
                key={option.id}
                className={cn(
                  'flex h-24 items-center gap-4 overflow-hidden border pr-4 transition-colors',
                  selected ? 'border-forest bg-forest text-paper' : 'border-soil/15 bg-paper-light',
                  disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
                  !selected && !disabled && 'hover:border-soil/40',
                )}
              >
                <input
                  type="radio"
                  name="role"
                  value={option.id}
                  checked={selected}
                  disabled={disabled}
                  onChange={() => {
                    setRole(option.id)
                    setErrors((er) => ({ ...er, role: undefined }))
                  }}
                  className="sr-only"
                />
                <img src={option.image} alt="" loading="lazy" className="h-full w-23 shrink-0 object-cover" />
                <span className="flex-1">
                  <span lang={language} className="pa block text-[22px] font-bold">
                    {option.label[language]}
                  </span>
                  <span lang="en" className="block text-sm opacity-80">
                    {option.hint}
                  </span>
                </span>
                <span aria-hidden="true" className="grid size-5 place-items-center border-2 border-current">
                  <span className={cn('size-2.5', selected && 'bg-straw')} />
                </span>
              </label>
            )
          })}
        </div>
        <FieldError id="role-error" message={errors.role} />
      </fieldset>

      <label htmlFor="name" className="mt-2 block">
        <span lang={language} className="pa text-lg font-bold">
          {COPY.name[language]}
        </span>
        {language !== 'en' && <span className="label text-stone"> · Your name</span>}
      </label>
      <input
        id="name"
        type="text"
        autoComplete="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          setErrors((er) => ({ ...er, name: undefined }))
        }}
        aria-invalid={Boolean(errors.name)}
        aria-describedby="name-error"
        className="mt-2 h-14 w-full border-b-2 border-soil bg-paper-light px-4 text-lg font-medium outline-none focus:border-forest focus:ring-4 focus:ring-straw/30"
      />
      <FieldError id="name-error" message={errors.name ?? errors.form} />

      <div className="mt-auto pt-8">
        <PrimaryAction copy={COPY.start} language={language} busy={busy} variant="dark" />
      </div>
    </form>
  )
}

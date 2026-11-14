import { useState } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { authApi } from '../../features/auth/authApi'
import { LANGUAGE_OPTIONS } from '../../features/auth/copy'
import { cn } from '../../lib/cn'

const LANG_KEY = 'pl_lang' // same key the sign-in screen uses

/**
 * Punjabi / English switch.
 * - Inside the apps: changes the app at once, then saves the choice to the
 *   account (rolls back if saving fails).
 * - Controlled (`value` + `onChange`, e.g. on sign-in before there's an account):
 *   just reports the choice.
 * `tone`: 'dark' on forest backgrounds, 'light' on paper.
 */
export function LanguageSwitch({ tone = 'light', className, value, onChange }) {
  const { user, setUser } = useAuth()
  const [error, setError] = useState(false)
  const controlled = onChange !== undefined
  const current = controlled ? value : (user?.language ?? 'pa')

  async function choose(id) {
    if (id === current) return
    if (controlled) return onChange(id)
    const before = user
    setError(false)
    setUser({ ...user, language: id })
    try {
      localStorage.setItem(LANG_KEY, id)
    } catch {
      // storage blocked: the account still remembers it
    }
    try {
      const { user: saved } = await authApi.updateProfile({ language: id })
      setUser(saved)
    } catch {
      setUser(before)
      setError(true)
    }
  }

  const dark = tone === 'dark'
  return (
    <div className={className}>
      <div role="group" aria-label="Language · ਭਾਸ਼ਾ" className={cn('grid grid-cols-2 border', dark ? 'border-paper/20' : 'border-soil/25')}>
        {LANGUAGE_OPTIONS.map((o) => {
          const on = o.id === current
          return (
            <button
              key={o.id}
              type="button"
              lang={o.id}
              aria-pressed={on}
              onClick={() => choose(o.id)}
              className={cn(
                'pa min-h-10 px-2 text-[15px] font-semibold transition-colors',
                on ? (dark ? 'bg-straw text-forest-deep' : 'bg-forest text-paper') : dark ? 'text-sage-light hover:bg-paper/[0.06] hover:text-paper' : 'text-stone-dark hover:bg-husk',
              )}
            >
              {o.native}
            </button>
          )
        })}
      </div>
      {error && (
        <p role="alert" className={cn('mt-1.5 text-xs', dark ? 'text-straw-light' : 'text-danger')}>
          Couldn’t save. Check the connection and try again.
        </p>
      )}
    </div>
  )
}

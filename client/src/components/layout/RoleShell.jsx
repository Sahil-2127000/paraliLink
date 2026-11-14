import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { cn } from '../../lib/cn'
import { Logo } from '../ui/Logo'
import { LanguageSwitch } from './LanguageSwitch'

function TabIcon({ d }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="square" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

/**
 * App shell for the phone-first roles (farmer, baler).
 * Phone: full-width screens with a tab bar at the bottom.
 * Desktop (lg+): a left sidebar with the same sections and wide content.
 * `tabs`: [{ to, end?, icon, label: { pa, hi, en } }]
 */
export function RoleShell({ roleLabel, homeTo, tabs }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const language = user?.language ?? 'pa'

  async function signOut() {
    navigate('/', { replace: true })
    await logout()
  }

  return (
    <div className="min-h-svh bg-paper lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col bg-forest-deep text-paper lg:flex">
        <div className="px-7 pt-7">
          <NavLink to={homeTo} aria-label={`${roleLabel} home`}>
            <Logo />
          </NavLink>
          <p className="label mt-2 text-sage">{roleLabel}</p>
        </div>
        <nav aria-label={roleLabel} className="mt-10 px-3">
          <ul className="grid gap-1">
            {tabs.map((tab) => (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3.5 border-l-[3px] px-4 py-3.5 transition-colors',
                      isActive ? 'border-straw bg-paper/[0.06] text-paper' : 'border-transparent text-sage-light hover:bg-paper/[0.04] hover:text-paper',
                    )
                  }
                >
                  <TabIcon d={tab.icon} />
                  <span>
                    <span lang={language} className="pa block text-[17px] leading-tight font-semibold">
                      {tab.label[language]}
                    </span>
                    {language !== 'en' && <span className="label text-xs text-sage">{tab.label.en}</span>}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto border-t border-paper/10 px-7 py-6">
          <LanguageSwitch tone="dark" className="mb-5" />
          <p className="font-semibold">{user?.name}</p>
          <p className="label mt-1 text-xs text-sage">{user?.phone}</p>
          <button type="button" onClick={signOut} className="label mt-3 min-h-9 text-straw-light hover:underline">
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-col">
        {/* Phone: slim top bar with the language switch (desktop has it in the sidebar). */}
        <header className="flex items-center justify-between gap-3 bg-forest-deep px-5.5 py-2 text-paper lg:hidden">
          <NavLink to={homeTo} aria-label={`${roleLabel} home`} className="flex min-h-10 items-center">
            <Logo />
          </NavLink>
          <LanguageSwitch tone="dark" className="w-[min(220px,58vw)]" />
        </header>
        <main id="main" className="flex flex-1 flex-col pb-[92px] lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav aria-label={roleLabel} className="fixed inset-x-0 bottom-0 z-40 border-t border-soil/15 bg-paper-light/95 backdrop-blur lg:hidden">
        <ul className="mx-auto grid max-w-[640px]" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab) => (
            <li key={tab.to}>
              <NavLink
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    '-mt-px flex h-[76px] flex-col items-center justify-center gap-1 border-t-[3px] transition-colors',
                    isActive ? 'border-straw text-forest' : 'border-transparent text-stone hover:text-soil',
                  )
                }
              >
                <TabIcon d={tab.icon} />
                <span lang={language} className="pa text-sm font-semibold">
                  {tab.label[language]}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

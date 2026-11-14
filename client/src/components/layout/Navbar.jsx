import { AnimatePresence, m, useMotionValueEvent, useScroll } from 'motion/react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { homeFor } from '../../features/auth/authApi'
import { useAuth } from '../../features/auth/AuthContext'
import { cn } from '../../lib/cn'
import { EASE } from '../../lib/motion'
import { Logo } from '../ui/Logo'
import { SlabButton } from '../ui/SlabButton'
import { NAV_LINKS } from './navLinks'
import { LanguageSwitch } from './LanguageSwitch'
import { useSiteLanguage } from './SiteLanguage'
import { CONTENT } from '../../features/home/content'

export function Navbar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { language, setLanguage } = useSiteLanguage()
  const t = CONTENT[language]
  const pa = language === 'pa'
  const signedIn = Boolean(user?.onboarded)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 48))

  // Close the menu on navigation; lock scroll and listen for Escape while open.
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Transparent with light text only while sitting on top of the home hero photo.
  const overHero = pathname === '/' && !scrolled && !open

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-[background-color,color,border-color] duration-500',
        overHero ? 'border-b border-transparent text-paper' : 'border-b border-soil/10 bg-paper/92 text-soil backdrop-blur-md',
        open && 'border-transparent bg-forest-deep text-paper backdrop-blur-none',
      )}
    >
      <div className="shell flex h-[72px] items-center justify-between gap-6">
        <Link to="/" aria-label="ParaliLink home">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex gap-9">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="label relative py-1 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-straw after:transition-transform after:duration-500 hover:after:origin-left hover:after:scale-x-100"
                >
                  {t.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitch value={language} onChange={setLanguage} tone={overHero || open ? 'dark' : 'light'} className="hidden w-[168px] sm:block" />
          {/* Phones: one tap flips to the other language. */}
          <button
            type="button"
            onClick={() => setLanguage(pa ? 'en' : 'pa')}
            lang={pa ? 'en' : 'pa'}
            aria-label={pa ? 'Switch to English' : 'ਪੰਜਾਬੀ ਵਿੱਚ ਦੇਖੋ'}
            className={cn('pa flex h-10 items-center border px-3 text-[15px] font-semibold sm:hidden', overHero || open ? 'border-paper/30' : 'border-soil/25')}
          >
            {pa ? 'English' : 'ਪੰਜਾਬੀ'}
          </button>
          {!signedIn && (
            <Link to="/login" className="label hidden h-11 items-center px-2 sm:inline-flex hover:text-straw">
              {t.ui.signIn}
            </Link>
          )}
          {/* Wrapper controls visibility: the button's own inline-flex would override `hidden`. */}
          <span className="hidden sm:block">
            <SlabButton to={signedIn ? homeFor(user) : '/login'} size="md" variant={overHero ? 'ghost' : 'dark'}>
              {signedIn ? t.ui.openApp : t.ui.getStarted}
            </SlabButton>
          </span>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="label flex h-11 items-center gap-3 lg:hidden"
          >
            {open ? t.ui.close : t.ui.menu}
            <span aria-hidden="true" className="relative block h-3 w-6">
              <span className={cn('absolute inset-x-0 top-0 h-0.5 bg-current transition-transform duration-300', open && 'translate-y-[5px] rotate-45')} />
              <span className={cn('absolute inset-x-0 bottom-0 h-0.5 bg-current transition-transform duration-300', open && '-translate-y-[5px] -rotate-45')} />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.nav
            id="mobile-menu"
            aria-label="Mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-[calc(100svh-72px)] overflow-y-auto bg-forest-deep lg:hidden"
          >
            <div className="shell flex h-full flex-col pt-6 pb-10">
              <ul className="border-t border-paper/15">
                {NAV_LINKS.map((link, i) => (
                  <m.li
                    key={link.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.05 + i * 0.06, ease: EASE }}
                    className="border-b border-paper/15"
                  >
                    <a href={link.href} onClick={() => setOpen(false)} className="flex items-baseline justify-between py-5">
                      <span className={pa ? 'pa-head text-4xl' : 'display text-5xl'}>{t.nav[link.key]}</span>
                      <span className="label text-sage">0{i + 2}</span>
                    </a>
                  </m.li>
                ))}
              </ul>
              <div className="mt-auto grid gap-2 pt-10">
                {signedIn ? (
                  <SlabButton to={homeFor(user)} variant="gold">
                    {t.ui.openApp}
                  </SlabButton>
                ) : (
                  <>
                    <SlabButton to="/login" variant="gold">
                      {t.ui.getStarted}
                    </SlabButton>
                    <SlabButton to="/login" variant="ghost">
                      {t.ui.signIn}
                    </SlabButton>
                  </>
                )}
              </div>
            </div>
          </m.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

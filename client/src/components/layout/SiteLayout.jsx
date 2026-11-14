import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { SiteLanguageProvider, useSiteLanguage } from './SiteLanguage'
import { CONTENT } from '../../features/home/content'

/** Scrolls to the #hash target on navigation, or to the top for a new page. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function SitePage() {
  const { language } = useSiteLanguage()
  return (
    <>
      <a
        href="#main"
        className="label sr-only z-[60] bg-straw px-5 py-3 text-forest-deep focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {CONTENT[language].ui.skip}
      </a>
      <ScrollManager />
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

/** Public pages (landing, 404) in English or Punjabi. */
export function SiteLayout() {
  return (
    <SiteLanguageProvider>
      <SitePage />
    </SiteLanguageProvider>
  )
}

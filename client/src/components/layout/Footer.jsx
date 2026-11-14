import { Link } from 'react-router-dom'
import { CONTENT } from '../../features/home/content'
import { NAV_LINKS } from './navLinks'
import { useSiteLanguage } from './SiteLanguage'

const JOIN_LINKS = ['/login?role=farmer', '/login?role=buyer', '/login?role=baler']

export function Footer() {
  const { language } = useSiteLanguage()
  const t = CONTENT[language]
  return (
    <footer className="overflow-hidden bg-forest-deep pt-20 pb-8 text-sage-light">
      <div className="shell">
        <div className="flex flex-wrap justify-between gap-12">
          <div className="max-w-sm">
            <p className="leading-relaxed">{t.footer.about}</p>
            {t.footer.tagline && (
              <p lang={t.footer.taglineLang} className="pa mt-4 text-lg font-semibold text-straw-light">
                {t.footer.tagline}
              </p>
            )}
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-16">
            <div>
              <h2 className="label text-sage">{t.footer.explore}</h2>
              <ul className="mt-4 space-y-3">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="transition-colors hover:text-straw-light">
                      {t.nav[l.key]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="label text-sage">{t.footer.join}</h2>
              <ul className="mt-4 space-y-3">
                {JOIN_LINKS.map((to, i) => (
                  <li key={to}>
                    <Link to={to} className="transition-colors hover:text-straw-light">
                      {t.footer.joinLinks[i]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>
        <p aria-hidden="true" className="display mt-16 text-[clamp(5rem,17.5vw,16rem)] leading-[0.8] whitespace-nowrap text-forest">
          ParaliLink
        </p>
        <div className="mt-7 flex flex-wrap justify-between gap-3 border-t border-sage-light/15 pt-5 text-sage">
          <span className="label text-[0.7rem]">© {new Date().getFullYear()} ParaliLink</span>
          <span className="label text-[0.7rem]">
            <span className="mr-1.5 inline-block animate-blink text-straw">●</span>SDG 13 · SDG 8 · SDG 9
          </span>
        </div>
      </div>
    </footer>
  )
}

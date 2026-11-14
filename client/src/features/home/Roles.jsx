import { Link } from 'react-router-dom'
import { LineReveal } from '../../components/ui/LineReveal'
import { Reveal } from '../../components/ui/Reveal'
import { useHomeCopy } from './useHomeCopy'

/**
 * Three tall photo panels. On desktop the hovered panel widens and reveals its
 * details; on touch screens the details are always visible.
 */
export function Roles() {
  const { t, pa, head } = useHomeCopy()
  return (
    <section id="who" aria-labelledby="who-title" className="scroll-mt-20 pb-28 sm:pb-36">
      <div className="shell">
        <LineReveal
          id="who-title"
          className={`border-t border-soil/15 pt-10 ${head('text-[clamp(3.4rem,7vw,6.75rem)]', 'text-[clamp(2.4rem,4.6vw,4.4rem)]')}`}
          lines={[
            <span key="a">
              {t.roles.title[0]}
              <span className="accent text-forest">{t.roles.title[1]}</span>
            </span>,
          ]}
        />
      </div>

      <ul className="shell mt-14 flex max-w-[1512px] flex-col gap-3 lg:flex-row">
        {t.roles.list.map((role, i) => (
          <Reveal
            as="li"
            key={role.id}
            delay={i * 0.1}
            className="group relative isolate h-[520px] min-w-0 overflow-hidden bg-forest-deep transition-[flex-grow] duration-[800ms] ease-(--ease-out-expo) lg:h-[640px] lg:flex-1 lg:hover:flex-[1.7]"
          >
            <img
              src={role.image}
              alt={role.imageAlt}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 -z-20 size-full object-cover saturate-90 transition-transform duration-[1400ms] ease-(--ease-out-expo) group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_36_26/0.35)_0%,rgb(18_36_26/0)_30%,rgb(18_36_26/0.9)_100%)]"
            />
            <div className="absolute inset-x-7 top-6 flex justify-between text-paper">
              <span className="label">{role.number}</span>
              {role.corner && (
                <span lang="pa" className="pa text-lg font-semibold text-straw-light">
                  {role.corner}
                </span>
              )}
            </div>
            <Link to={`/login?role=${role.id}`} className="absolute inset-x-7 bottom-7 block text-paper">
              <h3 className={pa ? 'pa-head text-[44px]' : 'display text-[56px]'}>{role.title}</h3>
              <p className="mt-3 max-w-[340px] leading-relaxed text-paper/88">{role.pitch}</p>
              <ul className="mt-4 grid gap-1.5 border-t border-paper/25 pt-3.5 transition-[opacity,transform] delay-100 duration-500 lg:translate-y-3 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                {role.points.map((p) => (
                  <li key={p} className="label text-[12.5px] text-sage-light">
                    + {p}
                  </li>
                ))}
              </ul>
              <span className="label mt-5 inline-flex gap-2.5 text-straw-light">
                {role.cta}
                <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">
                  →
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </ul>
    </section>
  )
}

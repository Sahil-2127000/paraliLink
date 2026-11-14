import { LineReveal } from '../../components/ui/LineReveal'
import { Reveal } from '../../components/ui/Reveal'
import { ClusterMap } from './ClusterMap'
import { useHomeCopy } from './useHomeCopy'

export function System() {
  const { t, head } = useHomeCopy()
  return (
    <section id="system" aria-labelledby="system-title" className="scroll-mt-20 py-28 sm:py-36">
      <div className="shell">
        <div className="grid items-start gap-16 lg:grid-cols-2">
          <div>
            <LineReveal
              id="system-title"
              className={head('text-[clamp(3.4rem,7vw,6.75rem)]', 'text-[clamp(2.4rem,4.6vw,4.4rem)]')}
              lines={[
                t.system.title[0],
                <span key="b" className="accent text-forest">
                  {t.system.title[1]}
                </span>,
              ]}
            />
            <p className="mt-7 max-w-[480px] text-[17px] leading-relaxed text-stone-dark">
              {t.system.intro}
            </p>
            <ul className="mt-12 border-t border-soil/15">
              {t.system.features.map((f, i) => (
                <Reveal
                  as="li"
                  key={i}
                  delay={i * 0.06}
                  className="grid grid-cols-[56px_1fr] gap-3 border-b border-soil/15 py-5.5 transition-[background-color,padding] duration-500 ease-(--ease-out-expo) hover:bg-husk hover:pl-4"
                >
                  <span className="label pt-1 text-straw-dark">{f.mark}</span>
                  <div>
                    <h3 className="text-xl font-semibold tracking-[-0.015em]">{f.title}</h3>
                    <p className="mt-1.5 text-[15.5px] leading-relaxed text-stone-dark">{f.body}</p>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
          <ClusterMap />
        </div>
      </div>
    </section>
  )
}

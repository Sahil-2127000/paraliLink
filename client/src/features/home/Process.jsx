import { m, useReducedMotion } from 'motion/react'
import { LineReveal } from '../../components/ui/LineReveal'
import { Reveal } from '../../components/ui/Reveal'
import { EASE, IN_VIEW } from '../../lib/motion'
import { useHomeCopy } from './useHomeCopy'

export function Process() {
  const reduce = useReducedMotion()
  const { t, head } = useHomeCopy()
  return (
    <section id="process" aria-labelledby="process-title" className="scroll-mt-20 bg-husk py-28">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <LineReveal
              id="process-title"
              className={head('text-[clamp(3.4rem,7vw,6.75rem)]', 'text-[clamp(2.4rem,4.6vw,4.4rem)]')}
              lines={[
                <span key="a">
                  {t.process.title[0]}
                  <span className="accent text-forest">{t.process.title[1]}</span>
                </span>,
              ]}
            />
          </div>
          <p className="max-w-[400px] text-[17px] leading-relaxed text-stone-dark">
            {t.process.intro}
          </p>
        </div>

        <m.div
          aria-hidden="true"
          className="mt-16 h-0.5 origin-left bg-forest"
          initial={{ scaleX: reduce ? 1 : 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={IN_VIEW}
          transition={{ duration: 1.6, ease: EASE }}
        />
        <ol className="grid sm:grid-cols-2 lg:grid-cols-5">
          {t.process.steps.map((step, i) => (
            <Reveal
              as="li"
              key={i}
              delay={0.15 + i * 0.08}
              className="border-b border-soil/15 py-7 sm:pr-6 lg:border-r lg:border-b-0 lg:last:border-r-0 lg:[&:not(:first-child)]:pl-6"
            >
              <div className="flex items-baseline justify-between">
                <span className="display text-6xl text-sage">0{i + 1}</span>
                <span className="label text-stone">{step.who}</span>
              </div>
              <h3 className="mt-5 text-[21px] font-semibold tracking-[-0.015em]">{step.title}</h3>
              <p className="mt-2.5 text-[15.5px] leading-relaxed text-stone-dark">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

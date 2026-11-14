import { LineReveal } from '../../components/ui/LineReveal'
import { Reveal } from '../../components/ui/Reveal'
import { useHomeCopy } from './useHomeCopy'

/**
 * Short FAQ in plain words. Native <details> rows: keyboard and screen-reader
 * friendly with no script; the first answer starts open.
 */
export function Faq() {
  const { t, pa, head } = useHomeCopy()
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 bg-forest py-28 text-paper sm:py-32">
      <div className="shell grid items-start gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28">
          <LineReveal
            id="faq-title"
            className={head('text-[clamp(3.4rem,7vw,6.75rem)]', 'text-[clamp(2.4rem,4.6vw,4.4rem)]')}
            lines={[
              t.faq.title[0],
              <span key="b" className="accent text-straw-light">
                {t.faq.title[1]}
              </span>,
            ]}
          />
          <p className="mt-6 max-w-[380px] text-[17px] leading-relaxed text-sage-light">{t.faq.intro}</p>
        </div>

        <div className="border-t border-paper/20">
          {t.faq.items.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <details open={i === 0} className="group border-b border-paper/20">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5.5 [&::-webkit-details-marker]:hidden">
                  <span className={pa ? 'pa text-[19px] leading-snug font-semibold' : 'text-[19px] leading-snug font-semibold'}>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="relative mt-1.5 size-4 shrink-0 text-straw-light transition-transform duration-300 group-open:rotate-45"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-current" />
                    <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-current" />
                  </span>
                </summary>
                <p className="max-w-[62ch] pb-6 text-[16px] leading-relaxed text-sage-light">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { LineReveal } from '../../components/ui/LineReveal'
import { Reveal } from '../../components/ui/Reveal'
import { SlabButton } from '../../components/ui/SlabButton'
import { useHomeCopy } from './useHomeCopy'

export function ClosingCta() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { t, head } = useHomeCopy()
  const [line1, [accentWord, rest], line3] = t.closing.title
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%'])

  return (
    <section ref={ref} aria-labelledby="close-title" className="relative isolate overflow-hidden bg-forest-deep text-paper">
      <m.img
        src="/images/sunset-field.webp"
        srcSet="/images/sunset-field-1100.webp 1100w, /images/sunset-field.webp 2000w"
        sizes="100vw"
        alt=""
        loading="lazy"
        decoding="async"
        style={reduce ? undefined : { y }}
        className="absolute inset-0 -z-20 h-[116%] w-full -translate-y-[8%] object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_36_26/0.2)_0%,rgb(18_36_26/0.8)_100%)]" />
      <div className="shell flex min-h-[680px] flex-wrap items-end justify-between gap-10 pt-40 pb-16 sm:min-h-[760px] sm:pb-20">
        <div>
          <LineReveal
            id="close-title"
            className={head('max-w-[12ch] text-[clamp(3.6rem,9vw,9.4rem)]', 'max-w-[14ch] text-[clamp(2.6rem,6vw,5.6rem)]')}
            lines={[
              line1,
              <span key="b">
                <span className="accent text-straw-light">{accentWord}</span>
                {rest}
              </span>,
              line3,
            ]}
          />
        </div>
        <Reveal delay={0.2} className="max-w-[340px]">
          {t.closing.tagline && (
            <p lang={t.closing.taglineLang} className="pa mb-3 text-[21px] font-semibold text-straw-light">
              {t.closing.tagline}
            </p>
          )}
          <p className="leading-relaxed text-paper/90">{t.closing.body}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <SlabButton to="/login?role=farmer" variant="gold">
              {t.cta.sell}
            </SlabButton>
            <SlabButton to="/login?role=buyer" variant="ghost">
              {t.cta.buy}
            </SlabButton>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

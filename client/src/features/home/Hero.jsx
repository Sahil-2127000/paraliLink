import { m, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { LineReveal } from '../../components/ui/LineReveal'
import { Marquee } from '../../components/ui/Marquee'
import { SlabButton } from '../../components/ui/SlabButton'
import { EASE } from '../../lib/motion'
import { useHomeCopy } from './useHomeCopy'

export function Hero() {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { t, head } = useHomeCopy()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // Gentle parallax: the photo drifts slower than the page.
  const photoY = useTransform(scrollYProgress, [0, 1], ['0%', '16%'])

  const fadeUp = (delay) =>
    reduce ? {} : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay, ease: EASE } }

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-forest-deep text-paper">
      <m.div className="absolute inset-0 -z-20" style={reduce ? undefined : { y: photoY }}>
        <img
          src="/images/baler-hero.webp"
          srcSet="/images/baler-hero-1100.webp 1100w, /images/baler-hero.webp 2200w"
          sizes="100vw"
          alt="A tractor baling harvested straw into bales on an open field"
          fetchPriority="high"
          decoding="async"
          className="size-full animate-kenburns object-cover object-[center_60%] saturate-[0.92] motion-reduce:animate-none"
        />
      </m.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_36_26/0.62)_0%,rgb(18_36_26/0)_26%,rgb(18_36_26/0)_42%,rgb(18_36_26/0.9)_100%)]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgb(18_36_26/0.55)_0%,rgb(18_36_26/0)_62%)]" />

      {/* Keeps the headline clear of the fixed navbar. */}
      <div aria-hidden="true" className="pt-[104px]" />

      {/* Content sits at the bottom; on short screens the section grows instead of overlapping. */}
      <div className="shell mt-auto flex flex-wrap items-end justify-between gap-x-10 gap-y-8 pt-14 pb-[88px] sm:pb-[104px]">
        <LineReveal
          as="h1"
          id="hero-title"
          immediate
          delay={0.15}
          className={head('max-w-[11ch] text-[clamp(3.6rem,min(11.5vw,17svh),11rem)]', 'max-w-[12ch] text-[clamp(2.8rem,min(8vw,12svh),7.5rem)]')}
          lines={[
            t.hero.title[0],
            <span key="accent" className="accent text-[0.62em] leading-[1.05] text-straw-light">
              {t.hero.title[1]}
            </span>,
          ]}
        />
        <m.div {...fadeUp(0.7)} className="max-w-[380px]">
          {t.hero.tagline && (
            <p lang={t.hero.taglineLang} className="pa mb-3 text-[22px] font-semibold text-straw-light">
              {t.hero.tagline}
            </p>
          )}
          <p className="text-[17px] leading-relaxed text-paper/90">{t.hero.body}</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <SlabButton to="/login?role=farmer" variant="gold">
              {t.cta.sell}
            </SlabButton>
            <SlabButton to="/login?role=buyer" variant="ghost">
              {t.cta.buy}
            </SlabButton>
          </div>
        </m.div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-14 items-center border-t border-paper/20 text-paper/85">
        <Marquee
          className="w-full"
          itemClassName="label"
          items={t.ticker.map((item) => (
            <span key={item.value}>
              <span className="text-straw-light">{item.value}</span> {item.label}
            </span>
          ))}
        />
      </div>
    </section>
  )
}

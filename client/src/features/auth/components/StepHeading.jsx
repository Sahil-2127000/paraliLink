import { m, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { EASE } from '../../../lib/motion'

/**
 * Step title: the chosen language large, English underneath as a helper
 * (skipped when English is the chosen language). Takes focus when the step
 * changes so screen-reader and keyboard users land on the new question.
 */
export function StepHeading({ copy, language }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [copy])

  const anim = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE } }

  return (
    <div>
      <m.h1 {...anim} ref={ref} tabIndex={-1} lang={language} className="pa text-[clamp(1.9rem,4vw,2.4rem)] leading-tight font-bold outline-none">
        {copy[language]}
      </m.h1>
      {language !== 'en' && (
        <m.p
          {...anim}
          transition={reduce ? undefined : { duration: 0.6, delay: 0.06, ease: EASE }}
          lang="en"
          className="display mt-2 text-[clamp(1.8rem,3.4vw,2.2rem)] text-sage"
        >
          {copy.en}
        </m.p>
      )}
    </div>
  )
}

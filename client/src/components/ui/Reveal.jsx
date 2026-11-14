import { m, useReducedMotion } from 'motion/react'
import { EASE, IN_VIEW } from '../../lib/motion'

const TAGS = { div: m.div, li: m.li, section: m.section, p: m.p, figure: m.figure }

/**
 * Fades and lifts its children in the first time they scroll into view.
 * Only opacity and transform animate. Renders statically for reduced motion.
 */
export function Reveal({ as = 'div', delay = 0, y = 24, className, children, ...rest }) {
  const reduce = useReducedMotion()
  if (reduce) {
    const Static = as
    return (
      <Static className={className} {...rest}>
        {children}
      </Static>
    )
  }
  const Tag = TAGS[as] ?? m.div
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={IN_VIEW}
      transition={{ duration: 0.9, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

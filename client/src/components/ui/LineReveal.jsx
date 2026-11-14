import { m, useReducedMotion } from 'motion/react'
import { EASE, IN_VIEW } from '../../lib/motion'

/**
 * Headline whose lines slide up from behind a mask, one after another.
 * `lines` is an array of React nodes. With `immediate` it plays on mount
 * (for the hero); otherwise it plays when scrolled into view.
 */
export function LineReveal({ as: Tag = 'h2', lines, immediate = false, delay = 0, stagger = 0.12, className, id }) {
  const reduce = useReducedMotion()

  return (
    <Tag id={id} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.04em]">
          {reduce ? (
            <span className="block">{line}</span>
          ) : (
            <m.span
              className="block"
              initial={{ y: '105%' }}
              {...(immediate ? { animate: { y: 0 } } : { whileInView: { y: 0 }, viewport: IN_VIEW })}
              transition={{ duration: 1.1, delay: delay + i * stagger, ease: EASE }}
            >
              {line}
            </m.span>
          )}
        </span>
      ))}
    </Tag>
  )
}

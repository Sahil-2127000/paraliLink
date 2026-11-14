import { animate, useInView, useReducedMotion } from 'motion/react'
import { useEffect, useRef } from 'react'
import { formatNumber } from '../../lib/format'

/**
 * Counts from 0 to `value` once it scrolls into view. Writes to the DOM node
 * directly, so React does not re-render every frame. Screen readers get the final value.
 */
export function CountUp({ value, decimals = 0, duration = 1.6, className }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const reduce = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node || !inView) return
    if (reduce) {
      node.textContent = formatNumber(value, decimals)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = formatNumber(v, decimals)
      },
    })
    return () => controls.stop()
  }, [inView, reduce, value, decimals, duration])

  return (
    <span className={className}>
      <span ref={ref} aria-hidden="true" className="tabular-nums">
        {formatNumber(0, decimals)}
      </span>
      <span className="sr-only">{formatNumber(value, decimals)}</span>
    </span>
  )
}

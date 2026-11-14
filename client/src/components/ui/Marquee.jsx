import { cn } from '../../lib/cn'

/**
 * Endless horizontal ticker. Items are rendered twice and the track slides by
 * half its width, so the loop is seamless. Pauses on hover; static for reduced motion.
 */
export function Marquee({ items, className, itemClassName }) {
  const loop = [...items, ...items]
  return (
    <div className={cn('overflow-hidden', className)}>
      <ul className="flex w-max animate-marquee hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((item, i) => (
          <li key={i} aria-hidden={i >= items.length ? 'true' : undefined} className={cn('flex items-center gap-7 px-7 whitespace-nowrap', itemClassName)}>
            {item}
            <span aria-hidden="true" className="opacity-40">
              /
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

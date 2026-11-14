import { cn } from '../../lib/cn'

/** Straw-stalk mark plus the condensed wordmark. */
export function Logo({ className, size = 'md' }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg viewBox="0 0 22 30" className={size === 'lg' ? 'h-8 w-6' : 'h-7 w-5'} aria-hidden="true">
        <path
          d="M11 29V3M11 11C6 10 3 7 3 2c5 0 8 3 8 9ZM11 18c5-1 8-4 8-9-5 0-8 3-8 9Z"
          fill="none"
          className="stroke-straw"
          strokeWidth="2.2"
          strokeLinecap="square"
        />
      </svg>
      <span className={cn('display', size === 'lg' ? 'text-4xl' : 'text-3xl')}>ParaliLink</span>
    </span>
  )
}

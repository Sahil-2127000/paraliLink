import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'

const VARIANTS = {
  // Main action, one per view.
  gold: 'bg-straw text-forest-deep hover:bg-straw-light',
  // Dark solid, for light backgrounds.
  dark: 'bg-forest text-paper hover:bg-forest-deep',
  // Outline on dark photos / dark sections.
  ghost: 'border border-paper/60 text-paper hover:bg-paper hover:text-forest-deep',
  // Outline on light backgrounds.
  outline: 'border border-soil text-soil hover:bg-soil hover:text-paper',
}

const SIZES = {
  md: 'h-11 px-5',
  lg: 'h-14 px-6',
}

/**
 * Square-cornered "slab" button with a mono uppercase label and an arrow that
 * slides on hover. Renders a router Link (`to`), an anchor (`href`) or a button.
 */
export function SlabButton({ to, href, variant = 'gold', size = 'lg', arrow = '→', className, children, ...rest }) {
  const classes = cn(
    'group label inline-flex items-center justify-between gap-3 font-medium whitespace-nowrap',
    'transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className,
  )
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span aria-hidden="true" className="inline-block transition-transform duration-500 ease-(--ease-out-expo) group-hover:translate-x-1.5">
          {arrow}
        </span>
      )}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }
  return (
    <button type="button" className={classes} {...rest}>
      {content}
    </button>
  )
}

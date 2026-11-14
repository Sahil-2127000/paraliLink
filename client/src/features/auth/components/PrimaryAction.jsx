import { cn } from '../../../lib/cn'

/**
 * Full-width submit slab at the bottom of each step: chosen-language label,
 * English helper, arrow. Shows a spinner while `busy`.
 */
export function PrimaryAction({ copy, language, busy = false, disabled = false, variant = 'gold' }) {
  return (
    <button
      type="submit"
      disabled={disabled || busy}
      aria-busy={busy}
      className={cn(
        'group label flex h-15 w-full items-center justify-between px-5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed',
        variant === 'gold' ? 'bg-straw text-forest-deep hover:bg-straw-light' : 'bg-forest text-paper hover:bg-forest-deep',
        'disabled:bg-husk disabled:text-stone',
      )}
    >
      <span>
        <span lang={language} className="pa text-[17px] font-bold tracking-normal normal-case">
          {copy[language]}
        </span>
        {language !== 'en' && <span lang="en"> · {copy.en}</span>}
      </span>
      {busy ? (
        <span aria-hidden="true" className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <span aria-hidden="true" className="transition-transform duration-500 group-hover:translate-x-1.5">
          →
        </span>
      )}
    </button>
  )
}

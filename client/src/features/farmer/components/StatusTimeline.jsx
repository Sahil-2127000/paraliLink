import { cn } from '../../../lib/cn'
import { shortDate, STATUS, STATUS_ORDER } from '../copy'

/** Six-step progress bar used on cards. */
export function StatusBars({ status, dark = false }) {
  const index = STATUS_ORDER.indexOf(status)
  return (
    <div className="flex gap-1" role="img" aria-label={`Step ${index + 1} of ${STATUS_ORDER.length}`}>
      {STATUS_ORDER.map((s, i) => (
        <span
          key={s}
          className={cn('h-1 flex-1 transition-colors duration-700', i <= index ? 'bg-straw' : dark ? 'bg-paper/20' : 'bg-soil/12')}
        />
      ))}
    </div>
  )
}

/** Vertical timeline with the date each step happened. */
export function StatusTimeline({ listing, language }) {
  const index = STATUS_ORDER.indexOf(listing.status)
  const when = Object.fromEntries((listing.statusHistory ?? []).map((h) => [h.status, h.at]))

  return (
    <ol className="relative">
      <span aria-hidden="true" className="absolute top-3 bottom-3 left-[11px] w-0.5 bg-soil/14" />
      <span
        aria-hidden="true"
        className="absolute top-3 left-[11px] w-0.5 bg-forest transition-[height] duration-700"
        style={{ height: `calc(${(Math.max(index, 0) / (STATUS_ORDER.length - 1)) * 100}% - 12px)` }}
      />
      {STATUS_ORDER.map((s, i) => {
        const done = i < index || (i === index && s === 'paid')
        const current = i === index && s !== 'paid'
        const date = when[s]
        return (
          <li key={s} className="relative grid grid-cols-[24px_1fr_auto] items-start gap-3.5 py-2">
            <span
              className={cn(
                'relative z-10 grid size-6 place-items-center text-paper',
                done && 'bg-forest',
                current && 'bg-straw',
                !done && !current && 'border-2 border-soil/30 bg-paper',
              )}
            >
              {done && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" aria-hidden="true">
                  <path d="M4 12.5 9.5 18 20 6" />
                </svg>
              )}
            </span>
            <span>
              <span lang={language} className={cn('pa block text-[17px] font-bold', !done && !current && 'text-stone')}>
                {STATUS[s][language]}
              </span>
              {language !== 'en' && (
                <span lang="en" className="block text-[13px] text-stone">
                  {STATUS[s].en}
                </span>
              )}
            </span>
            <span className={cn('label pt-1 text-[12.5px]', current ? 'text-straw-dark' : 'text-stone')}>{date ? shortDate(date) : '—'}</span>
          </li>
        )
      })}
    </ol>
  )
}

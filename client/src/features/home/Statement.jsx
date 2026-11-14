import { CountUp } from '../../components/ui/CountUp'
import { Reveal } from '../../components/ui/Reveal'
import { useHomeCopy } from './useHomeCopy'

export function Statement() {
  const { t, pa } = useHomeCopy()
  return (
    <section aria-labelledby="statement-title" className="py-28 sm:py-36">
      <div className="shell">
        <Reveal>
          <h2 id="statement-title" className="max-w-[1180px] text-[clamp(1.75rem,3.6vw,3.4rem)] leading-[1.16] font-medium tracking-[-0.025em]">
            {t.statement.before} {t.statement.after}{' '}
            <span className={pa ? 'font-bold text-forest' : 'accent text-[1.12em] text-forest'}>{t.statement.accent}</span>
          </h2>
        </Reveal>

        <dl className="mt-20 grid border-t border-soil/15 sm:grid-cols-2 lg:grid-cols-4">
          {t.figures.map((f, i) => (
            <Reveal
              key={f.label}
              delay={i * 0.08}
              className="flex flex-col-reverse border-b border-soil/15 py-7 sm:pr-7 lg:border-r lg:border-b-0 lg:last:border-r-0 lg:[&:not(:first-child)]:pl-7"
            >
              <dt className="mt-3 max-w-[26ch] text-[15px] leading-normal text-stone">{f.label}</dt>
              <dd className="display text-[clamp(3.4rem,5vw,4.75rem)] text-forest">
                <CountUp value={f.value} decimals={f.decimals} />
                <span className={pa ? 'pa ml-2 text-[0.32em] font-semibold text-stone' : 'ml-1.5 text-[0.4em] text-stone'}>{f.unit}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}

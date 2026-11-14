import { Link } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { formatNumber } from '../../../lib/format'
import { useAsync } from '../../../lib/useAsync'
import { useAuth } from '../../auth/AuthContext'
import { Bilingual } from '../components/Bilingual'
import { ErrorBlock, LoadingBlock } from '../components/LoadState'
import { FarmerPage, PageHeader } from '../components/PageHeader'
import { StatusBars } from '../components/StatusTimeline'
import { shortDate, STATUS, T } from '../copy'
import { farmerApi } from '../farmerApi'

export default function ListingsPage() {
  const { user } = useAuth()
  const language = user.language
  const { data, error, loading, reload } = useAsync((signal) => farmerApi.mine(signal))

  return (
    <FarmerPage>
      <PageHeader speak={T.pickups[language]} language={language} />
      <div className="flex flex-wrap items-end justify-between gap-4 pt-3 lg:pt-6">
        <h1>
          <Bilingual copy={T.pickups} language={language} stacked nativeClassName="text-3xl lg:text-4xl" />
        </h1>
        <Link to="/farmer/sell" className="label hidden h-12 items-center bg-straw px-5 text-forest-deep transition-colors hover:bg-straw-light lg:inline-flex">
          + List straw
        </Link>
      </div>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock error={error} onRetry={reload} />}

      {data &&
        (data.listings.length === 0 ? (
          <div className="mt-6 border border-dashed border-soil/30 p-6 text-center lg:p-12">
            <Bilingual copy={T.noStraw} language={language} stacked nativeClassName="text-xl" />
            <Link to="/farmer/sell" className="label mt-4 inline-flex h-11 items-center bg-straw px-4 text-forest-deep">
              List straw →
            </Link>
          </div>
        ) : (
          <ul className="mt-5 grid border-t border-soil/15 lg:mt-8 lg:grid-cols-2 lg:gap-4 lg:border-t-0 xl:grid-cols-3">
            {data.listings.map((l) => {
              const cancelled = l.status === 'cancelled'
              return (
                <li key={l.id}>
                  <Link
                    to={`/farmer/listings/${l.id}`}
                    className={cn(
                      'block h-full border-b border-soil/15 px-1 py-4 transition-colors hover:bg-husk lg:border lg:bg-paper-light lg:p-5',
                      cancelled && 'opacity-55',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {l.fieldName ?? l.village} <span className="label text-stone">· {l.label}</span>
                        </p>
                        <p lang={language} className="pa mt-1 text-lg font-bold text-forest">
                          {STATUS[l.status][language]}
                        </p>
                      </div>
                      <span className="shrink-0 text-right">
                        <span className="display block text-3xl">{formatNumber(l.verifiedTonnes ?? l.estTonnes, 1)} t</span>
                        <span className="label text-xs text-stone">{l.verifiedTonnes ? 'Verified' : 'Estimate'}</span>
                      </span>
                    </div>
                    {!cancelled && (
                      <div className="mt-3">
                        <StatusBars status={l.status} />
                      </div>
                    )}
                    <p className="label mt-2.5 text-xs text-stone">
                      {l.acres} acres{l.bales ? ` · ${l.bales} bales` : ''} · ready {shortDate(l.harvestDate)}
                      {l.pickup ? ` · pickup ${shortDate(l.pickup.date)}` : ''}
                    </p>
                  </Link>
                </li>
              )
            })}
          </ul>
        ))}
    </FarmerPage>
  )
}

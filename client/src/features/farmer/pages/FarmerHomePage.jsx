import { Link } from 'react-router-dom'
import { CountUp } from '../../../components/ui/CountUp'
import { formatNumber, formatRupees } from '../../../lib/format'
import { useAsync } from '../../../lib/useAsync'
import { useAuth } from '../../auth/AuthContext'
import { Bilingual } from '../components/Bilingual'
import { ErrorBlock, LoadingBlock } from '../components/LoadState'
import { FarmerPage, PageHeader } from '../components/PageHeader'
import { StatusBars } from '../components/StatusTimeline'
import { BOOKING_STATUS, shortDate, STATUS, T } from '../copy'
import { farmerApi } from '../farmerApi'

function FocusCard({ listing, language }) {
  const pickup = listing.pickup
  return (
    <Link to={`/farmer/listings/${listing.id}`} className="block bg-forest p-5 text-paper transition-colors hover:bg-forest-deep lg:p-7">
      <div className="flex items-center justify-between">
        <span className="label text-sage">
          {T.yourStraw[language]} · {listing.label}
        </span>
        <span className="label flex items-center gap-1.5 text-straw-light">
          <span aria-hidden="true" className="size-[7px] animate-blink bg-straw" />
          Live
        </span>
      </div>
      {language !== 'en' && (
        <p lang={language} className="pa mt-3.5 text-2xl leading-tight font-bold lg:text-3xl">
          {pickup ? `${T.pickupOn[language]} ${shortDate(pickup.date, language)}` : STATUS[listing.status][language]}
        </p>
      )}
      <p className="display mt-3.5 text-3xl text-straw-light lg:text-5xl">{pickup ? `Pickup ${shortDate(pickup.date)}` : STATUS[listing.status].en}</p>
      <div className="mt-4.5 lg:mt-6">
        <StatusBars status={listing.status} dark />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm text-sage-light">
          {listing.cluster ? `${listing.cluster.name} · ${listing.cluster.farmCount} farms · ` : ''}
          {listing.acres} acres
        </span>
        <span className="label text-paper">Details →</span>
      </div>
    </Link>
  )
}

export default function FarmerHomePage() {
  const { user } = useAuth()
  const language = user.language
  const { data, error, loading, reload } = useAsync((signal) => farmerApi.summary(signal))
  const { data: mine } = useAsync((signal) => farmerApi.mine(signal))
  const { data: bookingData } = useAsync((signal) => farmerApi.bookings(signal))
  const nextBooking = (bookingData?.bookings ?? []).filter((b) => ['requested', 'accepted'].includes(b.status)).sort((a, b) => new Date(a.date) - new Date(b.date))[0]

  const firstName = user.name?.split(' ')[0] ?? ''
  const speak = data?.focus?.pickup
    ? `${T.hello[language]}. ${T.pickupOn[language]} ${shortDate(data.focus.pickup.date, language)}.`
    : `${T.hello[language]}, ${firstName}.`
  const recent = (mine?.listings ?? []).slice(0, 4)

  return (
    <FarmerPage>
      <PageHeader speak={speak} language={language} />
      <h1 className="pt-4 lg:pt-6">
        <span lang={language} className="pa block text-[28px] leading-tight font-bold lg:text-4xl">
          {T.hello[language]},
        </span>
        <span className="display mt-1 block text-5xl lg:text-7xl">{user.name}</span>
      </h1>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock error={error} onRetry={reload} />}

      {data && (
        <div className="mt-5 grid gap-6 lg:mt-8 lg:grid-cols-[1.35fr_1fr] lg:gap-10">
          {/* Left: what's happening now + main action */}
          <div className="grid content-start gap-3">
            {data.focus ? (
              <FocusCard listing={data.focus} language={language} />
            ) : (
              <div className="border border-dashed border-soil/30 p-6 text-center lg:p-10">
                <Bilingual copy={T.noStraw} language={language} stacked nativeClassName="text-xl" />
                <p className="mt-2 text-sm text-stone-dark">
                  {language === 'en'
                    ? 'After harvest, get your straw baled (your own baler or one from the app), then list the bales so an industry can buy them.'
                    : 'ਵਾਢੀ ਤੋਂ ਬਾਅਦ ਗੱਠਾਂ ਬਣਵਾਓ (ਆਪਣਾ ਬੇਲਰ ਜਾਂ ਐਪ ਤੋਂ), ਫਿਰ ਗੱਠਾਂ ਵੇਚਣ ਲਈ ਪਾਓ ਤਾਂ ਜੋ ਕੋਈ ਫ਼ੈਕਟਰੀ ਖਰੀਦ ਸਕੇ।'}
                </p>
              </div>
            )}

            <Link
              to="/farmer/sell"
              className="group label flex h-16 items-center justify-between bg-straw px-5 text-[12px] text-forest-deep transition-colors hover:bg-straw-light lg:h-20 lg:px-7"
            >
              <span className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                <span>
                  <span lang={language} className="pa block text-[19px] leading-tight font-bold tracking-normal normal-case lg:text-[22px]">
                    {T.listStraw[language]}
                  </span>
                  {language !== 'en' && 'List baled straw'}
                </span>
              </span>
              <span aria-hidden="true" className="text-base transition-transform group-hover:translate-x-1.5">
                →
              </span>
            </Link>

            {nextBooking ? (
              <Link to="/farmer/baler" className="flex items-center justify-between gap-3 border border-soil/20 bg-paper-light px-5 py-4 transition-colors hover:bg-husk">
                <span className="min-w-0">
                  <span lang={language} className="pa block font-bold">
                    {T.balerBooked[language]} · {shortDate(nextBooking.date, language)}
                  </span>
                  <span className="block truncate text-[13px] text-stone-dark">
                    {nextBooking.baler?.name} · {nextBooking.village} · <span lang={language}>{BOOKING_STATUS[nextBooking.status][language]}</span>
                  </span>
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <Link to="/farmer/baler" className="group flex h-14 items-center justify-between border border-forest px-5 text-forest transition-colors hover:bg-forest hover:text-paper lg:h-16 lg:px-7">
                <span>
                  <span lang={language} className="pa text-[17px] font-bold">
                    {T.bookBaler[language]}
                  </span>
                  {language !== 'en' && <span className="ml-2 text-sm opacity-80">Book a baler</span>}
                </span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1.5">
                  →
                </span>
              </Link>
            )}
          </div>

          {/* Right: money and recent fields */}
          <div className="grid content-start gap-6">
            <dl className="grid grid-cols-2 border-t border-soil/15 lg:border-t-2 lg:border-forest">
              <div className="flex flex-col-reverse border-r border-soil/15 pt-4 pr-3.5">
                <dt className="mt-1.5 text-[13px] text-stone">
                  <Bilingual copy={T.earned} language={language} nativeClassName="text-[15px] text-soil" englishClassName="text-[10px]" />
                </dt>
                <dd className="display text-[44px] text-forest lg:text-[56px]">
                  ₹<CountUp value={data.earned} />
                </dd>
              </div>
              <div className="flex flex-col-reverse pt-4 pl-3.5">
                <dt className="mt-1.5 text-[13px] text-stone">
                  <Bilingual copy={T.notBurnt} language={language} nativeClassName="text-[15px] text-soil" englishClassName="text-[10px]" />
                </dt>
                <dd className="display text-[44px] text-forest lg:text-[56px]">
                  <CountUp value={data.tonnesSaved} decimals={1} />
                  <span className="text-xl text-stone"> t</span>
                </dd>
              </div>
            </dl>

            {data.upcoming > 0 && (
              <Link to="/farmer/money" className="flex items-center justify-between border-l-[3px] border-straw bg-husk px-4 py-3.5 hover:bg-husk/70">
                <Bilingual copy={T.coming} language={language} stacked nativeClassName="text-base" englishClassName="text-[10px]" />
                <span className="display text-3xl text-straw-dark">≈ {formatRupees(data.upcoming)}</span>
              </Link>
            )}

            {recent.length > 0 && (
              <section aria-labelledby="recent-title">
                <div className="flex items-baseline justify-between">
                  <h2 id="recent-title" className="label text-stone">
                    Your fields
                  </h2>
                  <Link to="/farmer/listings" className="label text-forest hover:underline">
                    All →
                  </Link>
                </div>
                <ul className="mt-2 border-t border-soil/15">
                  {recent.map((l) => (
                    <li key={l.id}>
                      <Link to={`/farmer/listings/${l.id}`} className="flex items-center justify-between gap-3 border-b border-soil/10 px-1 py-3 transition-colors hover:bg-husk">
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">{l.fieldName ?? l.village}</span>
                          <span lang={language} className="pa text-sm text-forest">
                            {STATUS[l.status][language]}
                          </span>
                        </span>
                        <span className="display shrink-0 text-2xl">{formatNumber(l.verifiedTonnes ?? l.estTonnes, 1)} t</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      )}
    </FarmerPage>
  )
}

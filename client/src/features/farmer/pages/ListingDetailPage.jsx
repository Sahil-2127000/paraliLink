import { m, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatNumber, formatRupees } from '../../../lib/format'
import { EASE } from '../../../lib/motion'
import { useAsync } from '../../../lib/useAsync'
import { useAuth } from '../../auth/AuthContext'
import { Bilingual } from '../components/Bilingual'
import { ErrorBlock, LoadingBlock } from '../components/LoadState'
import { FarmerPage, PageHeader } from '../components/PageHeader'
import { StatusTimeline } from '../components/StatusTimeline'
import { shortDate, STATUS, T } from '../copy'
import { farmerApi } from '../farmerApi'

/** Big pickup code card: digits flip in one by one. */
function PickupCode({ code, language }) {
  const reduce = useReducedMotion()
  return (
    <section aria-labelledby="code-title" className="bg-forest p-5 text-paper lg:p-7">
      <h2 id="code-title" lang={language} className="pa text-xl leading-snug font-bold lg:text-2xl">
        {T.tellCode[language]}
      </h2>
      {language !== 'en' && <p className="mt-0.5 text-[13px] text-sage-light">Tell this code to the truck staff at pickup</p>}
      <p aria-label={`Pickup code ${code.split('').join(' ')}`} className="mt-4.5 grid grid-cols-6 gap-1.5 [perspective:600px] lg:gap-2.5">
        {code.split('').map((digit, i) => (
          <m.span
            key={i}
            aria-hidden="true"
            className="display grid h-[66px] place-items-center bg-paper text-[52px] leading-none text-forest-deep lg:h-[88px] lg:text-[68px]"
            initial={reduce ? false : { opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ duration: 0.7, delay: 0.2 + i * 0.08, ease: EASE }}
          >
            {digit}
          </m.span>
        ))}
      </p>
      <div className="mt-3.5 flex justify-between">
        <span className="label text-xs text-sage">Valid on pickup day only</span>
        <span className="label text-xs text-straw-light">Never share before</span>
      </div>
    </section>
  )
}

export default function ListingDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const language = user.language
  const { data, error, loading, reload } = useAsync((signal) => farmerApi.get(id, signal), [id])
  const [confirming, setConfirming] = useState(false)
  const [cancelState, setCancelState] = useState({ busy: false, error: '' })

  const listing = data?.listing

  async function cancel() {
    setCancelState({ busy: true, error: '' })
    try {
      await farmerApi.cancel(id)
      setConfirming(false)
      reload()
      setCancelState({ busy: false, error: '' })
    } catch (err) {
      setCancelState({ busy: false, error: err.message })
    }
  }

  const speak = listing
    ? listing.pickup?.code
      ? `${T.tellCode[language]}: ${listing.pickup.code.split('').join(', ')}`
      : STATUS[listing.status][language]
    : ''

  return (
    <FarmerPage>
      <PageHeader back="/farmer/listings" speak={speak} language={language} />

      {loading && <LoadingBlock />}
      {error && <ErrorBlock error={error} onRetry={reload} />}

      {listing && (
        <>
          <h1 className="pt-4 lg:pt-6">
            <span className="display block text-4xl lg:text-6xl">{listing.fieldName ?? listing.village}</span>
            <span lang={language} className="pa mt-1 block text-lg font-bold text-forest lg:text-xl">
              {STATUS[listing.status][language]}
            </span>
          </h1>

          <div className="mt-4.5 grid gap-6 lg:mt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
            {/* Left: the code, who's coming, money, facts */}
            <div className="grid content-start gap-4">
              {listing.pickup?.code && <PickupCode code={listing.pickup.code} language={language} />}

              {listing.pickup && listing.status !== 'paid' && (
                <div className="flex items-center gap-3 border-b border-soil/15 py-3">
                  <img src="/images/baler-field.webp" alt="" className="size-13 shrink-0 object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold">{listing.pickup.balerName}</p>
                    <p className="label text-xs text-stone">
                      Baler {listing.pickup.balerVehicle} · {shortDate(listing.pickup.date)} · {listing.pickup.window}
                    </p>
                  </div>
                  {listing.pickup.balerPhone && (
                    <a href={`tel:${listing.pickup.balerPhone}`} aria-label={`Call ${listing.pickup.balerName}`} className="grid size-13 place-items-center bg-straw text-forest-deep">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                        <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}

              {listing.payout && (
                <div className="flex items-center justify-between bg-forest p-4.5 text-paper lg:p-6">
                  <div>
                    <p lang={language} className="pa text-lg font-bold">
                      {STATUS.paid[language]}
                    </p>
                    <p className="label mt-1 text-xs text-sage">
                      {formatNumber(listing.verifiedTonnes, 1)} t × {formatRupees(Math.round(listing.payout.amount / listing.verifiedTonnes))} · {shortDate(listing.payout.paidAt)}
                    </p>
                  </div>
                  <span className="display text-[40px] text-straw-light">{formatRupees(listing.payout.amount)}</span>
                </div>
              )}

              <dl className="grid grid-cols-2 border-t border-soil/15 text-sm">
                {[
                  ['Village', `${listing.village}, ${listing.district}`],
                  ['Bales ready', `${shortDate(listing.harvestDate)} · ${listing.harvestWeek.split('-')[1]}`],
                  ['Straw', listing.verifiedTonnes ? `${formatNumber(listing.verifiedTonnes, 1)} t verified` : `≈ ${formatNumber(listing.estTonnes, 1)} t${listing.bales ? ` · ${formatNumber(listing.bales)} bales` : ''}`],
                  ['Baled by', listing.baling ? `${listing.baling.balerName ?? (listing.baling.by === 'own' ? 'Own baler' : 'ParaliLink baler')}${listing.baling.by === 'app' ? ' · via ParaliLink' : ''}` : '—'],
                  ['Group', listing.cluster ? `${listing.cluster.name} · ${listing.cluster.farmCount} farms` : 'Waiting for nearby farms'],
                ].map(([k, v]) => (
                  <div key={k} className="border-b border-soil/10 py-2.5 pr-2">
                    <dt className="label text-xs text-stone">{k}</dt>
                    <dd className="mt-0.5 font-medium">{v}</dd>
                  </div>
                ))}
              </dl>

              {listing.cancellable && (
                <div className="mt-2">
                  {confirming ? (
                    <div role="alertdialog" aria-labelledby="cancel-q" className="border border-danger/40 bg-[#f4dfd6] p-4">
                      <p id="cancel-q" className="font-semibold text-[#6e1f12]">
                        Cancel this listing? Nearby farms may lose their pickup if you leave the group.
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => setConfirming(false)} className="label h-12 border border-soil">
                          Keep it
                        </button>
                        <button type="button" onClick={cancel} disabled={cancelState.busy} className="label h-12 bg-danger text-paper disabled:opacity-60">
                          {cancelState.busy ? 'Cancelling…' : 'Yes, cancel'}
                        </button>
                      </div>
                      {cancelState.error && <p className="mt-2 text-sm text-danger">{cancelState.error}</p>}
                    </div>
                  ) : (
                    <button type="button" onClick={() => setConfirming(true)} className="label min-h-11 text-danger underline underline-offset-4">
                      <Bilingual copy={T.cancel} language={language} nativeClassName="text-[15px]" englishClassName="text-[10px] text-danger" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right: the journey so far */}
            {listing.status !== 'cancelled' && (
              <section aria-labelledby="tl-title" className="lg:border-l lg:border-soil/15 lg:pl-10">
                <h2 id="tl-title" className="label text-stone">
                  <Bilingual copy={T.progress} language={language} nativeClassName="text-sm" englishClassName="text-[10px]" />
                </h2>
                <div className="mt-3 lg:mt-5">
                  <StatusTimeline listing={listing} language={language} />
                </div>
              </section>
            )}
          </div>
        </>
      )}
    </FarmerPage>
  )
}

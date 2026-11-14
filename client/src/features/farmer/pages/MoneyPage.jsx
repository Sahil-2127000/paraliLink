import { Link, useNavigate } from 'react-router-dom'
import { CountUp } from '../../../components/ui/CountUp'
import { formatNumber, formatRupees } from '../../../lib/format'
import { useAsync } from '../../../lib/useAsync'
import { useAuth } from '../../auth/AuthContext'
import { Bilingual } from '../components/Bilingual'
import { ErrorBlock, LoadingBlock } from '../components/LoadState'
import { FarmerPage, PageHeader } from '../components/PageHeader'
import { shortDate, T } from '../copy'
import { farmerApi } from '../farmerApi'

export default function MoneyPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const language = user.language
  const { data, error, loading, reload } = useAsync((signal) => farmerApi.summary(signal))

  async function signOut() {
    navigate('/', { replace: true })
    await logout()
  }

  return (
    <FarmerPage>
      <PageHeader speak={data ? `${T.received[language]}: ${data.earned} ₹` : T.money[language]} language={language} />
      <h1 className="pt-3 lg:pt-6">
        <Bilingual copy={T.money} language={language} stacked nativeClassName="text-3xl lg:text-4xl" />
      </h1>

      {loading && <LoadingBlock />}
      {error && <ErrorBlock error={error} onRetry={reload} />}

      {data && (
        <div className="mt-5 grid gap-6 lg:mt-8 lg:grid-cols-[1fr_1.15fr] lg:gap-10">
          <div className="grid content-start gap-3.5">
            <section aria-label="Season total" className="border-t-2 border-forest border-b border-b-soil/15 py-4.5">
              <Bilingual copy={T.received} language={language} nativeClassName="text-[15px]" englishClassName="text-[10px]" />
              <p className="display mt-2.5 text-[84px] text-forest lg:text-[104px]">
                ₹<CountUp value={data.earned} />
              </p>
              <p className="mt-2 text-sm text-stone-dark">Paid by UPI at {formatRupees(data.farmerRate)} per tonne, the same rate for every farm.</p>
            </section>

            {data.upcoming > 0 && (
              <div className="flex items-center justify-between gap-3 border-l-[3px] border-straw bg-husk px-4 py-3.5">
                <div>
                  <Bilingual copy={T.coming} language={language} stacked nativeClassName="text-[17px]" englishClassName="text-[10px]" />
                  <p className="mt-0.5 text-[13px] text-stone-dark">Paid after the pickup code and weight are checked.</p>
                </div>
                <span className="display text-3xl whitespace-nowrap text-straw-dark">≈ {formatRupees(data.upcoming)}</span>
              </div>
            )}

            {data.tonnesSaved > 0 && (
              <section aria-label="Your impact" className="flex items-center justify-between gap-3 bg-forest p-4.5 text-paper lg:p-6">
                <div>
                  <Bilingual copy={T.cleanAir} language={language} stacked nativeClassName="text-[17px]" englishClassName="text-[10px] text-sage" />
                  <p className="mt-1 text-[13px] text-sage-light">{formatNumber(data.tonnesSaved, 1)} t of straw not burnt this season</p>
                </div>
                <p className="text-right">
                  <span className="display block text-[42px] text-straw-light">{formatNumber(data.co2Avoided, 1)} t</span>
                  <span className="label text-sage">CO₂ avoided</span>
                </p>
              </section>
            )}
          </div>

          <section aria-labelledby="payments-title">
            <h2 id="payments-title" className="label text-stone">
              {language === 'en' ? 'Payments' : 'ਭੁਗਤਾਨ · Payments'}
            </h2>
            {data.payments.length === 0 ? (
              <p className="mt-3 border border-dashed border-soil/30 p-5 text-center text-sm text-stone-dark">No payments yet. They appear here once your straw is picked up.</p>
            ) : (
              <ul className="mt-2.5 border-t border-soil/15">
                {data.payments.map((p) => (
                  <li key={p.id}>
                    <Link to={`/farmer/listings/${p.id}`} className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-b border-soil/15 px-1 py-3.5 transition-colors hover:bg-husk lg:py-4.5">
                      <span className="font-semibold">
                        {p.fieldName ?? p.label} · {p.label}
                      </span>
                      <span className="display text-right text-3xl">{formatRupees(p.amount)}</span>
                      <span className="label text-stone">
                        {formatNumber(p.tonnes, 1)} t × {formatRupees(data.farmerRate)}
                      </span>
                      <span className="label text-right text-forest">✓ Paid · {shortDate(p.paidAt)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-soil/15 pt-4 text-sm text-stone lg:hidden">
              <span>
                {user.name} · {user.phone}
              </span>
              <button type="button" onClick={signOut} className="label min-h-11 text-forest underline underline-offset-4">
                Sign out
              </button>
            </div>
          </section>
        </div>
      )}
    </FarmerPage>
  )
}

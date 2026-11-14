import { useEffect, useState } from 'react'
import { LanguageSwitch } from '../../components/layout/LanguageSwitch'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { Logo } from '../../components/ui/Logo'
import { cn } from '../../lib/cn'
import { authApi, homeFor } from './authApi'
import { useAuth } from './AuthContext'
import { ReadAloudButton } from './components/ReadAloudButton'
import { COPY } from './copy'
import { LanguageStep } from './steps/LanguageStep'
import { OtpStep } from './steps/OtpStep'
import { PhoneStep } from './steps/PhoneStep'
import { ProfileStep } from './steps/ProfileStep'

const STEPS = ['language', 'phone', 'otp', 'profile']
const LANG_KEY = 'pl_lang'

function readSavedLanguage() {
  try {
    return localStorage.getItem(LANG_KEY)
  } catch {
    return null
  }
}

function saveLanguage(value) {
  try {
    localStorage.setItem(LANG_KEY, value)
  } catch {
    // Private mode or blocked storage: the choice just won't be remembered.
  }
}

export default function SignInPage() {
  const { user, setUser, status } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetRole = ['farmer', 'buyer', 'baler'].includes(params.get('role')) ? params.get('role') : undefined

  const savedLanguage = readSavedLanguage()
  const [language, setLanguage] = useState(user?.language ?? savedLanguage ?? 'pa')
  const [step, setStep] = useState(savedLanguage ? 'phone' : 'language')
  const [phone, setPhone] = useState('')
  const [otpInfo, setOtpInfo] = useState({ resendIn: 30, devCode: null })

  // Signed in but not finished onboarding: jump straight to the profile step.
  useEffect(() => {
    if (status === 'ready' && user && !user.onboarded) setStep('profile')
  }, [status, user])

  if (status === 'loading') {
    return (
      <div role="status" className="flex min-h-svh items-center justify-center">
        <span className="label text-stone">Loading…</span>
      </div>
    )
  }
  if (user?.onboarded) return <Navigate to={homeFor(user)} replace />

  const index = STEPS.indexOf(step)

  async function sendCode(digits) {
    const data = await authApi.requestOtp(digits, language)
    setPhone(data.phone)
    setOtpInfo({ resendIn: data.resendIn, devCode: data.devCode ?? null })
    setStep('otp')
  }

  async function resendCode() {
    const data = await authApi.requestOtp(phone, language)
    setOtpInfo({ resendIn: data.resendIn, devCode: data.devCode ?? null })
    return data
  }

  async function verifyCode(code) {
    const data = await authApi.verifyOtp(phone, code, language)
    setUser(data.user)
    if (data.user.onboarded) navigate(homeFor(data.user), { replace: true })
    else setStep('profile')
  }

  async function saveProfile(fields) {
    const data = await authApi.updateProfile({ ...fields, language })
    setUser(data.user)
    navigate(homeFor(data.user), { replace: true })
  }

  function back() {
    if (step === 'otp') setStep('phone')
    else if (step === 'phone') setStep('language')
  }

  const speakText = {
    language: COPY.language[language],
    phone: `${COPY.phone[language]}. ${COPY.phoneHelp[language]}`,
    otp: COPY.otp[language],
    profile: `${COPY.profile[language]} ${COPY.name[language]}`,
  }[step]

  return (
    <div className="flex min-h-svh flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Photo side: full panel on desktop, a band on phones for the first step only. */}
      <aside
        className={cn(
          'relative isolate shrink-0 overflow-hidden bg-forest-deep text-paper',
          step === 'language' ? 'h-[210px] sm:h-[340px]' : 'hidden',
          'lg:block lg:h-auto',
        )}
      >
        <img src="/images/baler-field.webp" alt="" className="absolute inset-0 -z-20 size-full animate-kenburns object-cover motion-reduce:animate-none" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(18_36_26/0.6)_0%,rgb(18_36_26/0)_38%,rgb(18_36_26/0.88)_100%)]" />
        <div className="flex h-full flex-col justify-between p-6 sm:p-10">
          <div className="flex items-center justify-between">
            <Link to="/" aria-label="ParaliLink home">
              <Logo />
            </Link>
          </div>
          <div>
            <p lang="pa" className="pa text-3xl leading-tight font-bold lg:text-5xl">
              ਪਰਾਲੀ ਸਾੜੋ ਨਹੀਂ, ਵੇਚੋ।
            </p>
            <p className="accent mt-2 text-2xl text-straw-light lg:text-4xl">Sell the straw. Don’t burn it.</p>
          </div>
        </div>
      </aside>

      <main id="main" className="flex flex-1 flex-col bg-paper lg:min-h-svh">
        <div className="shell flex max-w-[560px] flex-1 flex-col py-6 sm:py-10">
          <div className="flex h-12 items-center justify-between gap-3">
            {index > 0 && index < 3 ? (
              <button
                type="button"
                onClick={back}
                aria-label="Back"
                className="grid size-12 place-items-center border border-soil transition-colors hover:bg-soil hover:text-paper"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
                  <path d="M19 12H5M11 6l-6 6 6 6" />
                </svg>
              </button>
            ) : (
              <Link to="/" className="label flex h-12 items-center text-stone hover:text-soil lg:invisible">
                ← Home
              </Link>
            )}
            <span className="flex items-center gap-2">
              {step !== 'language' && (
                <LanguageSwitch
                  value={language}
                  onChange={(id) => {
                    setLanguage(id)
                    saveLanguage(id)
                  }}
                  className="w-[150px] sm:w-[170px]"
                />
              )}
              <ReadAloudButton text={speakText} language={language} />
            </span>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-1" aria-hidden="true">
            {STEPS.map((s, i) => (
              <span key={s} className={cn('h-0.5 transition-colors duration-500', i <= index ? 'bg-forest' : 'bg-soil/12')} />
            ))}
          </div>

          <div className="mt-10 flex flex-1 flex-col">
            {step === 'language' && (
              <LanguageStep
                language={language}
                onChange={setLanguage}
                onNext={() => {
                  saveLanguage(language)
                  setStep('phone')
                }}
              />
            )}
            {step === 'phone' && <PhoneStep language={language} phone={phone} onSubmit={sendCode} />}
            {step === 'otp' && (
              <OtpStep
                language={language}
                phone={phone}
                resendIn={otpInfo.resendIn}
                devCode={otpInfo.devCode}
                onVerify={verifyCode}
                onResend={resendCode}
                onChangeNumber={() => setStep('phone')}
              />
            )}
            {step === 'profile' && <ProfileStep language={language} user={user} initialRole={presetRole} onSubmit={saveProfile} />}
          </div>
        </div>
      </main>
    </div>
  )
}

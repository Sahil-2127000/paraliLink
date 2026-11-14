import { Link } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { ReadAloudButton } from '../../auth/components/ReadAloudButton'

/** Page width wrapper for farmer screens: full width on phones, a wide centred column on desktop. */
export function FarmerPage({ children, className }) {
  return <div className={cn('mx-auto flex w-full max-w-[1180px] flex-1 flex-col px-5.5 lg:px-10', className)}>{children}</div>
}

/** Top row of a farmer/baler screen: optional back link and the read-aloud button. */
export function PageHeader({ back, speak, language }) {
  return (
    <div className="flex h-12 items-center justify-between gap-3 pt-5.5 lg:pt-8">
      <div className="flex min-w-0 items-center gap-4">
        {back && (
          <Link to={back} aria-label="Back" className="grid size-12 shrink-0 place-items-center border border-soil transition-colors hover:bg-soil hover:text-paper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
          </Link>
        )}
      </div>
      {speak ? <ReadAloudButton text={speak} language={language} /> : <span className="w-12" />}
    </div>
  )
}

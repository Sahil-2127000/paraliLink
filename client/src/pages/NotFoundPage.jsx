import { useSiteLanguage } from '../components/layout/SiteLanguage'
import { SlabButton } from '../components/ui/SlabButton'
import { CONTENT } from '../features/home/content'

export default function NotFoundPage() {
  const { language } = useSiteLanguage()
  const t = CONTENT[language].notFound
  const pa = language === 'pa'
  return (
    <section className="shell flex min-h-[80svh] flex-col justify-center pt-32 pb-20">
      <h1 className={pa ? 'pa-head text-[clamp(2.6rem,6vw,5rem)]' : 'display text-[clamp(3.4rem,8vw,7rem)]'}>
        {t.title[0]}
        <span className="accent text-forest">{t.title[1]}</span>
      </h1>
      <p className="mt-6 max-w-lg text-lg leading-relaxed text-stone-dark">{t.body}</p>
      <div className="mt-10">
        <SlabButton to="/" variant="dark">
          {t.back}
        </SlabButton>
      </div>
    </section>
  )
}

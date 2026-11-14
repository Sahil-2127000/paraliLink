import { useSiteLanguage } from '../../components/layout/SiteLanguage'
import { cn } from '../../lib/cn'
import { CONTENT } from './content'

/**
 * Landing copy for the current site language, plus `head()` for headline
 * classes: the display font has no Gurmukhi letters, so Punjabi headlines use
 * the Punjabi font at a smaller size (Gurmukhi is wider and taller).
 */
export function useHomeCopy() {
  const { language } = useSiteLanguage()
  const pa = language === 'pa'
  const head = (enSize, paSize) => cn(pa ? 'pa-head' : 'display', pa ? paSize : enSize)
  return { t: CONTENT[language], pa, language, head }
}

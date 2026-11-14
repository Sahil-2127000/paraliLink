import { cn } from '../../../lib/cn'

/**
 * Shows a phrase in the farmer's language, with the English version as a small
 * mono helper (skipped when English is the chosen language).
 */
export function Bilingual({ copy, language, className, nativeClassName, englishClassName, stacked = false }) {
  return (
    <span className={cn(stacked ? 'block' : 'inline', className)}>
      <span lang={language} className={cn('pa font-bold', stacked && 'block', nativeClassName)}>
        {copy[language]}
      </span>
      {language !== 'en' && (
        <span lang="en" className={cn('label text-stone', stacked ? 'mt-0.5 block' : 'ml-2', englishClassName)}>
          {copy.en}
        </span>
      )}
    </span>
  )
}

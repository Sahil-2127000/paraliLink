import { COPY, speechLang } from '../copy'

/**
 * Reads `text` aloud with the browser's speech engine in the chosen language.
 * Hidden when the browser has no speech support.
 */
export function ReadAloudButton({ text, language, className = '' }) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null

  function speak() {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLang(language)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  return (
    <button
      type="button"
      onClick={speak}
      aria-label="Read this screen aloud"
      className={`inline-flex h-12 items-center gap-2 border border-current px-3 transition-colors hover:bg-soil hover:text-paper ${className}`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden="true">
        <path d="M11 5 6 9H2v6h4l5 4ZM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
      </svg>
      <span lang={language} className="pa text-base font-semibold">
        {COPY.listen[language]}
      </span>
    </button>
  )
}

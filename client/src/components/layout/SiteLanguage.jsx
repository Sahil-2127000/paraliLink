import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../features/auth/AuthContext'
import { authApi } from '../../features/auth/authApi'

const LANG_KEY = 'pl_lang' // shared with sign-in and the apps
const SiteLanguageContext = createContext({ language: 'en', setLanguage: () => {} })

function readSaved() {
  try {
    const v = localStorage.getItem(LANG_KEY)
    return v === 'pa' || v === 'en' ? v : null
  } catch {
    return null
  }
}

/**
 * Language of the public site (landing page, 404). Starts from the visitor's
 * saved choice, else their account language, else English. Changing it is
 * remembered for sign-in, and saved to the account when signed in.
 */
export function SiteLanguageProvider({ children }) {
  const { user, setUser } = useAuth()
  const [language, setState] = useState(() => readSaved() ?? 'en')

  // A signed-in visitor with no saved choice on this device: follow the account.
  useEffect(() => {
    if (!readSaved() && (user?.language === 'pa' || user?.language === 'en')) setState(user.language)
  }, [user?.language])

  const setLanguage = useCallback(
    (id) => {
      setState(id)
      try {
        localStorage.setItem(LANG_KEY, id)
      } catch {
        // storage blocked: fine for this visit
      }
      if (user && user.language !== id) {
        authApi
          .updateProfile({ language: id })
          .then(({ user: saved }) => setUser(saved))
          .catch(() => {})
      }
    },
    [user, setUser],
  )

  // Screen readers and the browser should know which language the page is in.
  useEffect(() => {
    document.documentElement.lang = language === 'pa' ? 'pa' : 'en'
    return () => {
      document.documentElement.lang = 'en'
    }
  }, [language])

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage])
  return <SiteLanguageContext.Provider value={value}>{children}</SiteLanguageContext.Provider>
}

export const useSiteLanguage = () => useContext(SiteLanguageContext)

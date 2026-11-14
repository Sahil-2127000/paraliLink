import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from './authApi'

const AuthContext = createContext(null)

/**
 * Holds the signed-in user. On load it asks the API who is signed in (the
 * session lives in an httpOnly cookie the browser sends automatically).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready

  useEffect(() => {
    const controller = new AbortController()
    authApi
      .me(controller.signal)
      .then((data) => setUser(data.user))
      .catch((error) => {
        if (error.name !== 'AbortError') setUser(null)
      })
      .finally(() => {
        if (!controller.signal.aborted) setStatus('ready')
      })
    return () => controller.abort()
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(() => ({ user, setUser, status, logout }), [user, status, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

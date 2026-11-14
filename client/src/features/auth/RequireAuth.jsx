import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { homeFor } from './authApi'
import { useAuth } from './AuthContext'

/** Route guard: signed in, onboarded, and (optionally) one of `roles`. */
export function RequireAuth({ roles }) {
  const { user, status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <div role="status" className="flex min-h-svh items-center justify-center">
        <span className="label text-stone">Loading…</span>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!user.onboarded) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />
  return <Outlet />
}

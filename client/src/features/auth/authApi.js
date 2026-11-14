import { api } from '../../lib/api'

export const authApi = {
  requestOtp: (phone, language) => api('/auth/otp/request', { method: 'POST', body: { phone, language } }),
  verifyOtp: (phone, code, language) => api('/auth/otp/verify', { method: 'POST', body: { phone, code, language } }),
  me: (signal) => api('/auth/me', { signal }),
  updateProfile: (fields) => api('/auth/me', { method: 'PATCH', body: fields }),
  logout: () => api('/auth/logout', { method: 'POST' }),
}

/** Where each role lands after signing in. */
export const ROLE_HOME = {
  farmer: '/farmer',
  buyer: '/buyer',
  baler: '/baler',
  admin: '/admin',
}

export function homeFor(user) {
  if (!user?.onboarded) return '/login'
  return ROLE_HOME[user.role] ?? '/'
}

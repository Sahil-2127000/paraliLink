import { HttpError } from '../middleware/errors.js'
import { requestOtp, SESSION_COOKIE, sessionCookieOptions, signSession, verifyOtp } from '../services/auth.service.js'

export async function requestCode(req, res) {
  const result = await requestOtp(req.body.phone, req.body.language)
  res.json({ data: { phone: req.body.phone, ...result } })
}

export async function verifyCode(req, res) {
  const { user, isNew } = await verifyOtp(req.body.phone, req.body.code, req.body.language)
  res.cookie(SESSION_COOKIE, signSession(user), sessionCookieOptions())
  res.json({ data: { user: user.toPublic(), isNew } })
}

/** Who is signed in. Returns { user: null } (not 401) for visitors, so the site doesn't log errors for them. */
export function getMe(req, res) {
  res.json({ data: { user: req.user ? req.user.toPublic() : null } })
}

/** Onboarding and profile edits. The role can be chosen once; changing it later goes through the team. */
export async function updateMe(req, res) {
  const user = req.user
  const { name, role, language } = req.body

  if (role && user.role && role !== user.role) {
    throw new HttpError(409, 'Your role is already set. Contact ParaliLink to change it.')
  }
  if (name !== undefined) user.name = name
  if (role) user.role = role
  if (language) user.language = language
  user.onboarded = Boolean(user.role && user.name)
  await user.save()

  // Re-issue the session so it carries the role.
  res.cookie(SESSION_COOKIE, signSession(user), sessionCookieOptions())
  res.json({ data: { user: user.toPublic() } })
}

export function logout(req, res) {
  const { maxAge: _maxAge, ...options } = sessionCookieOptions()
  res.clearCookie(SESSION_COOKIE, options)
  res.json({ data: { ok: true } })
}

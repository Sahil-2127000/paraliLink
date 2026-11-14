import { User } from '../models/user.model.js'
import { SESSION_COOKIE, verifySession } from '../services/auth.service.js'
import { HttpError } from './errors.js'

/** Requires a valid session cookie. Loads the user onto req.user. */
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return next(new HttpError(401, 'Please sign in.'))

  let payload
  try {
    payload = verifySession(token)
  } catch {
    return next(new HttpError(401, 'Your session has expired. Please sign in again.'))
  }

  const user = await User.findById(payload.sub)
  if (!user) return next(new HttpError(401, 'Please sign in.'))

  req.user = user
  next()
}

/** Loads req.user when a valid session exists; otherwise continues with req.user = null. */
export async function optionalAuth(req, res, next) {
  req.user = null
  const token = req.cookies?.[SESSION_COOKIE]
  if (!token) return next()
  try {
    const payload = verifySession(token)
    req.user = await User.findById(payload.sub)
  } catch {
    req.user = null
  }
  next()
}

/** Use after requireAuth. Allows only the given roles. */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You don’t have access to this.'))
    }
    next()
  }
}

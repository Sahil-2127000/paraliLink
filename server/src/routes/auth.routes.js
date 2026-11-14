import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { getMe, logout, requestCode, updateMe, verifyCode } from '../controllers/auth.controller.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { profileSchema, requestSchema, verifySchema } from '../validators/auth.validators.js'

export const authRouter = Router()

// Per-IP limits on top of the per-number limits inside the service.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { message: 'Too many attempts from this device. Try again in a few minutes.' } },
})

authRouter.post('/otp/request', otpLimiter, validateBody(requestSchema), requestCode)
authRouter.post('/otp/verify', otpLimiter, validateBody(verifySchema), verifyCode)
authRouter.get('/me', optionalAuth, getMe)
authRouter.patch('/me', requireAuth, validateBody(profileSchema), updateMe)
authRouter.post('/logout', logout)

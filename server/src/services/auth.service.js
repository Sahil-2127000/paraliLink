import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { env } from '../config/env.js'
import { HttpError } from '../middleware/errors.js'
import { OtpCode } from '../models/otp.model.js'
import { User } from '../models/user.model.js'
import { checkTwilioVerification, isTestNumber, sendConsoleSms, startTwilioVerification, usesTwilio } from './sms.service.js'

const { otp: OTP, auth: AUTH } = env

function hashCode(phone, code) {
  return crypto.createHmac('sha256', AUTH.otpPepper).update(`${phone}:${code}`).digest('hex')
}

function generateCode() {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0')
}

function safeEqual(a, b) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}

const viaTwilio = (phone) => usesTwilio() && !isTestNumber(phone)
const PROVIDER_CODE = 'provider' // codeHash placeholder when Twilio holds the code


export async function requestOtp(phone, language) {
  const now = Date.now()

  const latest = await OtpCode.findOne({ phone }).sort({ createdAt: -1 })
  if (latest) {
    const wait = Math.ceil((latest.createdAt.getTime() + OTP.resendSeconds * 1000 - now) / 1000)
    if (wait > 0) throw new HttpError(429, `Please wait ${wait} seconds before asking for a new code.`, { retryAfter: wait })
  }

  const lastHour = await OtpCode.countDocuments({ phone, createdAt: { $gt: new Date(now - 60 * 60 * 1000) } })
  if (lastHour >= OTP.maxPerHour) {
    throw new HttpError(429, 'Too many codes requested for this number. Try again in an hour.')
  }

  // Only the newest code is valid.
  await OtpCode.updateMany({ phone, consumed: false }, { consumed: true })

  if (viaTwilio(phone)) {
    // Send first: if Twilio refuses (e.g. unverified trial number), no code record is left behind.
    await startTwilioVerification(phone, language)
    await OtpCode.create({ phone, codeHash: PROVIDER_CODE, expiresAt: new Date(now + OTP.ttlSeconds * 1000) })
    return { expiresIn: OTP.ttlSeconds, resendIn: OTP.resendSeconds }
  }

  const test = isTestNumber(phone)
  const code = (test && env.otpTestCode) || generateCode()
  await OtpCode.create({ phone, codeHash: hashCode(phone, code), expiresAt: new Date(now + OTP.ttlSeconds * 1000) })
  await sendConsoleSms(phone, `ParaliLink ਕੋਡ / code: ${code}. Valid ${OTP.ttlSeconds / 60} min. Don't share it.`)

  return {
    expiresIn: OTP.ttlSeconds,
    resendIn: OTP.resendSeconds,
    ...(!env.isProduction || test ? { devCode: code } : {}),
  }
}

/** Checks a code. On success returns the (possibly new) user. */
export async function verifyOtp(phone, code, language) {
  const record = await OtpCode.findOne({ phone, consumed: false }).sort({ createdAt: -1 })
  if (!record || record.expiresAt.getTime() < Date.now()) {
    throw new HttpError(400, 'This code has expired. Ask for a new one.', { reason: 'expired' })
  }
  if (record.attempts >= OTP.maxAttempts) {
    throw new HttpError(429, 'Too many wrong tries. Ask for a new code.', { reason: 'locked' })
  }

  const ok = record.codeHash === PROVIDER_CODE ? await checkTwilioVerification(phone, code) : safeEqual(record.codeHash, hashCode(phone, code))
  if (!ok) {
    record.attempts += 1
    await record.save()
    const left = OTP.maxAttempts - record.attempts
    throw new HttpError(400, left > 0 ? `Wrong code. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many wrong tries. Ask for a new code.', {
      reason: left > 0 ? 'wrong' : 'locked',
      attemptsLeft: left,
    })
  }

  record.consumed = true
  await record.save()

  let user = await User.findOne({ phone })
  const isNew = !user
  if (!user) user = new User({ phone, language })
  user.lastLoginAt = new Date()
  try {
    await user.save()
  } catch (error) {
    // Two first-time logins for the same number at once: use the one that won.
    if (error.code !== 11000) throw error
    user = await User.findOneAndUpdate({ phone }, { lastLoginAt: new Date() }, { returnDocument: 'after' })
  }

  return { user, isNew }
}

export function signSession(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role ?? null }, AUTH.jwtSecret, {
    expiresIn: `${AUTH.sessionDays}d`,
  })
}

export function verifySession(token) {
  return jwt.verify(token, AUTH.jwtSecret)
}

export const SESSION_COOKIE = 'pl_session'

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: AUTH.cookieSecure,
    sameSite: AUTH.cookieSameSite,
    path: '/',
    maxAge: AUTH.sessionDays * 24 * 60 * 60 * 1000,
  }
}

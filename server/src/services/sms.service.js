/**
 * Login codes go out in one of two ways:
 *
 * - 'console': we create the code, store its hash, and print it to the server log
 *   (development only).
 * - 'twilio': Twilio Verify creates, texts and checks the code. Verify handles
 *   India's DLT sender rules, so no template registration is needed on our side.
 *   A trial account can only text numbers verified in the Twilio console.
 *
 * Numbers listed in OTP_TEST_NUMBERS always use the 'console' path, so the
 * seeded demo accounts (fake numbers) keep working with real SMS switched on.
 */

import { env } from '../config/env.js'
import { HttpError } from '../middleware/errors.js'

export const usesTwilio = () => env.smsProvider === 'twilio'

export function isTestNumber(phone) {
  return env.otpTestNumbers.some((p) => (p.endsWith('*') ? phone.startsWith(p.slice(0, -1)) : phone === p))
}

/** Development only: print the message instead of sending it. */
export async function sendConsoleSms(phone, message) {
  if (env.isProduction && !isTestNumber(phone)) throw new Error('SMS_PROVIDER=console must not be used in production.')
  console.info(`[sms → ${phone}] ${message}`)
}

// ── Twilio Verify (REST API, no SDK needed) ───────────────────────────────

const VERIFY = 'https://verify.twilio.com/v2/Services'

async function twilio(path, params) {
  const { accountSid, authToken, verifyServiceSid } = env.twilio
  let res
  try {
    res = await fetch(`${VERIFY}/${verifyServiceSid}/${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(params),
      signal: AbortSignal.timeout(10_000),
    })
  } catch (error) {
    console.error('[twilio] network error:', error.message)
    throw new HttpError(503, 'Couldn’t send the code right now. Please try again in a minute.')
  }
  const body = await res.json().catch(() => ({}))
  return { status: res.status, body }
}

// Twilio error codes → messages a farmer can act on.
function twilioError({ status, body }) {
  const code = body?.code
  console.error(`[twilio] ${status} ${code ?? ''} ${body?.message ?? ''}`)
  if (code === 21608 || code === 21614 || code === 60205) {
    return new HttpError(400, 'This number can’t get SMS codes yet. (Twilio trial: add it under Verified Caller IDs.)', { reason: 'unverified_number' })
  }
  if (code === 60200 || code === 21211) return new HttpError(400, 'Enter a valid 10-digit mobile number.', { reason: 'bad_number' })
  if (code === 60203) return new HttpError(429, 'Too many codes sent to this number. Try again in 10 minutes.', { reason: 'provider_limit' })
  if (code === 60202) return new HttpError(429, 'Too many wrong tries. Ask for a new code.', { reason: 'locked' })
  if (code === 20003 || code === 20404 || status === 401) {
    return new HttpError(503, 'SMS isn’t set up correctly on the server. Please tell the ParaliLink team.', { reason: 'sms_config' })
  }
  return new HttpError(502, 'Couldn’t send the code right now. Please try again in a minute.')
}

const LOCALE = { pa: 'pa', en: 'en' }

/** Asks Twilio to text a new code. */
export async function startTwilioVerification(phone, language) {
  const params = { To: phone, Channel: 'sms' }
  if (LOCALE[language]) params.Locale = LOCALE[language]
  let res = await twilio('Verifications', params)
  // If Twilio doesn't support the language, fall back to English.
  if (res.status >= 400 && params.Locale && res.body?.code === 60200 && /locale/i.test(res.body?.message ?? '')) {
    delete params.Locale
    res = await twilio('Verifications', params)
  }
  if (res.status >= 400) throw twilioError(res)
}

/** True if Twilio approves the code. A missing verification (expired / already used) counts as expired. */
export async function checkTwilioVerification(phone, code) {
  const res = await twilio('VerificationCheck', { To: phone, Code: code })
  if (res.status === 404 || res.body?.code === 20404) {
    throw new HttpError(400, 'This code has expired. Ask for a new one.', { reason: 'expired' })
  }
  if (res.status >= 400) throw twilioError(res)
  return res.body?.status === 'approved'
}

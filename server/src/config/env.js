/**
 * Reads and validates environment variables once, at startup.
 * Everything else in the server imports config from here instead of process.env.
 */
const required = ['MONGODB_URI', 'JWT_SECRET', 'OTP_PEPPER']

const missing = required.filter((key) => !process.env[key])
if (missing.length) {
  throw new Error(`Missing environment variables: ${missing.join(', ')}. Copy server/.env.example to server/.env.`)
}

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction && (process.env.JWT_SECRET.length < 32 || process.env.OTP_PEPPER.length < 32)) {
  throw new Error('JWT_SECRET and OTP_PEPPER must be at least 32 characters in production.')
}

// Phone numbers of the accounts created by scripts/seedDemo.js (all fake numbers).
const DEMO_NUMBERS = '+919876543210,+919814000001,+919815000013,+919815000002,+919815000021,+919815000007,+919888000000,+9190000*'

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction,
  port: Number(process.env.PORT ?? 5050),
  mongodbUri: process.env.MONGODB_URI,
  clientOrigins: (process.env.CLIENT_ORIGINS ?? 'http://localhost:5180')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  auth: {
    jwtSecret: process.env.JWT_SECRET,
    otpPepper: process.env.OTP_PEPPER,
    sessionDays: Number(process.env.SESSION_DAYS ?? 30),
    // 'lax' when web app and API share a domain (or a proxy/rewrite);
    // 'none' only if they live on different sites (requires HTTPS).
    cookieSameSite: process.env.COOKIE_SAMESITE ?? 'lax',
    cookieSecure: isProduction,
  },

  otp: {
    ttlSeconds: 5 * 60,
    resendSeconds: 30,
    maxAttempts: 5,
    maxPerHour: 5,
  },

  // Which SMS provider sends codes:
  //  'console' prints them to the server log (development only);
  //  'twilio'  sends real SMS through Twilio Verify (Twilio creates and checks the code).
  smsProvider: process.env.SMS_PROVIDER ?? 'console',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID,
  },
  // Demo/test numbers that never get a real SMS: they use our own code (shown on screen).
  // Comma-separated E.164 numbers; a trailing * matches a prefix, e.g. +9190000*.
  // Not set in .env → the seeded demo accounts. Set it empty to turn this off.
  otpTestNumbers: (process.env.OTP_TEST_NUMBERS ?? DEMO_NUMBERS)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  // Optional fixed code for test numbers (handy on a deployed demo). Random if unset.
  otpTestCode: /^\d{6}$/.test(process.env.OTP_TEST_CODE ?? '') ? process.env.OTP_TEST_CODE : null,
}

if (env.smsProvider === 'twilio') {
  const missing = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_VERIFY_SERVICE_SID'].filter((k) => !process.env[k])
  if (missing.length) throw new Error(`SMS_PROVIDER=twilio needs ${missing.join(', ')} in server/.env`)
}

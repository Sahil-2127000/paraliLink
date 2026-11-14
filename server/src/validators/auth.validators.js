import { z } from 'zod'
import { LANGUAGES, SELF_SERVICE_ROLES } from '../models/user.model.js'

/** Indian mobile number: 10 digits starting 6–9, with or without +91 / spaces. Normalised to +91XXXXXXXXXX. */
export const phoneSchema = z
  .string({ error: 'Enter your mobile number.' })
  .transform((v) => v.replace(/[\s-]/g, '').replace(/^(\+91|91|0)(?=\d{10}$)/, ''))
  .refine((v) => /^[6-9]\d{9}$/.test(v), 'Enter a valid 10-digit Indian mobile number.')
  .transform((v) => `+91${v}`)

export const requestSchema = z.object({ phone: phoneSchema, language: z.enum(LANGUAGES).optional() })

export const verifySchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, 'The code has 6 digits.'),
  language: z.enum(LANGUAGES).default('pa'),
})

export const profileSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your name.').max(80).optional(),
    role: z.enum(SELF_SERVICE_ROLES, { error: 'Choose farmer, buyer or baler owner.' }).optional(),
    language: z.enum(LANGUAGES).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, 'Nothing to update.')

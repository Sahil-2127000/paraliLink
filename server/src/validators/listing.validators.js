import { z } from 'zod'
import { PUNJAB_BOUNDS, PUNJAB_DISTRICTS } from '../config/punjab.js'

export const createSchema = z.object({
  fieldName: z.string().trim().max(60).optional(),
  lat: z.number().min(PUNJAB_BOUNDS.minLat, 'The field must be in Punjab.').max(PUNJAB_BOUNDS.maxLat, 'The field must be in Punjab.'),
  lng: z.number().min(PUNJAB_BOUNDS.minLng, 'The field must be in Punjab.').max(PUNJAB_BOUNDS.maxLng, 'The field must be in Punjab.'),
  village: z.string().trim().min(2, 'Enter the village name.').max(80),
  district: z.enum(PUNJAB_DISTRICTS, { error: 'Choose a district.' }),
  acres: z.number().min(0.5, 'At least half an acre.').max(200, 'Up to 200 acres per listing.'),
  // Day the bales are ready at the field (stored as harvestDate).
  harvestDate: z.coerce.date({ error: 'Choose when the bales are ready.' }),
  bales: z.number().int().min(1, 'At least 1 bale.').max(20000).optional(),
  baledBy: z.enum(['own', 'app'], { error: 'Tell us who is baling the field.' }),
  ownBalerName: z.string().trim().max(80).optional(),
  ownBalerPhone: z
    .string()
    .trim()
    .regex(/^(\+91)?[6-9]\d{9}$/, 'Enter a 10-digit mobile number.')
    .optional()
    .or(z.literal('')),
  bookingId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
})

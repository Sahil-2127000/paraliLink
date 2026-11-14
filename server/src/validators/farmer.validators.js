import { z } from 'zod'
import { PUNJAB_BOUNDS, PUNJAB_DISTRICTS } from '../config/punjab.js'

const lat = z.coerce.number().min(PUNJAB_BOUNDS.minLat, 'The field must be in Punjab.').max(PUNJAB_BOUNDS.maxLat, 'The field must be in Punjab.')
const lng = z.coerce.number().min(PUNJAB_BOUNDS.minLng, 'The field must be in Punjab.').max(PUNJAB_BOUNDS.maxLng, 'The field must be in Punjab.')

/** Query for "balers near my field". */
export const nearbyBalersQuery = z.object({
  lat,
  lng,
  acres: z.coerce.number().min(0.5).max(200).default(5),
})

export const bookingSchema = z.object({
  balerId: z.string({ error: 'Choose a baler.' }).regex(/^[a-f\d]{24}$/i, 'Choose a baler.'),
  lat,
  lng,
  village: z.string().trim().min(2, 'Enter the village name.').max(80),
  district: z.enum(PUNJAB_DISTRICTS, { error: 'Choose a district.' }),
  acres: z.number().min(0.5, 'At least half an acre.').max(200, 'Up to 200 acres.'),
  date: z.coerce.date({ error: 'Choose the day.' }),
  note: z.string().trim().max(200).optional(),
})

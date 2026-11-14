import { Router } from 'express'
import { cancelBooking, listMyBookings, listNearbyBalers, requestBooking } from '../controllers/farmer.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { bookingSchema } from '../validators/farmer.validators.js'

/** Farmer tools beyond listings: finding and booking a baler. */
export const farmerRouter = Router()
farmerRouter.use(requireAuth, requireRole('farmer'))
farmerRouter.get('/balers', listNearbyBalers)
farmerRouter.get('/baler-bookings', listMyBookings)
farmerRouter.post('/baler-bookings', validateBody(bookingSchema), requestBooking)
farmerRouter.post('/baler-bookings/:id/cancel', cancelBooking)

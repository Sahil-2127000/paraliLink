import { Router } from 'express'
import { cancelListing, createListing, getListing, getMyListings, getSummary } from '../controllers/listing.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { createSchema } from '../validators/listing.validators.js'

export const listingsRouter = Router()
listingsRouter.use(requireAuth, requireRole('farmer'))
listingsRouter.post('/', validateBody(createSchema), createListing)
listingsRouter.get('/mine', getMyListings)
listingsRouter.get('/summary', getSummary)
listingsRouter.get('/:id', getListing)
listingsRouter.post('/:id/cancel', cancelListing)

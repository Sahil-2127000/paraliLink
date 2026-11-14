import { Router } from 'express'
import mongoose from 'mongoose'
import { authRouter } from './auth.routes.js'
import { farmerRouter } from './farmer.routes.js'
import { listingsRouter } from './listing.routes.js'

/**
 * Root API router, mounted at /api/v1.
 * Each feature module (auth, listings, clusters, orders, balers, payments, impact)
 * adds its own router here as it is built.
 */
export const apiRouter = Router()

apiRouter.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({
    data: {
      status: 'ok',
      db: dbStates[mongoose.connection.readyState] ?? 'unknown',
      time: new Date().toISOString(),
    },
  })
})

apiRouter.use('/auth', authRouter)
apiRouter.use('/listings', listingsRouter)
apiRouter.use('/farmer', farmerRouter)

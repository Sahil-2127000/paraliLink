import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorHandler, notFound } from './middleware/errors.js'
import { apiRouter } from './routes/index.js'

/** Builds the Express app. Kept separate from server.js so tests can import it. */
export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.set('trust proxy', 1) // Render and other hosts sit behind a proxy

  app.use(helmet())
  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '100kb' }))
  app.use(cookieParser())
  app.use(morgan(env.isProduction ? 'combined' : 'dev'))
  app.use(
    '/api',
    rateLimit({
      windowMs: 60 * 1000,
      limit: 120,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  )

  app.use('/api/v1', apiRouter)

  app.use(notFound)
  app.use(errorHandler)
  return app
}

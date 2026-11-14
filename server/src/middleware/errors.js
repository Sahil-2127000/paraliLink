import { env } from '../config/env.js'

/** An error with an HTTP status that is safe to show to the client. */
export class HttpError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }
}

export function notFound(req, res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

// Express recognises error handlers by their four arguments.
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status ?? 500
  if (status >= 500) console.error(err)

  res.status(status).json({
    error: {
      message: status >= 500 && env.isProduction ? 'Something went wrong. Please try again.' : err.message,
      ...(err.details ? { details: err.details } : {}),
    },
  })
}

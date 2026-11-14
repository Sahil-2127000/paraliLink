import { createApp } from './app.js'
import { connectDb, disconnectDb } from './config/db.js'
import { env } from './config/env.js'
import { loadRates } from './services/settings.service.js'

await connectDb()
// Rate card overrides saved from the admin console.
await loadRates()

const server = createApp().listen(env.port, () => {
  console.info(`[api] listening on http://localhost:${env.port}/api/v1`)
})

async function shutdown(signal) {
  console.info(`[api] ${signal} received, shutting down`)
  server.close(async () => {
    await disconnectDb()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

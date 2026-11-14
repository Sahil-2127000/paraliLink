import mongoose from 'mongoose'
import { env } from './env.js'

/** Connects to MongoDB. Exits the process if the first connection fails. */
export async function connectDb() {
  mongoose.set('strictQuery', true)
  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'))
  mongoose.connection.on('reconnected', () => console.info('[db] reconnected'))

  try {
    await mongoose.connect(env.mongodbUri, { serverSelectionTimeoutMS: 8000 })
    console.info(`[db] connected to ${mongoose.connection.name}`)
  } catch (error) {
    console.error('[db] could not connect:', error.message)
    process.exit(1)
  }
}

export async function disconnectDb() {
  await mongoose.disconnect()
}

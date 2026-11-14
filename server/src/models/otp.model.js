import mongoose from 'mongoose'

/**
 * One login code per request. Only a hash of the code is stored.
 * MongoDB deletes each document automatically after `expiresAt` (TTL index).
 */
const otpSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, index: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    consumed: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const OtpCode = mongoose.model('OtpCode', otpSchema)

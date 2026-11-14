import mongoose from 'mongoose'

/** Every admin action, newest first in the console. */
const auditSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorName: String,
    action: { type: String, required: true }, // e.g. "rates.update", "order.reoffer"
    summary: String,
    target: String,
    changes: [{ path: String, label: String, from: mongoose.Schema.Types.Mixed, to: mongoose.Schema.Types.Mixed, _id: false }],
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)
auditSchema.index({ createdAt: -1 })
export const AuditLog = mongoose.model('AuditLog', auditSchema)

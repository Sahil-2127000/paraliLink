import mongoose from 'mongoose'

/** Key/value settings saved by admins. `_id: 'rates'` holds rate card overrides. */
const settingSchema = new mongoose.Schema(
  {
    _id: { type: String },
    values: { type: mongoose.Schema.Types.Mixed, default: {} },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedByName: String,
  },
  { timestamps: true, minimize: false },
)
export const Setting = mongoose.model('Setting', settingSchema)

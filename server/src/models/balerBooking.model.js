import mongoose from 'mongoose'

/**
 * A farmer asking a registered baler to bale a field on a date.
 * requested → accepted / declined, or cancelled by the farmer; accepted → done.
 * Money is settled between farmer and baler directly; the rate is a snapshot for reference.
 */
export const BOOKING_STATUSES = ['requested', 'accepted', 'declined', 'cancelled', 'done']
export const OPEN_BOOKING = ['requested', 'accepted']

const balerBookingSchema = new mongoose.Schema(
  {
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    baler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    village: { type: String, required: true, trim: true, maxlength: 80 },
    district: { type: String, required: true, trim: true, maxlength: 40 },
    acres: { type: Number, required: true, min: 0.5, max: 200 },
    date: { type: Date, required: true }, // day the farmer wants the field baled
    note: { type: String, trim: true, maxlength: 200 },
    distanceKm: Number, // baler base → field, by road (estimate)
    ratePerAcre: Number, // baler's rate when requested
    status: { type: String, enum: BOOKING_STATUSES, default: 'requested', index: true },
    statusHistory: [{ status: { type: String, enum: BOOKING_STATUSES }, at: { type: Date, default: Date.now }, _id: false }],
    respondedAt: Date,
    declineReason: { type: String, trim: true, maxlength: 120 },
  },
  { timestamps: true },
)

export const BalerBooking = mongoose.model('BalerBooking', balerBookingSchema)

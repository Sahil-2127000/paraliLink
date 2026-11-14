import mongoose from 'mongoose'
import { nextSequence } from '../utils/counters.js'

/**
 * Lifecycle of a straw listing, in order. `cancelled` can happen from the
 * first two states only (before a buyer has ordered).
 */
export const LISTING_STATUSES = ['listed', 'clustered', 'sold', 'pickup_scheduled', 'picked_up', 'paid', 'cancelled']
export const CANCELLABLE = ['listed', 'clustered']
export const ACTIVE = ['listed', 'clustered', 'sold', 'pickup_scheduled', 'picked_up']

const pointSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['Point'], default: 'Point' },
    // GeoJSON order: [longitude, latitude]
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
)

const listingSchema = new mongoose.Schema(
  {
    // Short human number shown to farmers, e.g. 412 → "Listing 0412".
    number: { type: Number, required: true, unique: true },
    farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fieldName: { type: String, trim: true, maxlength: 60 },
    location: { type: pointSchema, required: true },
    village: { type: String, required: true, trim: true, maxlength: 80 },
    district: { type: String, required: true, trim: true, maxlength: 40 },
    acres: { type: Number, required: true, min: 0.5, max: 200 },
    estTonnes: { type: Number, required: true },
    bales: { type: Number, min: 1, max: 20000 }, // as counted by the farmer (optional)
    // Who bales the field. The farmer arranges and pays the baler directly.
    baling: {
      by: { type: String, enum: ['own', 'app'] },
      balerName: { type: String, trim: true, maxlength: 80 },
      balerPhone: { type: String, trim: true, maxlength: 20 },
      booking: { type: mongoose.Schema.Types.ObjectId, ref: 'BalerBooking' },
    },
    // Day the bales are (or will be) ready at the field. Clustering groups by its ISO week.
    harvestDate: { type: Date, required: true },
    harvestWeek: { type: String, required: true, index: true },
    crop: { type: String, default: 'paddy' },

    status: { type: String, enum: LISTING_STATUSES, default: 'listed', index: true },
    statusHistory: [{ status: { type: String, enum: LISTING_STATUSES }, at: { type: Date, default: Date.now }, _id: false }],

    // Filled in by later modules (clustering, orders, balers, payments).
    cluster: { name: String, farmCount: Number },
    clusterRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Cluster', index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    buyerName: String,
    pickup: {
      date: Date,
      window: String,
      code: String, // 6 digits, shown only to the owning farmer; the baler enters it
      balerName: String,
      balerVehicle: String,
      balerPhone: String,
      attempts: Number, // wrong-code tries by the baler (max 5)
      bales: Number,
    },
    verifiedTonnes: Number,
    payout: { amount: Number, upiRef: String, paidAt: Date },
  },
  { timestamps: true },
)

listingSchema.index({ location: '2dsphere' })
listingSchema.index({ status: 1, harvestWeek: 1 })

/** What the owning farmer sees. */
listingSchema.methods.toFarmerView = function toFarmerView() {
  const showCode = this.status === 'pickup_scheduled'
  return {
    id: this._id.toString(),
    number: this.number,
    label: `Listing ${String(this.number).padStart(4, '0')}`,
    fieldName: this.fieldName ?? null,
    location: { lat: this.location.coordinates[1], lng: this.location.coordinates[0] },
    village: this.village,
    district: this.district,
    acres: this.acres,
    estTonnes: this.estTonnes,
    bales: this.bales ?? null,
    baling: this.baling?.by ? { by: this.baling.by, balerName: this.baling.balerName ?? null } : null,
    harvestDate: this.harvestDate,
    readyDate: this.harvestDate,
    harvestWeek: this.harvestWeek,
    status: this.status,
    statusHistory: this.statusHistory,
    cancellable: CANCELLABLE.includes(this.status),
    cluster: this.cluster?.name ? this.cluster : null,
    buyerName: this.buyerName ?? null,
    pickup: this.pickup?.date
      ? {
          date: this.pickup.date,
          window: this.pickup.window,
          code: showCode ? this.pickup.code : null,
          balerName: this.pickup.balerName,
          balerVehicle: this.pickup.balerVehicle,
          balerPhone: showCode ? this.pickup.balerPhone : null,
        }
      : null,
    verifiedTonnes: this.verifiedTonnes ?? null,
    payout: this.payout?.amount ? this.payout : null,
    createdAt: this.createdAt,
  }
}

export const Listing = mongoose.model('Listing', listingSchema)

export async function nextListingNumber() {
  // Start at 400 so early numbers look like a running pilot ("Listing 0401").
  return 400 + (await nextSequence('listing'))
}

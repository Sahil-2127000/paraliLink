import mongoose from 'mongoose'

/**
 * A pickup cluster: nearby listed farms that harvest in the same week.
 * forming → ready (≥ min tonnes) → ordered (a buyer bought it).
 * Forming/ready clusters are rebuilt whenever listings change; ordered ones are frozen.
 */
export const CLUSTER_STATUSES = ['forming', 'ready', 'ordered']

const clusterSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true }, // e.g. "C-104"
    place: { type: String, required: true }, // village of the first farm
    district: { type: String, required: true },
    harvestWeek: { type: String, required: true, index: true },
    center: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    listings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
    farmCount: { type: Number, required: true },
    totalAcres: { type: Number, required: true },
    totalTonnes: { type: Number, required: true },
    // Road km to visit every farm once (nearest-neighbour order).
    routeKm: { type: Number, default: 0 },
    status: { type: String, enum: CLUSTER_STATUSES, default: 'forming', index: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true },
)

clusterSchema.index({ center: '2dsphere' })

export const Cluster = mongoose.model('Cluster', clusterSchema)

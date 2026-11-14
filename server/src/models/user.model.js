import mongoose from 'mongoose'

export const ROLES = ['farmer', 'buyer', 'baler', 'admin']
/** Roles a person can choose for themselves during onboarding. Admins are created by the team. */
export const SELF_SERVICE_ROLES = ['farmer', 'buyer', 'baler']
export const LANGUAGES = ['pa', 'en']
export const PLANT_TYPES = ['boiler', 'pellet', 'biogas', 'paper', 'other']
export const BALER_MACHINES = ['square', 'round', 'other']

const userSchema = new mongoose.Schema(
  {
    // Stored in E.164 form, e.g. +919876543210.
    phone: { type: String, required: true, unique: true, trim: true },
    name: { type: String, trim: true, maxlength: 80 },
    role: { type: String, enum: ROLES },
    language: { type: String, enum: LANGUAGES, default: 'pa' },
    // True once the person has picked a role and given their name.
    onboarded: { type: Boolean, default: false },
    lastLoginAt: { type: Date },

    // Buyers only: the plant straw is delivered to (distances and haul prices use it).
    buyer: {
      company: { type: String, trim: true, maxlength: 100 },
      plantType: { type: String, enum: PLANT_TYPES },
      district: { type: String, trim: true },
      plantLocation: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number], default: undefined },
      },
    },

    // Baler owners only: the machine and where it's parked (job offers go to the nearest).
    baler: {
      vehicle: { type: String, trim: true, maxlength: 20 }, // e.g. "PB-13"
      machine: { type: String, enum: BALER_MACHINES },
      capacityTonnesPerDay: { type: Number, min: 10, max: 150 },
      district: { type: String, trim: true },
      base: {
        type: { type: String, enum: ['Point'] },
        coordinates: { type: [Number], default: undefined },
      },
      available: { type: Boolean }, // unset = available
      // What the baler charges farmers per acre (farmers pay the baler directly).
      ratePerAcre: { type: Number, min: 0, max: 20000 },
    },
  },
  { timestamps: true },
)

userSchema.index({ 'baler.base': '2dsphere' }, { sparse: true })

/** The fields we send to the client. Never send internal fields wholesale. */
userSchema.methods.toPublic = function toPublic() {
  return {
    id: this._id.toString(),
    phone: this.phone,
    name: this.name ?? null,
    role: this.role ?? null,
    language: this.language,
    onboarded: this.onboarded,
    buyer:
      this.role === 'buyer'
        ? {
            company: this.buyer?.company ?? null,
            plantType: this.buyer?.plantType ?? null,
            district: this.buyer?.district ?? null,
            plant: this.buyer?.plantLocation?.coordinates?.length
              ? { lat: this.buyer.plantLocation.coordinates[1], lng: this.buyer.plantLocation.coordinates[0] }
              : null,
          }
        : undefined,
    baler:
      this.role === 'baler'
        ? {
            vehicle: this.baler?.vehicle ?? null,
            machine: this.baler?.machine ?? null,
            capacityTonnesPerDay: this.baler?.capacityTonnesPerDay ?? null,
            district: this.baler?.district ?? null,
            available: this.baler?.available ?? true,
            ratePerAcre: this.baler?.ratePerAcre ?? null,
            base: this.baler?.base?.coordinates?.length ? { lat: this.baler.base.coordinates[1], lng: this.baler.base.coordinates[0] } : null,
          }
        : undefined,
    createdAt: this.createdAt,
  }
}

export const User = mongoose.model('User', userSchema)

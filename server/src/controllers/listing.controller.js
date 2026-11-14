import mongoose from 'mongoose'
import { estimateTonnes, RATES } from '../config/rates.js'
import { HttpError } from '../middleware/errors.js'
import { BalerBooking } from '../models/balerBooking.model.js'
import { ACTIVE, CANCELLABLE, Listing, nextListingNumber } from '../models/listing.model.js'
import { scheduleRebuild, withClusterLock } from '../services/clustering.service.js'
import { isoWeekKey } from '../utils/isoWeek.js'

const MAX_ACTIVE = 5
const DAY = 86_400_000

async function findOwnListing(req) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Listing not found.')
  const listing = await Listing.findOne({ _id: req.params.id, farmer: req.user._id })
  if (!listing) throw new HttpError(404, 'Listing not found.')
  return listing
}

/**
 * List baled straw waiting at the field. The bales must be ready within the
 * last 2 weeks or the next 30 days. The farmer either used their own baler or
 * one booked through ParaliLink.
 */
export async function createListing(req, res) {
  const { harvestDate, lat, lng, acres, bales, baledBy, ownBalerName, ownBalerPhone, bookingId, ...rest } = req.body
  const now = Date.now()
  if (harvestDate.getTime() < now - 14 * DAY || harvestDate.getTime() > now + 30 * DAY) {
    throw new HttpError(400, 'Please check the highlighted fields.', {
      fields: { harvestDate: 'The bales must be ready within the last 2 weeks or the next 30 days.' },
    })
  }

  let baling = { by: baledBy }
  if (baledBy === 'own') {
    baling = { by: 'own', balerName: ownBalerName || undefined, balerPhone: ownBalerPhone ? `+91${ownBalerPhone.replace(/^\+91/, '')}` : undefined }
  } else if (bookingId) {
    const booking = await BalerBooking.findOne({ _id: bookingId, farmer: req.user._id }).populate('baler', 'name phone')
    if (!booking || ['declined', 'cancelled'].includes(booking.status)) {
      throw new HttpError(400, 'Please check the highlighted fields.', { fields: { bookingId: 'Choose one of your baler bookings.' } })
    }
    baling = { by: 'app', balerName: booking.baler?.name, balerPhone: booking.baler?.phone, booking: booking._id }
  }

  const activeCount = await Listing.countDocuments({ farmer: req.user._id, status: { $in: ACTIVE } })
  if (activeCount >= MAX_ACTIVE) {
    throw new HttpError(409, `You already have ${MAX_ACTIVE} active listings. Wait for one to be picked up first.`)
  }

  const listing = await Listing.create({
    ...rest,
    number: await nextListingNumber(),
    farmer: req.user._id,
    location: { type: 'Point', coordinates: [lng, lat] },
    acres,
    estTonnes: estimateTonnes(acres),
    bales,
    baling,
    harvestDate,
    harvestWeek: isoWeekKey(harvestDate),
    statusHistory: [{ status: 'listed' }],
  })
  scheduleRebuild()
  res.status(201).json({ data: { listing: listing.toFarmerView() } })
}

export async function getMyListings(req, res) {
  const listings = await Listing.find({ farmer: req.user._id }).sort({ createdAt: -1 }).limit(50)
  res.json({ data: { listings: listings.map((l) => l.toFarmerView()) } })
}

/** Numbers for the farmer home and money screens. */
export async function getSummary(req, res) {
  const listings = await Listing.find({ farmer: req.user._id })
  const paid = listings.filter((l) => l.status === 'paid')
  const collected = listings.filter((l) => ['picked_up', 'paid'].includes(l.status))
  const active = listings
    .filter((l) => ACTIVE.includes(l.status))
    .sort((a, b) => (a.pickup?.date ?? a.harvestDate) - (b.pickup?.date ?? b.harvestDate))

  const earned = paid.reduce((sum, l) => sum + (l.payout?.amount ?? 0), 0)
  const tonnesSaved = collected.reduce((sum, l) => sum + (l.verifiedTonnes ?? l.estTonnes), 0)
  // Money still coming: verified weight if picked up, else the estimate, at the farmer rate.
  const upcoming = active
    .filter((l) => ['sold', 'pickup_scheduled', 'picked_up'].includes(l.status))
    .reduce((sum, l) => sum + (l.verifiedTonnes ?? l.estTonnes) * RATES.farmerPerTonne, 0)

  res.json({
    data: {
      farmerRate: RATES.farmerPerTonne,
      advancePct: RATES.advancePct,
      balanceDays: RATES.balanceDays,
      earned,
      upcoming: Math.round(upcoming),
      tonnesSaved: Math.round(tonnesSaved * 10) / 10,
      co2Avoided: Math.round(tonnesSaved * RATES.co2PerTonne * 10) / 10,
      activeCount: active.length,
      focus: active[0]?.toFarmerView() ?? null,
      payments: paid
        .sort((a, b) => b.payout.paidAt - a.payout.paidAt)
        .map((l) => ({ id: l._id.toString(), label: `Listing ${String(l.number).padStart(4, '0')}`, fieldName: l.fieldName ?? null, tonnes: l.verifiedTonnes, amount: l.payout.amount, paidAt: l.payout.paidAt })),
    },
  })
}

export async function getListing(req, res) {
  const listing = await findOwnListing(req)
  res.json({ data: { listing: listing.toFarmerView() } })
}

export async function cancelListing(req, res) {
  // Inside the cluster lock so a buyer can't order this farm at the same moment.
  const listing = await withClusterLock(async () => {
    const own = await findOwnListing(req)
    if (!CANCELLABLE.includes(own.status)) {
      throw new HttpError(409, 'A buyer has already ordered this straw, so it can’t be cancelled here. Call ParaliLink for help.')
    }
    own.status = 'cancelled'
    own.clusterRef = undefined
    own.cluster = undefined
    own.statusHistory.push({ status: 'cancelled' })
    await own.save()
    return own
  })
  scheduleRebuild()
  res.json({ data: { listing: listing.toFarmerView() } })
}

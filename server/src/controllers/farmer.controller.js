import mongoose from 'mongoose'
import { HttpError } from '../middleware/errors.js'
import { BalerBooking, OPEN_BOOKING } from '../models/balerBooking.model.js'
import { User } from '../models/user.model.js'
import { roadKm } from '../utils/geo.js'
import { baseOf } from '../utils/location.js'
import { nearbyBalersQuery } from '../validators/farmer.validators.js'

const DAY = 86_400_000
const SEARCH_KM = 50
const MAX_OPEN_BOOKINGS = 3
const round1 = (n) => Math.round(n * 10) / 10

function startOfDay(d) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function balerCard(baler, field, acres) {
  const base = baseOf(baler)
  const km = base ? round1(roadKm(base, field)) : null
  const rate = baler.baler?.ratePerAcre ?? null
  return {
    id: baler._id.toString(),
    name: baler.name,
    phone: baler.phone,
    vehicle: baler.baler?.vehicle ?? null,
    machine: baler.baler?.machine ?? null,
    district: baler.baler?.district ?? null,
    distanceKm: km,
    ratePerAcre: rate,
    estCost: rate != null ? Math.round(rate * acres) : null,
  }
}

function bookingView(b) {
  const baler = b.baler && typeof b.baler === 'object' && b.baler.name !== undefined ? b.baler : null
  return {
    id: b._id.toString(),
    status: b.status,
    date: b.date,
    village: b.village,
    district: b.district,
    acres: b.acres,
    note: b.note ?? null,
    ratePerAcre: b.ratePerAcre ?? null,
    estCost: b.ratePerAcre != null ? Math.round(b.ratePerAcre * b.acres) : null,
    distanceKm: b.distanceKm ?? null,
    location: { lat: b.location.coordinates[1], lng: b.location.coordinates[0] },
    baler: baler ? { id: baler._id.toString(), name: baler.name, phone: baler.phone, vehicle: baler.baler?.vehicle ?? null, machine: baler.baler?.machine ?? null } : null,
    declineReason: b.declineReason ?? null,
    createdAt: b.createdAt,
    respondedAt: b.respondedAt ?? null,
  }
}

/** Registered balers within 50 km of the field (by base location), nearest first. */
export async function listNearbyBalers(req, res) {
  const parsed = nearbyBalersQuery.safeParse(req.query)
  if (!parsed.success) throw new HttpError(400, 'Pick your field on the map first.')
  const { lat, lng, acres } = parsed.data
  const balers = await User.find({
    role: 'baler',
    'baler.available': { $ne: false },
    'baler.base': { $nearSphere: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: SEARCH_KM * 1000 } },
  }).limit(20)
  // The geo query is straight-line; keep only balers within SEARCH_KM by road.
  const cards = balers.map((b) => balerCard(b, { lat, lng }, acres)).filter((c) => c.distanceKm == null || c.distanceKm <= SEARCH_KM)
  res.json({ data: { balers: cards, searchKm: SEARCH_KM } })
}

/** Ask a registered baler to bale a field on a day. The farmer pays the baler directly. */
export async function requestBooking(req, res) {
  const { balerId, lat, lng, date, ...rest } = req.body
  const day = startOfDay(date)
  const today = startOfDay(new Date())
  if (day < today || day.getTime() > today.getTime() + 45 * DAY) {
    throw new HttpError(400, 'Please check the highlighted fields.', { fields: { date: 'Choose a day from today to 6 weeks ahead.' } })
  }

  const baler = await User.findOne({ _id: balerId, role: 'baler' })
  if (!baler || !baseOf(baler)) throw new HttpError(404, 'This baler isn’t available on ParaliLink.')
  if (baler.baler?.available === false) throw new HttpError(409, 'This baler isn’t taking bookings right now. Try another one.')

  const open = await BalerBooking.countDocuments({ farmer: req.user._id, status: { $in: OPEN_BOOKING } })
  if (open >= MAX_OPEN_BOOKINGS) throw new HttpError(409, `You already have ${MAX_OPEN_BOOKINGS} open baler bookings. Cancel one or wait for it to finish.`)
  const duplicate = await BalerBooking.exists({ farmer: req.user._id, baler: baler._id, date: day, status: { $in: OPEN_BOOKING } })
  if (duplicate) throw new HttpError(409, 'You’ve already asked this baler for that day.')

  const booking = await BalerBooking.create({
    ...rest,
    farmer: req.user._id,
    baler: baler._id,
    location: { type: 'Point', coordinates: [lng, lat] },
    date: day,
    distanceKm: round1(roadKm(baseOf(baler), { lat, lng })),
    ratePerAcre: baler.baler?.ratePerAcre,
    statusHistory: [{ status: 'requested' }],
  })
  booking.baler = baler
  res.status(201).json({ data: { booking: bookingView(booking) } })
}

export async function listMyBookings(req, res) {
  const bookings = await BalerBooking.find({ farmer: req.user._id }).sort({ date: -1 }).limit(30).populate('baler', 'name phone baler.vehicle baler.machine')
  res.json({ data: { bookings: bookings.map(bookingView) } })
}

export async function cancelBooking(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, 'Booking not found.')
  const booking = await BalerBooking.findOne({ _id: req.params.id, farmer: req.user._id }).populate('baler', 'name phone baler.vehicle baler.machine')
  if (!booking) throw new HttpError(404, 'Booking not found.')
  if (!OPEN_BOOKING.includes(booking.status)) throw new HttpError(409, 'This booking is already closed.')
  booking.status = 'cancelled'
  booking.statusHistory.push({ status: 'cancelled' })
  await booking.save()
  res.json({ data: { booking: bookingView(booking) } })
}

export { bookingView }

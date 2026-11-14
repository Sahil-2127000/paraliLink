import { api } from '../../lib/api'

export const farmerApi = {
  summary: (signal) => api('/listings/summary', { signal }),
  mine: (signal) => api('/listings/mine', { signal }),
  get: (id, signal) => api(`/listings/${id}`, { signal }),
  create: (body) => api('/listings', { method: 'POST', body }),
  cancel: (id) => api(`/listings/${id}/cancel`, { method: 'POST' }),
  balersNear: ({ lat, lng, acres }, signal) => api(`/farmer/balers?lat=${lat}&lng=${lng}&acres=${acres}`, { signal }),
  bookings: (signal) => api('/farmer/baler-bookings', { signal }),
  bookBaler: (body) => api('/farmer/baler-bookings', { method: 'POST', body }),
  cancelBooking: (id) => api(`/farmer/baler-bookings/${id}/cancel`, { method: 'POST' }),
}

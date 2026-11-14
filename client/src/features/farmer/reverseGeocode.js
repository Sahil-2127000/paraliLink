import { PUNJAB_DISTRICTS } from './copy'

/**
 * Looks up the village and district for a map point using OpenStreetMap's
 * Nominatim service (free, about 1 request per second, attribution required).
 * Returns { village, district } with district matched to our list, or nulls.
 */
export async function reverseGeocode(lat, lng, signal) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&addressdetails=1&accept-language=en&lat=${lat}&lon=${lng}`
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
  if (!res.ok) return { village: null, district: null }
  const { address = {} } = await res.json()

  const village = address.village ?? address.hamlet ?? address.town ?? address.suburb ?? address.city ?? null
  const rawDistrict = (address.state_district ?? address.county ?? '').replace(/ district$/i, '').trim().toLowerCase()
  const district =
    PUNJAB_DISTRICTS.find((d) => d.toLowerCase() === rawDistrict) ??
    PUNJAB_DISTRICTS.find((d) => rawDistrict && (d.toLowerCase().includes(rawDistrict) || rawDistrict.includes(d.toLowerCase().split(' ')[0]))) ??
    null

  return { village, district }
}

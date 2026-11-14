/** GeoJSON points on users → { lat, lng }, or null when not set up yet. */

/** A buyer's plant location. */
export function plantOf(user) {
  const c = user?.buyer?.plantLocation?.coordinates
  return c?.length ? { lat: c[1], lng: c[0] } : null
}

/** A baler's base (where the machine is parked). */
export function baseOf(user) {
  const c = user?.baler?.base?.coordinates
  return c?.length ? { lat: c[1], lng: c[0] } : null
}

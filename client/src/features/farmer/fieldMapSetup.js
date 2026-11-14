/**
 * Leaflet map with a draggable pin for choosing a field. Loaded on demand
 * (dynamic import) so Leaflet never ships in the main bundle.
 */
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const PIN_HTML = `<svg width="34" height="46" viewBox="0 0 34 46" aria-hidden="true"><path d="M17 45S2 27 2 17a15 15 0 0 1 30 0c0 10-15 28-15 28Z" fill="#1C3324" stroke="#FBF8F0" stroke-width="2"/><rect x="12" y="12" width="10" height="10" fill="#D8A532"/></svg>`

export function createFieldPicker(container, { center, zoom, pin, onChange }) {
  const map = L.map(container, { center, zoom, zoomControl: true, attributionControl: true, scrollWheelZoom: true })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  const icon = L.divIcon({ className: 'pl-pin', html: PIN_HTML, iconSize: [34, 46], iconAnchor: [17, 45] })
  let marker = null

  function place(latlng, { pan = false } = {}) {
    if (!marker) {
      marker = L.marker(latlng, { icon, draggable: true, autoPan: true, keyboard: true, title: 'Field location (drag to adjust)' }).addTo(map)
      marker.on('dragend', () => {
        const p = marker.getLatLng()
        onChange({ lat: p.lat, lng: p.lng })
      })
    } else {
      marker.setLatLng(latlng)
    }
    if (pan) map.setView(latlng, Math.max(map.getZoom(), 15))
    onChange({ lat: latlng.lat ?? latlng[0], lng: latlng.lng ?? latlng[1] })
  }

  if (pin) place(pin)
  map.on('click', (e) => place(e.latlng))

  return {
    setPin: (lat, lng) => place(L.latLng(lat, lng), { pan: true }),
    destroy: () => map.remove(),
  }
}

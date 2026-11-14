/**
 * Builds the real-map cluster illustration with Leaflet.
 * This file is loaded with a dynamic import, so Leaflet (and its CSS) only
 * download when the map is about to scroll into view.
 */
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CENTER = [30.268, 76.038] // Bhawanigarh, Sangrur district
const METERS_PER_DEG_LAT = 111_320

/** Moves a [lat, lng] point by metres east / north. */
function offset([lat, lng], east, north) {
  return [lat + north / METERS_PER_DEG_LAT, lng + east / (METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180))]
}

/**
 * Three example pickup clusters on real ground. Farm positions are illustrative.
 * farms: [east m, north m] from the cluster centre, plus where the marker starts
 * before it slides in ([dx, dy] in px).
 */
const CLUSTERS = [
  {
    name: 'Cluster A',
    center: [30.289, 76.012],
    radius: 1600,
    farms: [[-900, 700, -150, -90], [800, 900, 120, -110], [-1100, -600, -90, 140], [900, -500, 170, 90], [-100, 100, -40, 200]],
  },
  {
    name: 'Cluster B',
    center: [30.293, 76.07],
    radius: 1350,
    farms: [[-700, 600, -90, -80], [850, 350, 130, -40], [500, -800, 60, 170], [-900, -500, -200, 60]],
  },
  {
    name: 'Cluster C',
    center: [30.244, 76.055],
    radius: 1500,
    farms: [[-1000, -500, -170, 70], [900, -800, 120, 60], [1100, 400, 150, -160], [100, 1000, -40, -170], [-400, 150, -130, -40]],
  },
]

export function createClusterMap(container) {
  const touch = L.Browser.mobile

  const map = L.map(container, {
    center: CENTER,
    zoom: 13,
    minZoom: 10,
    maxZoom: 16,
    zoomControl: false,
    scrollWheelZoom: false, // never hijack page scrolling
    dragging: !touch, // on phones, one-finger swipes should scroll the page
    tap: false,
    attributionControl: true,
  })

  L.control.zoom({ position: 'topright' }).addTo(map)
  L.control.scale({ position: 'bottomleft', imperial: false, maxWidth: 140 }).addTo(map)

  // OpenStreetMap's standard tiles: free with attribution for light use (fine for
  // the pilot and demo). For production traffic switch to a tile provider such as
  // MapTiler or Stadia (free tiers need an API key); only this URL changes.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)

  const rings = []
  let farmIndex = 0
  CLUSTERS.forEach((cluster, ci) => {
    const ring = L.circle(cluster.center, {
      radius: cluster.radius,
      className: 'pl-ring',
      color: '#1C3324',
      weight: 2,
      dashArray: '6 6',
      fillColor: '#D8A532',
      fillOpacity: 0.2,
      interactive: false,
    }).addTo(map)
    rings.push(ring)

    cluster.farms.forEach(([east, north, dx, dy]) => {
      const delay = (farmIndex++ * 0.04).toFixed(2)
      L.marker(offset(cluster.center, east, north), {
        interactive: false,
        keyboard: false,
        icon: L.divIcon({
          className: 'pl-farm-icon',
          iconSize: [14, 14],
          html: `<span class="pl-farm" style="--dx:${dx}px;--dy:${dy}px;--delay:${delay}s"></span>`,
        }),
      }).addTo(map)
    })

    // Label just below the circle.
    L.marker(offset(cluster.center, 0, -cluster.radius - 250), {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({
        className: 'pl-label-icon',
        iconSize: null,
        // Text is set (and re-set on language change) by ClusterMap via data-cluster / data-farms.
        html: `<span class="pl-label" data-cluster="${ci}" data-farms="${cluster.farms.length}" style="--delay:${(1.2 + ci * 0.15).toFixed(2)}s">${cluster.name} · ${cluster.farms.length} farms</span>`,
      }),
    }).addTo(map)
  })

  // Frame all three clusters (extra room at the bottom for the labels).
  map.fitBounds(L.featureGroup(rings).getBounds(), {
    paddingTopLeft: [24, 48],
    paddingBottomRight: [24, 56],
    animate: false,
  })

  return map
}

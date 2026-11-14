/**
 * Marketplace rate card. These are the defaults; the admin console can override
 * them (saved in the `settings` collection and applied at startup and on save).
 *
 * Money model: the buyer pays one delivered price per tonne, split between the
 * farmer (fixed rate everywhere) and the baler (paid by cost driver).
 * No ParaliLink fee during the pilot.
 *
 * Every order stores a snapshot of the rates it was priced with, so a change
 * here only affects orders placed after it.
 */
export const RATES = {
  // Farm-gate price for baled straw (the farmer has paid their own baler). Placeholder.
  farmerPerTonne: 1800,
  // Industry pays this share of the estimate when it books a cluster; the rest
  // (on the weighed tonnes) within `balanceDays` of pickup.
  advancePct: 25,
  balanceDays: 7,
  tonnesPerAcre: 2.4,
  co2PerTonne: 1.46,
  baler: {
    jobFee: 500,
    perKm: 30,
    perFarm: 300,
    balingPerTonne: 400,
    haulPerTonneKm: 12,
    fuelAdvancePct: 25,
    // Until a baler is matched, assume this drive from the baler's base to the cluster.
    estApproachKm: 15,
  },
  clustering: {
    radiusKm: 5, // farms within this distance of the seed farm can join
    minTonnes: 30, // below this a cluster is still "forming" and can't be ordered
    maxTonnes: 120, // about what one baler can clear in two days
  },
  // Straight-line distance × this ≈ road distance in rural Punjab.
  roadFactor: 1.3,
}

export const DEFAULT_RATES = structuredClone(RATES)

/**
 * The fields the admin console may edit, with safe ranges.
 * `path` is the key path inside RATES.
 */
export const RATE_FIELDS = [
  { path: 'farmerPerTonne', group: 'farmer', label: 'Farm-gate rate (baled)', unit: '₹ / t', min: 300, max: 6000, step: 50 },
  { path: 'advancePct', group: 'farmer', label: 'Advance on booking', unit: '% of estimate', min: 0, max: 80, step: 5 },
  { path: 'balanceDays', group: 'farmer', label: 'Balance paid within', unit: 'days of pickup', min: 1, max: 30, step: 1 },
  { path: 'baler.jobFee', group: 'baler', label: 'Job fee', unit: '₹ / job', min: 0, max: 5000, step: 50 },
  { path: 'baler.perKm', group: 'baler', label: 'Driving', unit: '₹ / km', min: 5, max: 200, step: 1 },
  { path: 'baler.perFarm', group: 'baler', label: 'Per farm stop', unit: '₹ / farm', min: 0, max: 2000, step: 25 },
  { path: 'baler.balingPerTonne', group: 'baler', label: 'Baling', unit: '₹ / t', min: 100, max: 2000, step: 25 },
  { path: 'baler.haulPerTonneKm', group: 'baler', label: 'Haul', unit: '₹ / t·km', min: 1, max: 60, step: 0.5 },
  { path: 'baler.fuelAdvancePct', group: 'baler', label: 'Fuel advance', unit: '%', min: 0, max: 60, step: 5 },
  { path: 'baler.estApproachKm', group: 'baler', label: 'Assumed drive to cluster', unit: 'km', min: 0, max: 80, step: 1 },
  { path: 'clustering.radiusKm', group: 'clustering', label: 'Cluster radius', unit: 'km', min: 1, max: 15, step: 0.5 },
  { path: 'clustering.minTonnes', group: 'clustering', label: 'Ready at', unit: 't', min: 5, max: 200, step: 5 },
  { path: 'clustering.maxTonnes', group: 'clustering', label: 'Cluster cap', unit: 't', min: 20, max: 400, step: 5 },
  { path: 'co2PerTonne', group: 'impact', label: 'CO₂ avoided', unit: 't CO₂ / t straw', min: 0.5, max: 3, step: 0.01 },
]

const getPath = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj)
const setPath = (obj, path, value) => {
  const keys = path.split('.')
  const last = keys.pop()
  keys.reduce((o, k) => o[k], obj)[last] = value
}

/** Current values of the editable fields, as a flat { path: value } map. */
export function editableRates(source = RATES) {
  return Object.fromEntries(RATE_FIELDS.map((f) => [f.path, getPath(source, f.path)]))
}

/** Applies a flat { path: value } map onto RATES. Unknown keys are ignored. */
export function applyRateOverrides(values = {}) {
  for (const f of RATE_FIELDS) {
    const v = values[f.path]
    if (typeof v === 'number' && Number.isFinite(v)) setPath(RATES, f.path, v)
  }
}

/** Money rates copied onto an order, so later rate changes don't touch it. */
export function rateSnapshot() {
  return { farmerPerTonne: RATES.farmerPerTonne, advancePct: RATES.advancePct, balanceDays: RATES.balanceDays, baler: { ...RATES.baler } }
}

/** Estimated straw for a field, rounded to 0.1 t. */
export function estimateTonnes(acres) {
  return Math.round(acres * RATES.tonnesPerAcre * 10) / 10
}

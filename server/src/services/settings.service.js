import { applyRateOverrides, DEFAULT_RATES, editableRates, RATE_FIELDS, RATES } from '../config/rates.js'
import { HttpError } from '../middleware/errors.js'
import { Setting } from '../models/setting.model.js'
import { audit } from './audit.service.js'
import { scheduleRebuild } from './clustering.service.js'

/** Applies saved overrides at startup (after the DB connects). */
export async function loadRates() {
  const saved = await Setting.findById('rates').lean()
  if (saved?.values) applyRateOverrides(saved.values)
  return saved
}

/** Checks a flat { path: value } map against RATE_FIELDS ranges. Returns the cleaned map. */
export function checkRateValues(input) {
  const fields = {}
  const clean = {}
  for (const f of RATE_FIELDS) {
    if (input[f.path] === undefined) continue
    const v = Number(input[f.path])
    if (!Number.isFinite(v)) fields[f.path] = `${f.label}: enter a number.`
    else if (v < f.min || v > f.max) fields[f.path] = `${f.label} must be between ${f.min} and ${f.max} ${f.unit}.`
    else clean[f.path] = Math.round(v * 100) / 100
  }
  const merged = { ...editableRates(), ...clean }
  if (merged['clustering.minTonnes'] >= merged['clustering.maxTonnes']) {
    fields['clustering.minTonnes'] = 'Ready-at tonnes must be below the cluster cap.'
  }
  if (Object.keys(fields).length) throw new HttpError(400, 'Please check the highlighted fields.', { fields })
  return clean
}

/** Saves new rates, applies them now, logs the change, and rebuilds clusters if the rules changed. */
export async function saveRates(input, user) {
  const clean = checkRateValues(input)
  const before = editableRates()
  const changes = RATE_FIELDS.filter((f) => clean[f.path] !== undefined && clean[f.path] !== before[f.path]).map((f) => ({
    path: f.path,
    label: f.label,
    from: before[f.path],
    to: clean[f.path],
  }))
  if (!changes.length) return { changes, values: before }

  applyRateOverrides(clean)
  const values = editableRates()
  // Store only values that differ from the defaults, so a code default change still flows through.
  const defaults = editableRates(DEFAULT_RATES)
  const overrides = Object.fromEntries(Object.entries(values).filter(([k, v]) => v !== defaults[k]))
  await Setting.findByIdAndUpdate('rates', { values: overrides, updatedBy: user._id, updatedByName: user.name }, { upsert: true })
  await audit(user, 'rates.update', changes.map((c) => `${c.label} ${c.from} → ${c.to}`).join(' · '), { target: 'rates', changes })

  if (changes.some((c) => c.path.startsWith('clustering.'))) scheduleRebuild()
  return { changes, values }
}

export { RATES }

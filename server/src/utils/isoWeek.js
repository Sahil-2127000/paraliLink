/**
 * ISO-8601 week key for a date, e.g. "2026-W43". Clustering groups farms that
 * harvest in the same week, so every listing stores this key.
 */
export function isoWeekKey(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = d.getUTCDay() || 7 // Monday = 1 … Sunday = 7
  d.setUTCDate(d.getUTCDate() + 4 - day) // Thursday decides the week's year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d - yearStart) / 86_400_000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

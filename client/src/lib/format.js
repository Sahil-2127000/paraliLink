/** Indian number formatting (lakh grouping), e.g. 115588 → "1,15,588". */
export function formatNumber(value, decimals = 0) {
  return Number(value).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/** Rupees with Indian grouping, e.g. 115588 → "₹1,15,588". */
export function formatRupees(value) {
  return `₹${formatNumber(Math.round(value))}`
}

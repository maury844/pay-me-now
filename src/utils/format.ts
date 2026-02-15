export const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export const toMonthsLabel = (months: number): string => {
  const years = Math.floor(months / 12)
  const leftoverMonths = months % 12
  return `${years}y ${leftoverMonths}m`
}

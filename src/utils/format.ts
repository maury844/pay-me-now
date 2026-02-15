import type { CurrencyCode } from '../types/app'

const currencyFormatterCache: Partial<Record<CurrencyCode, Intl.NumberFormat>> =
  {}

export const getCurrencyFormatter = (currency: CurrencyCode): Intl.NumberFormat => {
  if (currencyFormatterCache[currency]) return currencyFormatterCache[currency]

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 2,
  })

  currencyFormatterCache[currency] = formatter
  return formatter
}

export const currencyFormatter = getCurrencyFormatter('USD')

export const formatCurrency = (amount: number, currency: CurrencyCode): string => {
  return getCurrencyFormatter(currency).format(amount)
}

export const getCurrencyInputLabel = (currency: CurrencyCode): string => {
  return currency === 'USD' ? '$' : 'BOB'
}

export const toMonthsLabel = (months: number): string => {
  const years = Math.floor(months / 12)
  const leftoverMonths = months % 12
  return `${years}y ${leftoverMonths}m`
}

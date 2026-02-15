import type { SimResult } from '../simulation'
import type { ChartRow } from '../types/app'

export const toSafeNumber = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

export const buildChartRows = (
  baselineRows: SimResult['rows'],
  extraRows: SimResult['rows'],
): ChartRow[] => {
  const maxLength = Math.max(baselineRows.length, extraRows.length)
  if (maxLength === 0) return []

  let lastBaselineBalance = baselineRows[0]?.balance ?? 0
  let lastBaselineInterest = baselineRows[0]?.cumulativeInterest ?? 0
  let lastExtraBalance = extraRows[0]?.balance ?? 0
  let lastExtraInterest = extraRows[0]?.cumulativeInterest ?? 0

  return Array.from({ length: maxLength }, (_, index) => {
    const month = index + 1
    const baseline = baselineRows[index]
    const extra = extraRows[index]

    if (baseline) {
      lastBaselineBalance = baseline.balance
      lastBaselineInterest = baseline.cumulativeInterest
    }

    if (extra) {
      lastExtraBalance = extra.balance
      lastExtraInterest = extra.cumulativeInterest
    }

    return {
      month,
      baselineBalance: baseline ? baseline.balance : lastBaselineBalance,
      extraBalance: extra ? extra.balance : lastExtraBalance,
      baselineInterest: baseline
        ? baseline.cumulativeInterest
        : lastBaselineInterest,
      extraInterest: extra ? extra.cumulativeInterest : lastExtraInterest,
    }
  })
}

export type TermUnit = 'years' | 'months'
export type CurrencyCode = 'USD' | 'BOB'
export type RateMode = 'FIXED_PLUS_VARIABLE' | 'ALWAYS_FIXED'

export type InputState = {
  principal: number
  termValue: number
  fixedMonths: number
  fixedApr: number
  variableBaseApr: number
  tre: number
  monthlyExtra: number
}

export type ChartRow = {
  month: number
  baselineBalance: number
  extraBalance: number
  baselineInterest: number
  extraInterest: number
}

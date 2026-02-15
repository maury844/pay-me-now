import { MetricCard } from './MetricCard'
import type { CurrencyCode } from '../types/app'
import { formatCurrency, toMonthsLabel } from '../utils/format'

type SummaryCardsProps = {
  baselinePayoffMonths: number
  extraPayoffMonths: number
  monthsSaved: number
  baselineTotalInterest: number
  extraTotalInterest: number
  interestAvoided: number
  currency: CurrencyCode
  exchangeRate: number
}

export function SummaryCards({
  baselinePayoffMonths,
  extraPayoffMonths,
  monthsSaved,
  baselineTotalInterest,
  extraTotalInterest,
  interestAvoided,
  currency,
  exchangeRate,
}: SummaryCardsProps) {
  const toSelectedCurrency = (usdAmount: number): number => {
    if (currency === 'USD') return usdAmount
    return usdAmount * exchangeRate
  }

  const moneyCardValues = (usdAmount: number): { value: string; subValue: string } => {
    const selectedAmount = toSelectedCurrency(usdAmount)
    return {
      value: `${formatCurrency(selectedAmount, currency)} (${currency})`,
      subValue: `$ equivalent: ${formatCurrency(usdAmount, 'USD')}`,
    }
  }

  const baselineInterestDisplay = moneyCardValues(baselineTotalInterest)
  const extraInterestDisplay = moneyCardValues(extraTotalInterest)
  const interestAvoidedDisplay = moneyCardValues(interestAvoided)

  return (
    <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
      <MetricCard
        title='Baseline payoff'
        value={`${baselinePayoffMonths} months (${toMonthsLabel(
          baselinePayoffMonths,
        )})`}
      />
      <MetricCard
        title='With-extra payoff'
        value={`${extraPayoffMonths} months (${toMonthsLabel(extraPayoffMonths)})`}
      />
      <MetricCard title='Months saved' value={`${monthsSaved}`} accent />
      <MetricCard
        title='Baseline total interest'
        value={baselineInterestDisplay.value}
        subValue={baselineInterestDisplay.subValue}
      />
      <MetricCard
        title='With-extra total interest'
        value={extraInterestDisplay.value}
        subValue={extraInterestDisplay.subValue}
      />
      <MetricCard
        title='Interest avoided'
        value={interestAvoidedDisplay.value}
        subValue={interestAvoidedDisplay.subValue}
        accent
      />
    </div>
  )
}

import { MetricCard } from './MetricCard'
import { currencyFormatter, toMonthsLabel } from '../utils/format'

type SummaryCardsProps = {
  baselinePayoffMonths: number
  extraPayoffMonths: number
  monthsSaved: number
  baselineTotalInterest: number
  extraTotalInterest: number
  interestAvoided: number
}

export function SummaryCards({
  baselinePayoffMonths,
  extraPayoffMonths,
  monthsSaved,
  baselineTotalInterest,
  extraTotalInterest,
  interestAvoided,
}: SummaryCardsProps) {
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
        value={currencyFormatter.format(baselineTotalInterest)}
      />
      <MetricCard
        title='With-extra total interest'
        value={currencyFormatter.format(extraTotalInterest)}
      />
      <MetricCard
        title='Interest avoided'
        value={currencyFormatter.format(interestAvoided)}
        accent
      />
    </div>
  )
}

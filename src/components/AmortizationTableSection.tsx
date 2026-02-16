import { useMemo, useState } from 'react'
import type { AmortizationRow } from '../simulation'
import type { CurrencyCode } from '../types/app'
import { formatCurrency } from '../utils/format'
import { classNameHelper } from '../utils/classNameHelper'
import { Card } from './ui/Card'

type TableScenario = 'extra' | 'baseline'

type AmortizationTableSectionProps = {
  baselineRows: AmortizationRow[]
  extraRows: AmortizationRow[]
  currency: CurrencyCode
  exchangeRate: number
}

function ScenarioButton({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={classNameHelper(
        'rounded-md px-3 py-1 text-sm',
        active ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300',
      )}
    >
      {label}
    </button>
  )
}

export function AmortizationTableSection({
  baselineRows,
  extraRows,
  currency,
  exchangeRate,
}: AmortizationTableSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [tableScenario, setTableScenario] = useState<TableScenario>('extra')

  const tableRows = useMemo(
    () => (tableScenario === 'extra' ? extraRows : baselineRows),
    [baselineRows, extraRows, tableScenario],
  )
  const toSelectedCurrency = (usdAmount: number): number => {
    if (currency === 'USD') return usdAmount
    return usdAmount * exchangeRate
  }
  const formatMoney = (usdAmount: number): string => {
    return formatCurrency(toSelectedCurrency(usdAmount), currency)
  }

  return (
    <Card>
      <button
        type='button'
        onClick={() => setIsOpen((current) => !current)}
        className='flex w-full items-center justify-between rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-sky-400'
      >
        <span>Table</span>
        <span className='text-lg leading-none text-slate-300'>{isOpen ? 'v' : '>'}</span>
      </button>

      <div
        className={classNameHelper(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'mt-3 max-h-[70vh]' : 'max-h-0',
        )}
      >
        {isOpen ? (
          <div className='rounded-lg border border-slate-700'>
            <div className='flex items-center gap-2 border-b border-slate-700 bg-slate-950 p-3'>
              <span className='text-sm text-slate-300'>Scenario:</span>
              <ScenarioButton
                label='Extra'
                active={tableScenario === 'extra'}
                onClick={() => setTableScenario('extra')}
              />
              <ScenarioButton
                label='Baseline'
                active={tableScenario === 'baseline'}
                onClick={() => setTableScenario('baseline')}
              />
            </div>

            <div className='max-h-[55vh] overflow-auto'>
              <table className='min-w-full text-sm'>
                <thead className='sticky top-0 bg-slate-950 text-slate-300'>
                  <tr>
                    <th className='px-3 py-2 text-left font-medium'>Month</th>
                    <th className='px-3 py-2 text-left font-medium'>APR (total)</th>
                    <th className='px-3 py-2 text-left font-medium'>
                      Scheduled payment ({currency})
                    </th>
                    <th className='px-3 py-2 text-left font-medium'>
                      Extra ({currency})
                    </th>
                    <th className='px-3 py-2 text-left font-medium'>
                      Interest ({currency})
                    </th>
                    <th className='px-3 py-2 text-left font-medium'>
                      Principal ({currency})
                    </th>
                    <th className='px-3 py-2 text-left font-medium'>
                      Balance ({currency})
                    </th>
                    <th className='px-3 py-2 text-left font-medium'>
                      Cumulative interest ({currency})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row) => (
                    <tr
                      key={row.month}
                      className='border-t border-slate-800 text-slate-200'
                    >
                      <td className='px-3 py-2'>{row.month}</td>
                      <td className='px-3 py-2'>{row.apr.toFixed(2)}%</td>
                      <td className='px-3 py-2'>{formatMoney(row.scheduledPayment)}</td>
                      <td className='px-3 py-2'>{formatMoney(row.extra)}</td>
                      <td className='px-3 py-2'>{formatMoney(row.interest)}</td>
                      <td className='px-3 py-2'>{formatMoney(row.principal)}</td>
                      <td className='px-3 py-2'>{formatMoney(row.balance)}</td>
                      <td className='px-3 py-2'>{formatMoney(row.cumulativeInterest)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  )
}

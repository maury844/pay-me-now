import { useMemo, useState } from 'react'
import { AmortizationTableSection } from './components/AmortizationTableSection'
import { ComparisonCharts } from './components/ComparisonCharts'
import { InputsCard } from './components/InputsCard'
import { SummaryCards } from './components/SummaryCards'
import { simulate } from './simulation'
import type { InputState, TermUnit } from './types/app'
import { buildChartRows, toSafeNumber } from './utils/simulationView'

const defaultInputs: InputState = {
  principal: 300000,
  termValue: 30,
  fixedMonths: 60,
  fixedApr: 4.5,
  variableBaseApr: 6,
  tre: 2.25,
  monthlyExtra: 250,
}

function App() {
  const [termUnit, setTermUnit] = useState<TermUnit>('years')
  const [inputs, setInputs] = useState<InputState>(defaultInputs)

  const termMonths = useMemo(() => {
    const rawMonths =
      termUnit === 'years' ? inputs.termValue * 12 : inputs.termValue
    return Math.max(1, Math.round(toSafeNumber(rawMonths)))
  }, [inputs.termValue, termUnit])

  const fixedMonths = useMemo(() => {
    return Math.min(Math.round(toSafeNumber(inputs.fixedMonths)), termMonths)
  }, [inputs.fixedMonths, termMonths])

  const baselineResult = useMemo(
    () =>
      simulate({
        principal: toSafeNumber(inputs.principal),
        termMonths,
        fixedMonths,
        fixedApr: toSafeNumber(inputs.fixedApr),
        variableBaseApr: toSafeNumber(inputs.variableBaseApr),
        tre: toSafeNumber(inputs.tre),
        monthlyExtra: 0,
        mode: 'KEEP_PAYMENT',
      }),
    [
      fixedMonths,
      inputs.fixedApr,
      inputs.principal,
      inputs.tre,
      inputs.variableBaseApr,
      termMonths,
    ],
  )

  const extraResult = useMemo(
    () =>
      simulate({
        principal: toSafeNumber(inputs.principal),
        termMonths,
        fixedMonths,
        fixedApr: toSafeNumber(inputs.fixedApr),
        variableBaseApr: toSafeNumber(inputs.variableBaseApr),
        tre: toSafeNumber(inputs.tre),
        monthlyExtra: toSafeNumber(inputs.monthlyExtra),
        mode: 'KEEP_PAYMENT',
      }),
    [
      fixedMonths,
      inputs.fixedApr,
      inputs.monthlyExtra,
      inputs.principal,
      inputs.tre,
      inputs.variableBaseApr,
      termMonths,
    ],
  )

  const chartRows = useMemo(
    () => buildChartRows(baselineResult.rows, extraResult.rows),
    [baselineResult.rows, extraResult.rows],
  )

  const monthsSaved = Math.max(
    0,
    baselineResult.payoffMonths - extraResult.payoffMonths,
  )
  const interestAvoided = Math.max(
    0,
    baselineResult.totalInterest - extraResult.totalInterest,
  )
  const variableTotalApr = (
    toSafeNumber(inputs.variableBaseApr) + toSafeNumber(inputs.tre)
  ).toFixed(2)

  const updateInput = (key: keyof InputState, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [key]: Number(value),
    }))
  }

  return (
    <main className='min-h-screen p-4 md:p-8'>
      <div className='mx-auto max-w-7xl space-y-4'>
        <header className='space-y-1'>
          <h1 className='text-3xl font-bold text-slate-100'>Money Moves</h1>
          <p className='text-slate-300'>Mortgage Extra-Payment Simulator</p>
        </header>

        <div className='grid gap-4 lg:grid-cols-12'>
          <InputsCard
            inputs={inputs}
            termUnit={termUnit}
            termMonths={termMonths}
            variableTotalApr={variableTotalApr}
            onTermUnitChange={setTermUnit}
            onInputChange={updateInput}
          />

          <section className='space-y-4 lg:col-span-8'>
            <SummaryCards
              baselinePayoffMonths={baselineResult.payoffMonths}
              extraPayoffMonths={extraResult.payoffMonths}
              monthsSaved={monthsSaved}
              baselineTotalInterest={baselineResult.totalInterest}
              extraTotalInterest={extraResult.totalInterest}
              interestAvoided={interestAvoided}
            />
            <ComparisonCharts rows={chartRows} />
          </section>
        </div>

        <AmortizationTableSection
          baselineRows={baselineResult.rows}
          extraRows={extraResult.rows}
        />
      </div>
    </main>
  )
}

export default App

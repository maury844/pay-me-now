import { useMemo, useState } from 'react';
import { AmortizationTableSection } from './components/AmortizationTableSection';
import { ComparisonCharts } from './components/ComparisonCharts';
import { InputsCard } from './components/InputsCard';
import { SummaryCards } from './components/SummaryCards';
import { useDebouncedValue } from './hooks/useDebouncedValue';
import { useExchangeRate } from './hooks/useExchangeRate';
import { simulate } from './simulation';
import type { CurrencyCode, InputState, RateMode, TermUnit } from './types/app';
import { buildChartRows, toSafeNumber } from './utils/simulationView';

const CALCULATION_DEBOUNCE_MS = 250;

const defaultInputs: InputState = {
  principal: 1200000,
  termValue: 30,
  fixedMonths: 12,
  fixedApr: 7.5,
  variableBaseApr: 7,
  tre: 3.5,
  monthlyExtra: 250,
};

function App() {
  const [termUnit, setTermUnit] = useState<TermUnit>('years');
  const [rateMode, setRateMode] = useState<RateMode>('FIXED_PLUS_VARIABLE');
  const [inputs, setInputs] = useState<InputState>(defaultInputs);
  const [currency, setCurrency] = useState<CurrencyCode>('USD');
  const { exchangeRate, resolvedExchangeRate, onExchangeRateChange } =
    useExchangeRate(currency);

  const principalUsd = useMemo(() => {
    const principal = toSafeNumber(inputs.principal);
    if (currency === 'USD') return principal;
    return principal / resolvedExchangeRate;
  }, [currency, inputs.principal, resolvedExchangeRate]);

  const monthlyExtraUsd = useMemo(() => {
    const monthlyExtra = toSafeNumber(inputs.monthlyExtra);
    if (currency === 'USD') return monthlyExtra;
    return monthlyExtra / resolvedExchangeRate;
  }, [currency, inputs.monthlyExtra, resolvedExchangeRate]);

  const termMonths = useMemo(() => {
    const rawMonths =
      termUnit === 'years' ? inputs.termValue * 12 : inputs.termValue;
    return Math.max(1, Math.round(toSafeNumber(rawMonths)));
  }, [inputs.termValue, termUnit]);

  const fixedMonths = useMemo(() => {
    return Math.min(Math.round(toSafeNumber(inputs.fixedMonths)), termMonths);
  }, [inputs.fixedMonths, termMonths]);
  const effectiveFixedMonths =
    rateMode === 'ALWAYS_FIXED' ? termMonths : fixedMonths;
  const simulationConfig = useMemo(
    () => ({
      principal: principalUsd,
      termMonths,
      fixedMonths: effectiveFixedMonths,
      fixedApr: toSafeNumber(inputs.fixedApr),
      variableBaseApr: toSafeNumber(inputs.variableBaseApr),
      tre: toSafeNumber(inputs.tre),
      monthlyExtra: monthlyExtraUsd,
    }),
    [
      effectiveFixedMonths,
      inputs.fixedApr,
      inputs.tre,
      inputs.variableBaseApr,
      monthlyExtraUsd,
      principalUsd,
      termMonths,
    ],
  );
  const { debouncedValue: debouncedSimulationConfig } = useDebouncedValue(
    simulationConfig,
    CALCULATION_DEBOUNCE_MS,
  );

  const baselineResult = useMemo(
    () =>
      simulate({
        ...debouncedSimulationConfig,
        monthlyExtra: 0,
        mode: 'KEEP_PAYMENT',
      }),
    [debouncedSimulationConfig],
  );

  const extraResult = useMemo(
    () =>
      simulate({
        ...debouncedSimulationConfig,
        mode: 'KEEP_PAYMENT',
      }),
    [debouncedSimulationConfig],
  );

  const chartRows = useMemo(
    () => buildChartRows(baselineResult.rows, extraResult.rows),
    [baselineResult.rows, extraResult.rows],
  );

  const monthsSaved = Math.max(
    0,
    baselineResult.payoffMonths - extraResult.payoffMonths,
  );
  const interestAvoided = Math.max(
    0,
    baselineResult.totalInterest - extraResult.totalInterest,
  );
  const variableTotalApr = (
    toSafeNumber(inputs.variableBaseApr) + toSafeNumber(inputs.tre)
  ).toFixed(2);

  const updateInput = (key: keyof InputState, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  };

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
            rateMode={rateMode}
            variableTotalApr={variableTotalApr}
            currency={currency}
            exchangeRate={exchangeRate}
            onTermUnitChange={setTermUnit}
            onRateModeChange={setRateMode}
            onCurrencyChange={setCurrency}
            onExchangeRateChange={onExchangeRateChange}
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
              currency={currency}
              exchangeRate={resolvedExchangeRate}
            />
            <ComparisonCharts rows={chartRows} />
          </section>
        </div>

        <AmortizationTableSection
          baselineRows={baselineResult.rows}
          extraRows={extraResult.rows}
          currency={currency}
          exchangeRate={resolvedExchangeRate}
        />
      </div>
    </main>
  );
}

export default App;

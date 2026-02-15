import { useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { simulate } from './simulation';

type TermUnit = 'years' | 'months';
type TableScenario = 'extra' | 'baseline';

type InputState = {
  principal: number;
  termValue: number;
  fixedMonths: number;
  fixedApr: number;
  variableBaseApr: number;
  tre: number;
  monthlyExtra: number;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const toSafeNumber = (value: number): number => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, value);
};

const toMonthsLabel = (months: number): string => {
  const years = Math.floor(months / 12);
  const leftoverMonths = months % 12;
  return `${years}y ${leftoverMonths}m`;
};

const buildChartRows = (
  baselineRows: ReturnType<typeof simulate>['rows'],
  extraRows: ReturnType<typeof simulate>['rows'],
) => {
  const maxLength = Math.max(baselineRows.length, extraRows.length);
  if (maxLength === 0) return [];

  let lastBaselineBalance = baselineRows[0]?.balance ?? 0;
  let lastBaselineInterest = baselineRows[0]?.cumulativeInterest ?? 0;
  let lastExtraBalance = extraRows[0]?.balance ?? 0;
  let lastExtraInterest = extraRows[0]?.cumulativeInterest ?? 0;

  return Array.from({ length: maxLength }, (_, index) => {
    const month = index + 1;
    const baseline = baselineRows[index];
    const extra = extraRows[index];

    if (baseline) {
      lastBaselineBalance = baseline.balance;
      lastBaselineInterest = baseline.cumulativeInterest;
    }

    if (extra) {
      lastExtraBalance = extra.balance;
      lastExtraInterest = extra.cumulativeInterest;
    }

    return {
      month,
      baselineBalance: baseline ? baseline.balance : lastBaselineBalance,
      extraBalance: extra ? extra.balance : lastExtraBalance,
      baselineInterest: baseline
        ? baseline.cumulativeInterest
        : lastBaselineInterest,
      extraInterest: extra ? extra.cumulativeInterest : lastExtraInterest,
    };
  });
};

function MetricCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        accent
          ? 'border-emerald-400/40 bg-emerald-500/10'
          : 'border-slate-700 bg-slate-900/50'
      }`}
    >
      <p className='text-xs uppercase tracking-wide text-slate-400'>{title}</p>
      <p className='mt-1 text-xl font-semibold text-slate-100'>{value}</p>
    </div>
  );
}

function App() {
  const [termUnit, setTermUnit] = useState<TermUnit>('years');
  const [tableScenario, setTableScenario] = useState<TableScenario>('extra');
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [inputs, setInputs] = useState<InputState>({
    principal: 300000,
    termValue: 30,
    fixedMonths: 60,
    fixedApr: 4.5,
    variableBaseApr: 6,
    tre: 2.25,
    monthlyExtra: 250,
  });

  const termMonths = useMemo(() => {
    const rawMonths =
      termUnit === 'years' ? inputs.termValue * 12 : inputs.termValue;
    return Math.max(1, Math.round(toSafeNumber(rawMonths)));
  }, [inputs.termValue, termUnit]);

  const fixedMonths = useMemo(() => {
    return Math.min(Math.round(toSafeNumber(inputs.fixedMonths)), termMonths);
  }, [inputs.fixedMonths, termMonths]);

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
  );

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

  const tableRows =
    tableScenario === 'extra' ? extraResult.rows : baselineResult.rows;

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
          <section className='rounded-2xl border border-slate-700 bg-slate-900/60 p-4 lg:col-span-4'>
            <h2 className='mb-4 text-lg font-semibold text-slate-100'>
              Inputs
            </h2>
            <div className='space-y-3'>
              <label className='block'>
                <span className='mb-1 block text-sm text-slate-300'>
                  Principal ($)
                </span>
                <input
                  type='number'
                  min='0'
                  value={inputs.principal}
                  onChange={(event) =>
                    updateInput('principal', event.target.value)
                  }
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                />
              </label>

              <div className='grid grid-cols-3 gap-2'>
                <label className='col-span-2 block'>
                  <span className='mb-1 block text-sm text-slate-300'>
                    Term
                  </span>
                  <input
                    type='number'
                    min='1'
                    value={inputs.termValue}
                    onChange={(event) =>
                      updateInput('termValue', event.target.value)
                    }
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                  />
                </label>
                <label className='block'>
                  <span className='mb-1 block text-sm text-slate-300'>
                    Unit
                  </span>
                  <select
                    value={termUnit}
                    onChange={(event) =>
                      setTermUnit(event.target.value as TermUnit)
                    }
                    className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                  >
                    <option value='years'>Years</option>
                    <option value='months'>Months</option>
                  </select>
                </label>
              </div>
              <p className='text-xs text-slate-400'>
                Term months: {termMonths}
              </p>

              <label className='block'>
                <span className='mb-1 block text-sm text-slate-300'>
                  Fixed period (months)
                </span>
                <input
                  type='number'
                  min='0'
                  value={inputs.fixedMonths}
                  onChange={(event) =>
                    updateInput('fixedMonths', event.target.value)
                  }
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                />
              </label>

              <label className='block'>
                <span className='mb-1 block text-sm text-slate-300'>
                  Fixed APR (%)
                </span>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={inputs.fixedApr}
                  onChange={(event) =>
                    updateInput('fixedApr', event.target.value)
                  }
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                />
              </label>

              <label className='block'>
                <span className='mb-1 block text-sm text-slate-300'>
                  Variable base APR (%)
                </span>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={inputs.variableBaseApr}
                  onChange={(event) =>
                    updateInput('variableBaseApr', event.target.value)
                  }
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                />
              </label>

              <label className='block'>
                <span className='mb-1 block text-sm text-slate-300'>
                  TRE (%)
                </span>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={inputs.tre}
                  onChange={(event) => updateInput('tre', event.target.value)}
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                />
              </label>

              <label className='block'>
                <span className='mb-1 block text-sm text-slate-300'>
                  Extra payment / month ($)
                </span>
                <input
                  type='number'
                  min='0'
                  step='0.01'
                  value={inputs.monthlyExtra}
                  onChange={(event) =>
                    updateInput('monthlyExtra', event.target.value)
                  }
                  className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
                />
              </label>

              <div className='rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-300'>
                <p>Variable APR after fixed period</p>
                <p className='mt-1 text-slate-200'>
                  Base {toSafeNumber(inputs.variableBaseApr).toFixed(2)}% + TRE{' '}
                  {toSafeNumber(inputs.tre).toFixed(2)}% ={' '}
                  <span className='font-semibold text-sky-300'>
                    {variableTotalApr}%
                  </span>
                </p>
              </div>
            </div>
          </section>

          <section className='space-y-4 lg:col-span-8'>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
              <MetricCard
                title='Baseline payoff'
                value={`${baselineResult.payoffMonths} months (${toMonthsLabel(
                  baselineResult.payoffMonths,
                )})`}
              />
              <MetricCard
                title='With-extra payoff'
                value={`${extraResult.payoffMonths} months (${toMonthsLabel(
                  extraResult.payoffMonths,
                )})`}
              />
              <MetricCard
                title='Months saved'
                value={`${monthsSaved}`}
                accent
              />
              <MetricCard
                title='Baseline total interest'
                value={currencyFormatter.format(baselineResult.totalInterest)}
              />
              <MetricCard
                title='With-extra total interest'
                value={currencyFormatter.format(extraResult.totalInterest)}
              />
              <MetricCard
                title='Interest avoided'
                value={currencyFormatter.format(interestAvoided)}
                accent
              />
            </div>

            <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
              <div className='rounded-2xl border border-slate-700 bg-slate-900/60 p-4'>
                <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300'>
                  Remaining Balance vs Month
                </h3>
                <div className='h-72 w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={chartRows}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                      <XAxis dataKey='month' stroke='#94a3b8' />
                      <YAxis
                        stroke='#94a3b8'
                        tickFormatter={(value) =>
                          currencyFormatter.format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value: number | string | undefined) =>
                          currencyFormatter.format(Number(value ?? 0))
                        }
                        labelFormatter={(label) => `Month ${label}`}
                      />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='baselineBalance'
                        name='Baseline'
                        stroke='#f59e0b'
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type='monotone'
                        dataKey='extraBalance'
                        name='With Extra'
                        stroke='#38bdf8'
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className='rounded-2xl border border-slate-700 bg-slate-900/60 p-4'>
                <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300'>
                  Cumulative Interest vs Month
                </h3>
                <div className='h-72 w-full'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={chartRows}>
                      <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
                      <XAxis dataKey='month' stroke='#94a3b8' />
                      <YAxis
                        stroke='#94a3b8'
                        tickFormatter={(value) =>
                          currencyFormatter.format(value)
                        }
                      />
                      <Tooltip
                        formatter={(value: number | string | undefined) =>
                          currencyFormatter.format(Number(value ?? 0))
                        }
                        labelFormatter={(label) => `Month ${label}`}
                      />
                      <Legend />
                      <Line
                        type='monotone'
                        dataKey='baselineInterest'
                        name='Baseline'
                        stroke='#f59e0b'
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        type='monotone'
                        dataKey='extraInterest'
                        name='With Extra'
                        stroke='#38bdf8'
                        dot={false}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className='rounded-2xl border border-slate-700 bg-slate-900/60 p-4'>
          <button
            type='button'
            onClick={() => setIsTableOpen((current) => !current)}
            className='w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-left font-medium text-slate-100 transition hover:border-sky-400'
          >
            {isTableOpen
              ? 'Hide amortization table'
              : 'Show amortization table'}
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isTableOpen ? 'mt-3 max-h-[70vh]' : 'max-h-0'
            }`}
          >
            <div className='rounded-lg border border-slate-700'>
              <div className='flex items-center gap-2 border-b border-slate-700 bg-slate-950 p-3'>
                <span className='text-sm text-slate-300'>Scenario:</span>
                <button
                  type='button'
                  onClick={() => setTableScenario('extra')}
                  className={`rounded-md px-3 py-1 text-sm ${
                    tableScenario === 'extra'
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Extra
                </button>
                <button
                  type='button'
                  onClick={() => setTableScenario('baseline')}
                  className={`rounded-md px-3 py-1 text-sm ${
                    tableScenario === 'baseline'
                      ? 'bg-sky-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Baseline
                </button>
              </div>

              <div className='max-h-[55vh] overflow-auto'>
                <table className='min-w-full text-sm'>
                  <thead className='sticky top-0 bg-slate-950 text-slate-300'>
                    <tr>
                      <th className='px-3 py-2 text-left font-medium'>Month</th>
                      <th className='px-3 py-2 text-left font-medium'>
                        APR (total)
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>
                        Scheduled payment
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>Extra</th>
                      <th className='px-3 py-2 text-left font-medium'>
                        Interest
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>
                        Principal
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>
                        Balance
                      </th>
                      <th className='px-3 py-2 text-left font-medium'>
                        Cumulative interest
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
                        <td className='px-3 py-2'>
                          {currencyFormatter.format(row.scheduledPayment)}
                        </td>
                        <td className='px-3 py-2'>
                          {currencyFormatter.format(row.extra)}
                        </td>
                        <td className='px-3 py-2'>
                          {currencyFormatter.format(row.interest)}
                        </td>
                        <td className='px-3 py-2'>
                          {currencyFormatter.format(row.principal)}
                        </td>
                        <td className='px-3 py-2'>
                          {currencyFormatter.format(row.balance)}
                        </td>
                        <td className='px-3 py-2'>
                          {currencyFormatter.format(row.cumulativeInterest)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;

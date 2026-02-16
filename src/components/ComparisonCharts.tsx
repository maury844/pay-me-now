import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartRow } from '../types/app'
import { currencyFormatter } from '../utils/format'
import { Card } from './ui/Card'

type ComparisonChartsProps = {
  rows: ChartRow[]
}

type LineDef = {
  dataKey: keyof ChartRow
  name: string
  stroke: string
}

type ComparisonLineChartProps = {
  title: string
  rows: ChartRow[]
  lines: [LineDef, LineDef]
}

const compactCurrencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

function ComparisonLineChart({ title, rows, lines }: ComparisonLineChartProps) {
  return (
    <Card>
      <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300'>
        {title}
      </h3>
      <div className='h-72 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 20 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            <XAxis dataKey='month' stroke='#94a3b8' tick={{ fill: '#94a3b8' }} />
            <YAxis
              stroke='#94a3b8'
              width={90}
              tick={{ fill: '#94a3b8' }}
              tickMargin={8}
              tickFormatter={(value) =>
                compactCurrencyFormatter.format(Number(value ?? 0))
              }
            />
            <Tooltip
              formatter={(value: number | string | undefined) =>
                currencyFormatter.format(Number(value ?? 0))
              }
              labelFormatter={(label) => `Month ${label}`}
              contentStyle={{
                backgroundColor: '#020617',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
              }}
              labelStyle={{ color: '#cbd5e1' }}
              itemStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ color: '#cbd5e1' }} />
            {lines.map((line) => (
              <Line
                key={line.dataKey}
                type='monotone'
                dataKey={line.dataKey}
                name={line.name}
                stroke={line.stroke}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function ComparisonCharts({ rows }: ComparisonChartsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 xl:grid-cols-2'>
      <ComparisonLineChart
        title='Remaining Balance vs Month'
        rows={rows}
        lines={[
          { dataKey: 'baselineBalance', name: 'Baseline', stroke: '#f59e0b' },
          { dataKey: 'extraBalance', name: 'With Extra', stroke: '#38bdf8' },
        ]}
      />
      <ComparisonLineChart
        title='Cumulative Interest vs Month'
        rows={rows}
        lines={[
          { dataKey: 'baselineInterest', name: 'Baseline', stroke: '#f59e0b' },
          { dataKey: 'extraInterest', name: 'With Extra', stroke: '#38bdf8' },
        ]}
      />
    </div>
  )
}

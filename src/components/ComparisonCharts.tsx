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

function ComparisonLineChart({ title, rows, lines }: ComparisonLineChartProps) {
  return (
    <Card>
      <h3 className='mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300'>
        {title}
      </h3>
      <div className='h-72 w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray='3 3' stroke='#334155' />
            <XAxis dataKey='month' stroke='#94a3b8' />
            <YAxis
              stroke='#94a3b8'
              tickFormatter={(value) => currencyFormatter.format(value)}
            />
            <Tooltip
              formatter={(value: number | string | undefined) =>
                currencyFormatter.format(Number(value ?? 0))
              }
              labelFormatter={(label) => `Month ${label}`}
            />
            <Legend />
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

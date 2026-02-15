import { Card } from './ui/Card'

type MetricCardProps = {
  title: string
  value: string
  accent?: boolean
}

export function MetricCard({ title, value, accent = false }: MetricCardProps) {
  return (
    <Card tone={accent ? 'accent' : 'default'} className='rounded-xl p-3'>
      <p className='text-xs uppercase tracking-wide text-slate-400'>{title}</p>
      <p className='mt-1 text-xl font-semibold text-slate-100'>{value}</p>
    </Card>
  )
}

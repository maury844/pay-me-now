import type { ReactNode } from 'react'
import { classNameHelper } from '../../utils/classNameHelper'

type CardTone = 'default' | 'accent'

type CardProps = {
  children: ReactNode
  className?: string
  tone?: CardTone
}

const toneClassMap: Record<CardTone, string> = {
  default: 'border-slate-700 bg-slate-900/60',
  accent: 'border-emerald-400/40 bg-emerald-500/10',
}

export function Card({ children, className, tone = 'default' }: CardProps) {
  return (
    <div
      className={classNameHelper(
        'rounded-2xl border p-4',
        toneClassMap[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}

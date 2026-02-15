import type { CurrencyCode, InputState, TermUnit } from '../types/app'
import { getCurrencyInputLabel } from '../utils/format'
import { Card } from './ui/Card'

type InputsCardProps = {
  inputs: InputState
  termUnit: TermUnit
  termMonths: number
  variableTotalApr: string
  currency: CurrencyCode
  exchangeRate: number
  onTermUnitChange: (next: TermUnit) => void
  onCurrencyChange: (next: CurrencyCode) => void
  onExchangeRateChange: (value: string) => void
  onInputChange: (key: keyof InputState, value: string) => void
}

type NumberFieldProps = {
  label: string
  value: number
  min?: string
  step?: string
  onChange: (value: string) => void
}

function NumberField({ label, value, min, step, onChange }: NumberFieldProps) {
  return (
    <label className='block'>
      <span className='mb-1 block text-sm text-slate-300'>{label}</span>
      <input
        type='number'
        min={min}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
      />
    </label>
  )
}

export function InputsCard({
  inputs,
  termUnit,
  termMonths,
  variableTotalApr,
  currency,
  exchangeRate,
  onTermUnitChange,
  onCurrencyChange,
  onExchangeRateChange,
  onInputChange,
}: InputsCardProps) {
  const currencyLabel = getCurrencyInputLabel(currency)

  return (
    <Card className='lg:col-span-4'>
      <h2 className='mb-4 text-lg font-semibold text-slate-100'>Inputs</h2>
      <div className='space-y-3'>
        <label className='block'>
          <span className='mb-1 block text-sm text-slate-300'>Currency</span>
          <select
            value={currency}
            onChange={(event) => onCurrencyChange(event.target.value as CurrencyCode)}
            className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
          >
            <option value='USD'>USD ($)</option>
            <option value='BOB'>BOB</option>
          </select>
        </label>

        {currency !== 'USD' ? (
          <NumberField
            label='Exchange rate (BOB per $1)'
            value={exchangeRate}
            min='0.0001'
            step='0.0001'
            onChange={onExchangeRateChange}
          />
        ) : null}

        <NumberField
          label={`Principal (${currencyLabel})`}
          value={inputs.principal}
          min='0'
          onChange={(value) => onInputChange('principal', value)}
        />

        <div className='grid grid-cols-3 gap-2'>
          <div className='col-span-2'>
            <NumberField
              label='Term'
              value={inputs.termValue}
              min='1'
              onChange={(value) => onInputChange('termValue', value)}
            />
          </div>
          <label className='block'>
            <span className='mb-1 block text-sm text-slate-300'>Unit</span>
            <select
              value={termUnit}
              onChange={(event) =>
                onTermUnitChange(event.target.value as TermUnit)
              }
              className='w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-sky-400 focus:outline-none'
            >
              <option value='years'>Years</option>
              <option value='months'>Months</option>
            </select>
          </label>
        </div>

        <p className='text-xs text-slate-400'>Term months: {termMonths}</p>

        <NumberField
          label='Fixed period (months)'
          value={inputs.fixedMonths}
          min='0'
          onChange={(value) => onInputChange('fixedMonths', value)}
        />

        <NumberField
          label='Fixed APR (%)'
          value={inputs.fixedApr}
          min='0'
          step='0.01'
          onChange={(value) => onInputChange('fixedApr', value)}
        />

        <NumberField
          label='Variable base APR (%)'
          value={inputs.variableBaseApr}
          min='0'
          step='0.01'
          onChange={(value) => onInputChange('variableBaseApr', value)}
        />

        <NumberField
          label='TRE (%)'
          value={inputs.tre}
          min='0'
          step='0.01'
          onChange={(value) => onInputChange('tre', value)}
        />

        <NumberField
          label={`Extra payment / month (${currencyLabel})`}
          value={inputs.monthlyExtra}
          min='0'
          step='0.01'
          onChange={(value) => onInputChange('monthlyExtra', value)}
        />

        <div className='rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-sm text-slate-300'>
          <p>Variable APR after fixed period</p>
          <p className='mt-1 text-slate-200'>
            Base {inputs.variableBaseApr.toFixed(2)}% + TRE {inputs.tre.toFixed(2)}
            % = <span className='font-semibold text-sky-300'>{variableTotalApr}%</span>
          </p>
        </div>
      </div>
    </Card>
  )
}

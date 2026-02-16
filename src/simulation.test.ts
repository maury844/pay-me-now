import { describe, expect, it } from 'vitest'
import { simulate, type SimConfig } from './simulation'

const baseConfig: SimConfig = {
  principal: 300000,
  termMonths: 360,
  fixedMonths: 60,
  fixedApr: 4.5,
  variableBaseApr: 6,
  tre: 2.25,
  monthlyExtra: 0,
  mode: 'KEEP_PAYMENT',
}

describe('simulate', () => {
  it('applies variable APR from month 1 when fixedMonths is 0', () => {
    const result = simulate({ ...baseConfig, fixedMonths: 0 })
    expect(result.rows[0]?.apr).toBe(8.25)
  })

  it('never applies variable APR when fixedMonths equals termMonths', () => {
    const result = simulate({
      ...baseConfig,
      fixedMonths: baseConfig.termMonths,
      fixedApr: 5.1,
    })

    const hasVariableApr = result.rows.some((row) => row.apr !== 5.1)
    expect(hasVariableApr).toBe(false)
  })

  it('calculates variable total APR as base + TRE', () => {
    const result = simulate({
      ...baseConfig,
      variableBaseApr: 5.75,
      tre: 1.4,
    })
    expect(result.variableTotalApr).toBe(7.15)
  })

  it('extra payment reduces payoff months and total interest', () => {
    const baseline = simulate({ ...baseConfig, monthlyExtra: 0 })
    const withExtra = simulate({ ...baseConfig, monthlyExtra: 250 })

    expect(withExtra.payoffMonths).toBeLessThan(baseline.payoffMonths)
    expect(withExtra.totalInterest).toBeLessThan(baseline.totalInterest)
  })

  it('does not exceed contractual term due to rounding in mixed-rate loans', () => {
    const screenshotLikeConfig: SimConfig = {
      principal: 1200000 / 9.09,
      termMonths: 360,
      fixedMonths: 12,
      fixedApr: 7.5,
      variableBaseApr: 7,
      tre: 3.5,
      monthlyExtra: 0,
      mode: 'KEEP_PAYMENT',
    }

    const result = simulate(screenshotLikeConfig)

    expect(result.payoffMonths).toBe(360)
    expect(result.rows.at(-1)?.month).toBe(360)
    expect(result.rows.at(-1)?.balance).toBe(0)
  })

  it('preserves extra precision for converted-currency inputs', () => {
    const exchangeRate = 9.09
    const expectedExtraInBobs = 250

    const result = simulate({
      ...baseConfig,
      principal: 1200000 / exchangeRate,
      monthlyExtra: expectedExtraInBobs / exchangeRate,
    })

    const firstMonthExtraInBobs = Number(
      ((result.rows[0]?.extra ?? 0) * exchangeRate).toFixed(2),
    )

    expect(firstMonthExtraInBobs).toBe(expectedExtraInBobs)
  })
})

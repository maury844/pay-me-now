export type SimConfig = {
  principal: number
  termMonths: number
  fixedMonths: number
  fixedApr: number
  variableBaseApr: number
  tre: number
  monthlyExtra: number
  mode?: 'KEEP_PAYMENT'
}

export type AmortizationRow = {
  month: number
  apr: number
  scheduledPayment: number
  extra: number
  interest: number
  principal: number
  balance: number
  cumulativeInterest: number
}

export type SimResult = {
  rows: AmortizationRow[]
  payoffMonths: number
  totalInterest: number
  variableTotalApr: number
}

const toCurrency = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

const toMonthlyRate = (aprPercent: number): number => {
  return aprPercent / 100 / 12
}

export const calculatePayment = (
  principal: number,
  aprPercent: number,
  months: number,
): number => {
  if (months <= 0) return toCurrency(principal)
  if (principal <= 0) return 0

  const monthlyRate = toMonthlyRate(aprPercent)
  if (monthlyRate === 0) return toCurrency(principal / months)

  const payment =
    (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
  return toCurrency(payment)
}

const clampNonNegative = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, value)
}

const clampIntegerNonNegative = (value: number): number => {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

export const simulate = (rawConfig: SimConfig): SimResult => {
  const config: SimConfig = {
    principal: clampNonNegative(rawConfig.principal),
    termMonths: clampIntegerNonNegative(rawConfig.termMonths),
    fixedMonths: clampIntegerNonNegative(rawConfig.fixedMonths),
    fixedApr: clampNonNegative(rawConfig.fixedApr),
    variableBaseApr: clampNonNegative(rawConfig.variableBaseApr),
    tre: clampNonNegative(rawConfig.tre),
    monthlyExtra: clampNonNegative(rawConfig.monthlyExtra),
    mode: 'KEEP_PAYMENT',
  }

  const termMonths = Math.max(1, config.termMonths)
  const fixedMonths = Math.min(config.fixedMonths, termMonths)
  const variableTotalApr = toCurrency(config.variableBaseApr + config.tre)
  const monthlyExtra = config.monthlyExtra

  let month = 1
  let balance = toCurrency(config.principal)
  let cumulativeInterest = 0
  let scheduledPayment = calculatePayment(
    balance,
    fixedMonths > 0 ? config.fixedApr : variableTotalApr,
    termMonths,
  )

  const rows: AmortizationRow[] = []
  const safeLimit = termMonths + 600

  while (balance > 0 && month <= safeLimit) {
    const apr =
      fixedMonths >= termMonths
        ? config.fixedApr
        : month <= fixedMonths
          ? config.fixedApr
          : variableTotalApr

    if (fixedMonths > 0 && fixedMonths < termMonths && month === fixedMonths + 1) {
      const remainingMonths = Math.max(1, termMonths - fixedMonths)
      scheduledPayment = calculatePayment(balance, variableTotalApr, remainingMonths)
    }

    const interest = toCurrency(balance * toMonthlyRate(apr))
    const scheduledCap =
      month === termMonths
        ? toCurrency(balance + interest)
        : toCurrency(Math.min(scheduledPayment, balance + interest))
    const scheduledPrincipal = toCurrency(Math.max(0, scheduledCap - interest))

    const maxExtra = toCurrency(Math.max(0, balance - scheduledPrincipal))
    const extra = Math.min(monthlyExtra, maxExtra)

    const principal = toCurrency(scheduledPrincipal + extra)
    balance = toCurrency(Math.max(0, balance - principal))
    cumulativeInterest = toCurrency(cumulativeInterest + interest)

    rows.push({
      month,
      apr: toCurrency(apr),
      scheduledPayment: scheduledCap,
      extra,
      interest,
      principal,
      balance,
      cumulativeInterest,
    })

    month += 1
  }

  return {
    rows,
    payoffMonths: rows.length,
    totalInterest: cumulativeInterest,
    variableTotalApr,
  }
}

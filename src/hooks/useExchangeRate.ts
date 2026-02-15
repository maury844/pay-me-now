import { useEffect, useMemo, useState } from 'react'
import {
  DEFAULT_BOB_EXCHANGE_RATE,
  fetchBlueBuyRate,
} from '../services/exchangeRateService'
import type { CurrencyCode } from '../types/app'
import { toSafeNumber } from '../utils/simulationView'

type UseExchangeRateResult = {
  exchangeRate: number
  resolvedExchangeRate: number
  onExchangeRateChange: (value: string) => void
}

export const useExchangeRate = (currency: CurrencyCode): UseExchangeRateResult => {
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_BOB_EXCHANGE_RATE)
  const [defaultBobExchangeRate, setDefaultBobExchangeRate] = useState(
    DEFAULT_BOB_EXCHANGE_RATE,
  )
  const [hasCustomExchangeRate, setHasCustomExchangeRate] = useState(false)
  const [hasFetchedBlueRate, setHasFetchedBlueRate] = useState(false)

  useEffect(() => {
    if (currency !== 'BOB') return
    if (hasFetchedBlueRate) return

    const controller = new AbortController()

    const loadDefaultRate = async () => {
      try {
        const blueBuyRate = await fetchBlueBuyRate(controller.signal)
        if (blueBuyRate === null) return

        setDefaultBobExchangeRate(blueBuyRate)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      } finally {
        setHasFetchedBlueRate(true)
      }
    }

    void loadDefaultRate()

    return () => {
      controller.abort()
    }
  }, [currency, hasFetchedBlueRate])

  useEffect(() => {
    if (currency !== 'BOB') return
    if (hasCustomExchangeRate) return
    setExchangeRate(defaultBobExchangeRate)
  }, [currency, defaultBobExchangeRate, hasCustomExchangeRate])

  const resolvedExchangeRate = useMemo(() => {
    if (currency === 'USD') return 1
    return Math.max(0.0001, toSafeNumber(exchangeRate))
  }, [currency, exchangeRate])

  const onExchangeRateChange = (value: string) => {
    setHasCustomExchangeRate(true)
    setExchangeRate(Number(value))
  }

  return {
    exchangeRate,
    resolvedExchangeRate,
    onExchangeRateChange,
  }
}

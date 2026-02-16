import { useEffect, useState, useTransition } from 'react'

type UseDebouncedValueResult<T> = {
  debouncedValue: T
  isPending: boolean
}

export const useDebouncedValue = <T,>(
  value: T,
  delayMs: number,
): UseDebouncedValueResult<T> => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      startTransition(() => {
        setDebouncedValue(value)
      })
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delayMs, startTransition, value])

  return {
    debouncedValue,
    isPending,
  }
}

export const DEFAULT_BOB_EXCHANGE_RATE = 6.96
const BLUE_RATE_ENDPOINT = 'https://api.dolarbluebolivia.click/fetch/generate'

type BlueRatePayload = {
  data?: {
    blue?: {
      buy?: number | string
    }
  }
}

export const getBlueBuyRate = (payload: unknown): number | null => {
  const buy = Number((payload as BlueRatePayload)?.data?.blue?.buy)
  return Number.isFinite(buy) && buy > 0 ? buy : null
}

export const fetchBlueBuyRate = async (
  signal?: AbortSignal,
): Promise<number | null> => {
  const response = await fetch(BLUE_RATE_ENDPOINT, { signal })
  if (!response.ok) return null

  const payload = await response.json()
  return getBlueBuyRate(payload)
}

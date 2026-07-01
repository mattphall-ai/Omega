import type { RateCard } from './types'

export function getRate(rateCard: RateCard | null, client: string, role: string): number {
  if (!rateCard) return 0
  const bucket = rateCard.rates[client] ?? rateCard.rates[rateCard.standardKey]
  const rate = bucket?.[role]
  if (rate != null) return rate
  return rateCard.rates[rateCard.standardKey]?.[role] ?? 0
}

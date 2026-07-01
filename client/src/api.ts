import type { Estimate, EstimateInput, RateCard } from './types'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export function fetchRateCard(): Promise<RateCard> {
  return request<RateCard>('/api/rate-card')
}

export function searchEstimates(query: string): Promise<Estimate[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : ''
  return request<Estimate[]>(`/api/estimates${params}`)
}

export function fetchEstimate(id: number): Promise<Estimate> {
  return request<Estimate>(`/api/estimates/${id}`)
}

export function createEstimate(input: EstimateInput): Promise<Estimate> {
  return request<Estimate>('/api/estimates', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function reviseEstimate(id: number, input: EstimateInput): Promise<Estimate> {
  return request<Estimate>(`/api/estimates/${id}/revise`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

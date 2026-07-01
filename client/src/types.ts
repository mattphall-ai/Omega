export interface RateCard {
  roles: string[]
  clients: string[]
  standardKey: string
  rates: Record<string, Record<string, number | null>>
  sourceFile: string
  updatedAt: string
}

export interface LineItem {
  id: string
  section: string
  role: string
  description: string
  hours: number
  rate: number
}

export interface EstimateHistoryEntry {
  id: number
  version: number
  is_latest: number
  updated_at: string
}

export interface Estimate {
  id: number
  bid_number: number
  version: number
  root_id: number
  is_latest: boolean
  display_name: string
  project_name: string
  client: string
  job_number: string | null
  prepared_by: string | null
  bid_date: string | null
  notes: string | null
  markup_percent: number
  line_items: LineItem[]
  subtotal: number
  markup_amount: number
  total: number
  created_at: string
  updated_at: string
  history?: EstimateHistoryEntry[]
}

export interface EstimateInput {
  project_name: string
  client: string
  job_number: string
  prepared_by: string
  bid_date: string
  notes: string
  markup_percent: number
  line_items: LineItem[]
}

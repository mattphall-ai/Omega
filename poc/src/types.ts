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

export interface EstimateForm {
  project_name: string
  client: string
  job_number: string
  prepared_by: string
  bid_date: string
  notes: string
  markup_percent: number
  line_items: LineItem[]
}

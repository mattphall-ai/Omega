import type { LineItem } from '../types'

interface Props {
  lineItems: LineItem[]
  markupPercent: number
  onMarkupChange: (value: number) => void
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function SummaryPanel({ lineItems, markupPercent, onMarkupChange }: Props) {
  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.hours) || 0) * (Number(item.rate) || 0), 0)
  const markupAmount = (subtotal * (Number(markupPercent) || 0)) / 100
  const total = subtotal + markupAmount

  return (
    <div className="summary-panel">
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{currency.format(subtotal)}</span>
      </div>
      <div className="summary-row">
        <label htmlFor="markup">Markup %</label>
        <input
          id="markup"
          type="number"
          min="0"
          step="0.1"
          value={markupPercent}
          onChange={(e) => onMarkupChange(Number(e.target.value))}
        />
      </div>
      <div className="summary-row">
        <span>Markup Amount</span>
        <span>{currency.format(markupAmount)}</span>
      </div>
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{currency.format(total)}</span>
      </div>
    </div>
  )
}

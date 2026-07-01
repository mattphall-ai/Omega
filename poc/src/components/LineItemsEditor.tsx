import type { LineItem, RateCard } from '../types'
import { getRate } from '../rates'

const SECTION_SUGGESTIONS = [
  'Editorial',
  'Design/Animation',
  'Online/Finishing',
  'Audio Mix',
  'Music',
  'Production Management',
  'Delivery/Misc',
]

interface Props {
  lineItems: LineItem[]
  onChange: (items: LineItem[]) => void
  rateCard: RateCard
  client: string
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function LineItemsEditor({ lineItems, onChange, rateCard, client }: Props) {
  function updateItem(id: string, patch: Partial<LineItem>) {
    onChange(lineItems.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function updateRole(id: string, role: string) {
    updateItem(id, { role, rate: getRate(rateCard, client, role) })
  }

  function addItem() {
    const section = lineItems.length ? lineItems[lineItems.length - 1].section : SECTION_SUGGESTIONS[0]
    const role = rateCard.roles[0] ?? ''
    onChange([
      ...lineItems,
      {
        id: crypto.randomUUID(),
        section,
        role,
        description: '',
        hours: 0,
        rate: getRate(rateCard, client, role),
      },
    ])
  }

  function removeItem(id: string) {
    onChange(lineItems.filter((item) => item.id !== id))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.hours) || 0) * (Number(item.rate) || 0), 0)

  return (
    <div className="line-items-editor">
      <datalist id="section-suggestions">
        {SECTION_SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <table className="data-table line-items-table">
        <thead>
          <tr>
            <th>Section</th>
            <th>Role</th>
            <th>Description</th>
            <th className="align-right">Hours</th>
            <th className="align-right">Rate</th>
            <th className="align-right">Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {lineItems.map((item) => (
            <tr key={item.id}>
              <td>
                <input
                  list="section-suggestions"
                  value={item.section}
                  onChange={(e) => updateItem(item.id, { section: e.target.value })}
                />
              </td>
              <td>
                <select value={item.role} onChange={(e) => updateRole(item.id, e.target.value)}>
                  {rateCard.roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(item.id, { description: e.target.value })}
                  placeholder="Description"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  className="align-right"
                  value={item.hours}
                  onChange={(e) => updateItem(item.id, { hours: Number(e.target.value) })}
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="align-right"
                  value={item.rate}
                  onChange={(e) => updateItem(item.id, { rate: Number(e.target.value) })}
                  title="Auto-filled from rate card; edit to override for this line only"
                />
              </td>
              <td className="align-right">{currency.format((Number(item.hours) || 0) * (Number(item.rate) || 0))}</td>
              <td>
                <button type="button" className="icon-button" onClick={() => removeItem(item.id)} aria-label="Remove line">
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={5} className="align-right">
              Subtotal
            </td>
            <td className="align-right">{currency.format(subtotal)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>

      <button type="button" className="button" onClick={addItem}>
        + Add Line Item
      </button>
    </div>
  )
}

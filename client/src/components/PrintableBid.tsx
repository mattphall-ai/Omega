import type { Estimate } from '../types'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function groupBySection(estimate: Estimate) {
  const order: string[] = []
  const groups = new Map<string, typeof estimate.line_items>()
  for (const item of estimate.line_items) {
    const key = item.section || 'Uncategorized'
    if (!groups.has(key)) {
      groups.set(key, [])
      order.push(key)
    }
    groups.get(key)!.push(item)
  }
  return order.map((section) => ({
    section,
    items: groups.get(section)!,
    subtotal: groups.get(section)!.reduce((sum, item) => sum + item.hours * item.rate, 0),
  }))
}

export default function PrintableBid({ estimate }: { estimate: Estimate }) {
  const sections = groupBySection(estimate)

  return (
    <div className="printable-bid">
      <div className="printable-header">
        <h1>Post Production Bid</h1>
        <div className="printable-header-grid">
          <div>
            <strong>Project</strong>
            <div>{estimate.project_name}</div>
          </div>
          <div>
            <strong>Client</strong>
            <div>{estimate.client}</div>
          </div>
          <div>
            <strong>Job Number</strong>
            <div>{estimate.job_number || '—'}</div>
          </div>
          <div>
            <strong>Bid Number</strong>
            <div>{estimate.display_name}</div>
          </div>
          <div>
            <strong>Prepared By</strong>
            <div>{estimate.prepared_by || '—'}</div>
          </div>
          <div>
            <strong>Bid Date</strong>
            <div>{estimate.bid_date || '—'}</div>
          </div>
        </div>
      </div>

      {sections.map(({ section, items, subtotal }) => (
        <table key={section} className="printable-section-table">
          <thead>
            <tr>
              <th colSpan={4} className="printable-section-title">
                {section}
              </th>
            </tr>
            <tr>
              <th>Role</th>
              <th>Description</th>
              <th className="align-right">Hours</th>
              <th className="align-right">Rate</th>
              <th className="align-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.role}</td>
                <td>{item.description}</td>
                <td className="align-right">{item.hours}</td>
                <td className="align-right">{currency.format(item.rate)}</td>
                <td className="align-right">{currency.format(item.hours * item.rate)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4} className="align-right">
                {section} Subtotal
              </td>
              <td className="align-right">{currency.format(subtotal)}</td>
            </tr>
          </tfoot>
        </table>
      ))}

      <div className="printable-totals">
        <div>
          <span>Subtotal</span>
          <span>{currency.format(estimate.subtotal)}</span>
        </div>
        <div>
          <span>Markup ({estimate.markup_percent}%)</span>
          <span>{currency.format(estimate.markup_amount)}</span>
        </div>
        <div className="printable-grand-total">
          <span>Grand Total</span>
          <span>{currency.format(estimate.total)}</span>
        </div>
      </div>

      {estimate.notes && (
        <div className="printable-notes">
          <strong>Notes / Assumptions & Exclusions</strong>
          <p>{estimate.notes}</p>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { searchEstimates } from '../api'
import type { Estimate } from '../types'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

export default function EstimateListPage() {
  const [query, setQuery] = useState('')
  const [estimates, setEstimates] = useState<Estimate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    searchEstimates(query)
      .then((results) => {
        if (!cancelled) setEstimates(results)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [query])

  return (
    <section>
      <div className="toolbar">
        <input
          type="search"
          placeholder="Search by project, client, job #, bid #, or preparer..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : estimates.length === 0 ? (
        <p className="muted">No estimates found.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Bid</th>
              <th>Project</th>
              <th>Client</th>
              <th>Job #</th>
              <th>Prepared By</th>
              <th>Date</th>
              <th className="align-right">Total</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((estimate) => (
              <tr key={estimate.id}>
                <td>
                  <Link to={`/estimates/${estimate.id}`}>{estimate.display_name}</Link>
                </td>
                <td>{estimate.project_name}</td>
                <td>{estimate.client}</td>
                <td>{estimate.job_number || '—'}</td>
                <td>{estimate.prepared_by || '—'}</td>
                <td>{estimate.bid_date || '—'}</td>
                <td className="align-right">{currency.format(estimate.total)}</td>
                <td>{new Date(estimate.updated_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

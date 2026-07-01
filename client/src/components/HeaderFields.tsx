import type { Estimate, EstimateInput } from '../types'

interface Props {
  values: EstimateInput
  onChange: (values: EstimateInput) => void
  clients: string[]
  estimate: Estimate | null
}

export default function HeaderFields({ values, onChange, clients, estimate }: Props) {
  function set<K extends keyof EstimateInput>(key: K, value: EstimateInput[K]) {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="header-fields">
      {estimate && (
        <div className="bid-meta">
          <span className="bid-meta-label">Bid</span>
          <span className="bid-meta-value">{estimate.display_name}</span>
          {estimate.history && estimate.history.length > 1 && (
            <span className="muted"> · v{estimate.version} of {estimate.history.length}</span>
          )}
        </div>
      )}
      <div className="field-grid">
        <label>
          Project Name
          <input
            type="text"
            value={values.project_name}
            onChange={(e) => set('project_name', e.target.value)}
            placeholder="e.g. Acme Spring Campaign"
            required
          />
        </label>

        <label>
          Client
          <select value={values.client} onChange={(e) => set('client', e.target.value)} required>
            <option value="" disabled>
              Select client...
            </option>
            <option value="Standard">Standard (no client-specific rate)</option>
            {clients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </label>

        <label>
          Job Number
          <input
            type="text"
            value={values.job_number}
            onChange={(e) => set('job_number', e.target.value)}
            placeholder="e.g. JN-1001"
          />
        </label>

        <label>
          Prepared By
          <input
            type="text"
            value={values.prepared_by}
            onChange={(e) => set('prepared_by', e.target.value)}
            placeholder="Producer name"
          />
        </label>

        <label>
          Bid Date
          <input type="date" value={values.bid_date} onChange={(e) => set('bid_date', e.target.value)} />
        </label>
      </div>

      <label className="notes-field">
        Notes / Assumptions & Exclusions
        <textarea
          value={values.notes}
          onChange={(e) => set('notes', e.target.value)}
          rows={2}
          placeholder="Assumptions, exclusions, terms..."
        />
      </label>
    </div>
  )
}

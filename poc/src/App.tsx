import { useState } from 'react'
import { rateCard } from './rateCard'
import HeaderFields from './components/HeaderFields'
import LineItemsEditor from './components/LineItemsEditor'
import SummaryPanel from './components/SummaryPanel'
import PrintableBid from './components/PrintableBid'
import type { EstimateForm } from './types'

function emptyForm(): EstimateForm {
  return {
    project_name: '',
    client: '',
    job_number: '',
    prepared_by: '',
    bid_date: new Date().toISOString().slice(0, 10),
    notes: '',
    markup_percent: 0,
    line_items: [],
  }
}

export default function App() {
  const [form, setForm] = useState<EstimateForm>(emptyForm())

  function handleClientChange(newForm: EstimateForm) {
    const clientChanged = newForm.client !== form.client
    if (!clientChanged) {
      setForm(newForm)
      return
    }
    const rebasedItems = newForm.line_items.map((item) => {
      const bucket = rateCard.rates[newForm.client] ?? rateCard.rates[rateCard.standardKey]
      const rate = bucket?.[item.role] ?? rateCard.rates[rateCard.standardKey]?.[item.role] ?? item.rate
      return { ...item, rate }
    })
    setForm({ ...newForm, line_items: rebasedItems })
  }

  function handleReset() {
    if (form.line_items.length > 0 && !window.confirm('Clear this estimate and start a new one?')) return
    setForm(emptyForm())
  }

  return (
    <div className="app">
      <header className="app-header">
        <span className="app-title">AICP Bid Estimator</span>
        <span className="phase-badge">Phase 1 POC</span>
      </header>

      <div className="poc-banner no-print">
        Proof of concept: rate card is bundled sample data (not live-loaded), and nothing is saved between
        sessions — this only demonstrates rate-card-driven line items and the printable bid output.
      </div>

      <main className="app-main">
        <section>
          <form onSubmit={(e) => e.preventDefault()} className="estimate-form">
            <HeaderFields values={form} onChange={handleClientChange} clients={rateCard.clients} />

            {form.client ? (
              <LineItemsEditor
                lineItems={form.line_items}
                onChange={(line_items) => setForm({ ...form, line_items })}
                rateCard={rateCard}
                client={form.client}
              />
            ) : (
              <p className="muted">Select a client to start adding line items.</p>
            )}

            <SummaryPanel
              lineItems={form.line_items}
              markupPercent={form.markup_percent}
              onMarkupChange={(markup_percent) => setForm({ ...form, markup_percent })}
            />

            <div className="form-actions no-print">
              {form.client && (
                <button type="button" className="button button-primary" onClick={() => window.print()}>
                  Print / Export Bid
                </button>
              )}
              <button type="button" className="button" onClick={handleReset}>
                New Estimate
              </button>
            </div>
          </form>

          {form.client && (
            <div className="print-area">
              <PrintableBid estimate={form} />
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

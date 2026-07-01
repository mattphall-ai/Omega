import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createEstimate, fetchEstimate, fetchRateCard, reviseEstimate } from '../api'
import HeaderFields from '../components/HeaderFields'
import LineItemsEditor from '../components/LineItemsEditor'
import SummaryPanel from '../components/SummaryPanel'
import PrintableBid from '../components/PrintableBid'
import type { Estimate, EstimateInput, RateCard } from '../types'

function emptyForm(): EstimateInput {
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

function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

function buildPrintEstimate(form: EstimateInput, estimate: Estimate | null): Estimate {
  const subtotal = form.line_items.reduce((sum, item) => sum + (Number(item.hours) || 0) * (Number(item.rate) || 0), 0)
  const markup_amount = (subtotal * (Number(form.markup_percent) || 0)) / 100
  return {
    id: estimate?.id ?? 0,
    bid_number: estimate?.bid_number ?? 0,
    version: estimate?.version ?? 0,
    root_id: estimate?.root_id ?? 0,
    is_latest: true,
    display_name: estimate?.display_name ?? 'DRAFT (not yet saved)',
    project_name: form.project_name,
    client: form.client,
    job_number: form.job_number,
    prepared_by: form.prepared_by,
    bid_date: form.bid_date,
    notes: form.notes,
    markup_percent: form.markup_percent,
    line_items: form.line_items,
    subtotal: round2(subtotal),
    markup_amount: round2(markup_amount),
    total: round2(subtotal + markup_amount),
    created_at: estimate?.created_at ?? '',
    updated_at: estimate?.updated_at ?? '',
  }
}

function toForm(estimate: Estimate): EstimateInput {
  return {
    project_name: estimate.project_name,
    client: estimate.client,
    job_number: estimate.job_number ?? '',
    prepared_by: estimate.prepared_by ?? '',
    bid_date: estimate.bid_date ?? '',
    notes: estimate.notes ?? '',
    markup_percent: estimate.markup_percent,
    line_items: estimate.line_items,
  }
}

export default function EstimateEditorPage({ mode }: { mode: 'create' | 'edit' }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [rateCard, setRateCard] = useState<RateCard | null>(null)
  const [estimate, setEstimate] = useState<Estimate | null>(null)
  const [form, setForm] = useState<EstimateInput>(emptyForm())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const loadRateCard = fetchRateCard()
    const loadEstimate = mode === 'edit' && id ? fetchEstimate(Number(id)) : Promise.resolve(null)

    Promise.all([loadRateCard, loadEstimate])
      .then(([card, loadedEstimate]) => {
        if (cancelled) return
        setRateCard(card)
        if (loadedEstimate) {
          setEstimate(loadedEstimate)
          setForm(toForm(loadedEstimate))
        } else {
          setEstimate(null)
          setForm(emptyForm())
        }
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
  }, [mode, id])

  function handleClientChange(newForm: EstimateInput) {
    const clientChanged = newForm.client !== form.client
    if (!clientChanged || !rateCard) {
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

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setStatus(null)
    try {
      const result =
        mode === 'edit' && estimate ? await reviseEstimate(estimate.id, form) : await createEstimate(form)
      setStatus(
        mode === 'edit' && estimate
          ? `Saved as new version: ${result.display_name}`
          : `Created bid ${result.display_name}`
      )
      navigate(`/estimates/${result.id}`, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading || !rateCard) {
    return <p className="muted">Loading...</p>
  }

  return (
    <section>
      <form onSubmit={handleSave} className="estimate-form">
        <HeaderFields values={form} onChange={handleClientChange} clients={rateCard.clients} estimate={estimate} />

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

        {error && <p className="error">{error}</p>}
        {status && <p className="success">{status}</p>}

        <div className="form-actions no-print">
          <button type="submit" className="button button-primary" disabled={saving}>
            {saving ? 'Saving...' : mode === 'edit' ? 'Save as New Version' : 'Create Estimate'}
          </button>
          {form.client && (
            <button type="button" className="button" onClick={() => window.print()}>
              Print / Export Bid
            </button>
          )}
        </div>
      </form>

      {form.client && (
        <div className="print-area">
          <PrintableBid estimate={buildPrintEstimate(form, estimate)} />
        </div>
      )}
    </section>
  )
}

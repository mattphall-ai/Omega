import { Router } from 'express';
import { db } from '../db.js';
import { computeTotals, displayName } from '../util.js';

export const estimatesRouter = Router();

const BID_NUMBER_START = 1000;

function rowToEstimate(row) {
  return {
    id: row.id,
    bid_number: row.bid_number,
    version: row.version,
    root_id: row.root_id,
    is_latest: !!row.is_latest,
    display_name: displayName(row),
    project_name: row.project_name,
    client: row.client,
    job_number: row.job_number,
    prepared_by: row.prepared_by,
    bid_date: row.bid_date,
    notes: row.notes,
    markup_percent: row.markup_percent,
    line_items: JSON.parse(row.line_items),
    subtotal: row.subtotal,
    markup_amount: row.markup_amount,
    total: row.total,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function getRow(id) {
  return db.prepare('SELECT * FROM estimates WHERE id = ?').get(id);
}

// GET /api/estimates?q=search+term -- searches latest versions only
estimatesRouter.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    rows = db
      .prepare(
        `SELECT * FROM estimates
         WHERE is_latest = 1 AND (
           lower(project_name) LIKE ? OR
           lower(client) LIKE ? OR
           lower(coalesce(job_number, '')) LIKE ? OR
           lower(coalesce(prepared_by, '')) LIKE ? OR
           CAST(bid_number AS TEXT) LIKE ?
         )
         ORDER BY updated_at DESC`
      )
      .all(like, like, like, like, like);
  } else {
    rows = db
      .prepare('SELECT * FROM estimates WHERE is_latest = 1 ORDER BY updated_at DESC')
      .all();
  }
  res.json(rows.map(rowToEstimate));
});

// GET /api/estimates/:id
estimatesRouter.get('/:id', (req, res) => {
  const row = getRow(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Estimate not found' });
  const rootId = row.root_id ?? row.id;
  const history = db
    .prepare('SELECT id, version, is_latest, updated_at FROM estimates WHERE root_id = ? OR id = ? ORDER BY version')
    .all(rootId, rootId);
  res.json({ ...rowToEstimate(row), history });
});

function validateBody(body) {
  if (!body.project_name || !String(body.project_name).trim()) {
    return 'project_name is required';
  }
  if (!body.client || !String(body.client).trim()) {
    return 'client is required';
  }
  if (!Array.isArray(body.line_items)) {
    return 'line_items must be an array';
  }
  return null;
}

// POST /api/estimates -- create a brand new estimate (version 0), auto-assigns bid number
estimatesRouter.post('/', (req, res) => {
  const body = req.body;
  const error = validateBody(body);
  if (error) return res.status(400).json({ error });

  const maxRow = db
    .prepare('SELECT MAX(bid_number) AS max_bid FROM estimates WHERE version = 0')
    .get();
  const bidNumber = (maxRow.max_bid ?? BID_NUMBER_START - 1) + 1;

  const now = new Date().toISOString();
  const totals = computeTotals(body.line_items, body.markup_percent);

  const insert = db.prepare(`
    INSERT INTO estimates
      (bid_number, version, root_id, is_latest, project_name, client, job_number,
       prepared_by, bid_date, notes, markup_percent, line_items, subtotal, markup_amount, total,
       created_at, updated_at)
    VALUES
      (?, 0, NULL, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = insert.run(
    bidNumber,
    String(body.project_name).trim(),
    String(body.client).trim(),
    body.job_number ?? null,
    body.prepared_by ?? null,
    body.bid_date ?? null,
    body.notes ?? null,
    Number(body.markup_percent) || 0,
    JSON.stringify(body.line_items),
    totals.subtotal,
    totals.markup_amount,
    totals.total,
    now,
    now
  );

  db.prepare('UPDATE estimates SET root_id = ? WHERE id = ?').run(info.lastInsertRowid, info.lastInsertRowid);

  res.status(201).json(rowToEstimate(getRow(Number(info.lastInsertRowid))));
});

// POST /api/estimates/:id/revise -- saves edits to an existing estimate as a new version
// (e.g. projectname_estimate_100 -> projectname_estimate_100.1)
estimatesRouter.post('/:id/revise', (req, res) => {
  const original = getRow(Number(req.params.id));
  if (!original) return res.status(404).json({ error: 'Estimate not found' });

  const body = req.body;
  const error = validateBody(body);
  if (error) return res.status(400).json({ error });

  const rootId = original.root_id ?? original.id;
  const maxVersionRow = db
    .prepare('SELECT MAX(version) AS max_version FROM estimates WHERE root_id = ? OR id = ?')
    .get(rootId, rootId);
  const nextVersion = (maxVersionRow.max_version ?? 0) + 1;

  const now = new Date().toISOString();
  const totals = computeTotals(body.line_items, body.markup_percent);

  db.prepare('UPDATE estimates SET is_latest = 0 WHERE root_id = ? OR id = ?').run(rootId, rootId);

  const insert = db.prepare(`
    INSERT INTO estimates
      (bid_number, version, root_id, is_latest, project_name, client, job_number,
       prepared_by, bid_date, notes, markup_percent, line_items, subtotal, markup_amount, total,
       created_at, updated_at)
    VALUES
      (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = insert.run(
    original.bid_number,
    nextVersion,
    rootId,
    String(body.project_name).trim(),
    String(body.client).trim(),
    body.job_number ?? null,
    body.prepared_by ?? null,
    body.bid_date ?? null,
    body.notes ?? null,
    Number(body.markup_percent) || 0,
    JSON.stringify(body.line_items),
    totals.subtotal,
    totals.markup_amount,
    totals.total,
    now,
    now
  );

  res.status(201).json(rowToEstimate(getRow(Number(info.lastInsertRowid))));
});

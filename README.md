# AICP Bid Estimator

An internal tool for producers to build AICP-style post production bids: enter
project details, add role-based line items, and get hourly rates automatically
from a shared rate card. Estimates are stored in a shared database, searchable,
and every edit to a saved estimate is kept as a new version instead of
overwriting history.

## How it works

- **Rate card** (`data/rate-card.xlsx`): the source of truth for hourly rates.
  The app never hardcodes rates — it parses this file on every request (and
  hot-reloads automatically if the file changes on disk). The **role** column
  drives which roles are available on a bid; every other column is a rate
  column. A column named `Standard Rate` is the fallback rate; any other
  column (e.g. `Client A Rate`) becomes a selectable client, and its rate
  values are used only when that client is picked. **The client dropdown in
  the app is generated directly from this file** — add a client by adding a
  column, retire one by removing it.

  To update rates: replace `data/rate-card.xlsx` with a new file in the same
  shape (a `role` column plus one rate column per client, optionally a
  `Standard Rate` column) and redeploy.

- **Estimates**: stored server-side in SQLite (`server/var/estimates.sqlite`,
  created automatically, not checked into git) so every producer sees the
  same shared list. Each estimate is searchable by project name, client, job
  number, bid number, or preparer.

- **Bid numbers & versions**: creating a new estimate auto-assigns the next
  sequential bid number (e.g. `1000`). Saving changes to an existing estimate
  never overwrites it — it creates a new version and keeps the old one as
  history, e.g. `acme_spring_campaign_estimate_1000` →
  `acme_spring_campaign_estimate_1000.1` → `...1000.2`.

- **Printable bid**: the editor has a "Print / Export Bid" button that
  produces a clean, AICP-style formatted document (grouped by section, with
  section subtotals, markup, and grand total) via the browser's print dialog
  (use "Save as PDF" there for a PDF).

## Project layout

```
data/rate-card.xlsx     checked-in rate card (replace to update rates)
server/                 Express API + SQLite storage
client/                 React + Vite frontend
```

## Setup

Requires Node.js 22.5+ (uses the built-in `node:sqlite` module).

```
npm install --workspaces
```

## Development

Runs the API on :3001 and the Vite dev server (with API proxy) on :5173:

```
npm run dev
```

## Production

```
npm run build   # builds the client into client/dist
npm start        # serves the API and the built client on :3001 (set PORT to change)
```

## Updating the rate card

1. Prepare a new `.xlsx` with a `role` column and one rate column per client
   (name each `<Client Name> Rate`), plus an optional `Standard Rate` column
   for a default/fallback rate.
2. Replace `data/rate-card.xlsx` with the new file.
3. Redeploy (or, if the server process keeps running and the file is
   replaced on disk in place, it picks up the change automatically on the
   next request — no restart needed).

Existing saved estimates are not affected retroactively — the rate shown on
each line item is a snapshot of the rate card at the time that line was
added or last edited, exactly as a real bid document should behave.

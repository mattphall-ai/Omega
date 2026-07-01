# AICP Bid Estimator — Phase 1 POC

A single-page, browser-only proof of concept. No backend, no database, nothing
persisted between sessions — this exists purely to demonstrate:

1. Rate-card-driven line items: pick a client, add line items by role, and the
   hourly rate auto-fills from the rate card for that client (switching client
   rebases every line item's rate).
2. Estimate creation: project/client/job details, line items grouped by
   section, markup %, computed totals, and a "Print / Export Bid" button that
   renders an AICP-style formatted bid document via the browser print dialog.

## What's different from the full version (`/server` + `/client`)

The rate card here (`src/rateCard.ts`) is bundled sample data transcribed
from the real `data/rate-card.xlsx` at the repo root — it is **not** read
live from that file, and there's no way to replace it without editing code.
There's also no saved/searchable list of estimates and no auto bid
numbering/versioning; you work on one estimate at a time and it's gone on
refresh. Those are exactly the pieces the full server-backed version
(`/server`, `/client`) adds back in.

## Run it

```
npm install
npm run dev       # http://localhost:5173
```

or build a static bundle you can open with no server at all:

```
npm run build
npm run preview   # serves dist/ statically
```

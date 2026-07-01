import type { RateCard } from './types'

// Phase 1 POC only: this is the actual rate card data (data/rate-card.xlsx at
// the repo root), transcribed into the bundle so this demo can run with zero
// backend. It is NOT a live reference to the file - editing rates here means
// editing code, which the real (server-backed) version in /server and
// /client specifically avoids. See the root README for that version.
export const rateCard: RateCard = {
  roles: ['editor', 'animator', 'producer', 'cg artist', 'ai artist', 'executive producer'],
  clients: ['Client A', 'Client B'],
  standardKey: 'Standard',
  rates: {
    Standard: {
      editor: 101,
      animator: 102,
      producer: 103,
      'cg artist': 104,
      'ai artist': 105,
      'executive producer': 106,
    },
    'Client A': {
      editor: 201,
      animator: 202,
      producer: 203,
      'cg artist': 204,
      'ai artist': 205,
      'executive producer': 206,
    },
    'Client B': {
      editor: 301,
      animator: 302,
      producer: 303,
      'cg artist': 304,
      'ai artist': 305,
      'executive producer': 306,
    },
  },
  sourceFile: 'rate-card.xlsx (bundled sample data)',
  updatedAt: '2026-07-01T18:01:20.254Z',
}

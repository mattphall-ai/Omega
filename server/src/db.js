import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = path.resolve(__dirname, '../var');
const DB_PATH = path.join(DB_DIR, 'estimates.sqlite');

fs.mkdirSync(DB_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS estimates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bid_number INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 0,
    root_id INTEGER,
    is_latest INTEGER NOT NULL DEFAULT 1,
    project_name TEXT NOT NULL,
    client TEXT NOT NULL,
    job_number TEXT,
    prepared_by TEXT,
    bid_date TEXT,
    notes TEXT,
    markup_percent REAL NOT NULL DEFAULT 0,
    line_items TEXT NOT NULL,
    subtotal REAL NOT NULL DEFAULT 0,
    markup_amount REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_estimates_root ON estimates(root_id);
  CREATE INDEX IF NOT EXISTS idx_estimates_latest ON estimates(is_latest);
  CREATE INDEX IF NOT EXISTS idx_estimates_search
    ON estimates(project_name, client, job_number, prepared_by, bid_number);
`);

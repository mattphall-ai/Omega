import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ExcelJS from 'exceljs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The rate card is a checked-in file, not baked-in numbers: to update rates,
// replace this file and redeploy (the parser also hot-reloads if the file's
// mtime changes without a restart, e.g. after a `git pull` on the server).
export const RATE_CARD_PATH = path.resolve(__dirname, '../../data/rate-card.xlsx');

export const STANDARD_KEY = 'Standard';

let cache = null;
let cachedMtimeMs = null;
let inflight = null;

function stripRateSuffix(header) {
  return String(header).replace(/\s*rate\s*$/i, '').trim();
}

async function parseRateCardFile(filePath) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error('Rate card has no worksheet');

  const headers = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = cell.value == null ? '' : String(cell.value).trim();
  });

  const roleColIndex = headers.findIndex((h) => h && /role/i.test(h));
  if (roleColIndex === -1) {
    throw new Error('Rate card is missing a "role" column');
  }

  const clients = [];
  const rates = { [STANDARD_KEY]: {} };
  const columnKeys = new Map(); // column index -> client key

  headers.forEach((header, index) => {
    if (!header || index === roleColIndex) return;
    const isStandard = /^standard\b/i.test(header);
    const key = isStandard ? STANDARD_KEY : stripRateSuffix(header);
    columnKeys.set(index, key);
    if (!isStandard) {
      clients.push(key);
      rates[key] = {};
    }
  });

  const roles = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const roleCell = row.getCell(roleColIndex).value;
    if (roleCell == null || String(roleCell).trim() === '') return;
    const role = String(roleCell).trim();
    if (!roles.includes(role)) roles.push(role);

    for (const [colIndex, key] of columnKeys.entries()) {
      const raw = row.getCell(colIndex).value;
      const value = raw == null || raw === '' ? null : Number(raw);
      rates[key][role] = Number.isFinite(value) ? value : null;
    }
  });

  const stat = fs.statSync(filePath);
  return {
    roles,
    clients,
    standardKey: STANDARD_KEY,
    rates,
    sourceFile: path.basename(filePath),
    updatedAt: stat.mtime.toISOString(),
  };
}

export async function getRateCard() {
  const stat = fs.statSync(RATE_CARD_PATH);
  if (cache && cachedMtimeMs === stat.mtimeMs) return cache;
  if (!inflight) {
    inflight = parseRateCardFile(RATE_CARD_PATH).then((data) => {
      cache = data;
      cachedMtimeMs = stat.mtimeMs;
      inflight = null;
      return data;
    }, (err) => {
      inflight = null;
      throw err;
    });
  }
  return inflight;
}

export async function getRateFor(client, role) {
  const card = await getRateCard();
  const bucket = card.rates[client] ?? card.rates[STANDARD_KEY];
  const rate = bucket?.[role];
  if (rate != null) return rate;
  return card.rates[STANDARD_KEY]?.[role] ?? null;
}

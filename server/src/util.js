export function slugify(text) {
  return String(text || 'untitled')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'untitled';
}

export function displayName({ project_name, bid_number, version }) {
  const base = `${slugify(project_name)}_estimate_${bid_number}`;
  return version > 0 ? `${base}.${version}` : base;
}

export function computeTotals(lineItems, markupPercent) {
  const subtotal = lineItems.reduce((sum, item) => {
    const hours = Number(item.hours) || 0;
    const rate = Number(item.rate) || 0;
    return sum + hours * rate;
  }, 0);
  const markup_amount = subtotal * (Number(markupPercent) || 0) / 100;
  const total = subtotal + markup_amount;
  return {
    subtotal: round2(subtotal),
    markup_amount: round2(markup_amount),
    total: round2(total),
  };
}

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

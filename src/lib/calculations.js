/**
 * P&L calculation helpers.
 * IMPORTANT: Never mix confirmed, estimated, and untracked numbers in the same total.
 */

export function effectiveCost(card) {
  if (card.cost_basis_source === 'confirmed') {
    return card.manual_cost != null ? card.manual_cost : card.avg_cost_paid;
  }
  if (card.cost_basis_source === 'estimated') return card.estimated_cost;
  return null; // untracked
}

export function effectivePrice(card) {
  return card.price_override != null ? card.price_override : card.market_price;
}

export function cardGainLoss(card) {
  const cost = effectiveCost(card);
  if (cost == null) return null;
  return (effectivePrice(card) - cost) * (card.quantity || 1);
}

export function cardROI(card) {
  const cost = effectiveCost(card);
  if (!cost || cost === 0) return null;
  return ((effectivePrice(card) - cost) / cost) * 100;
}

// Only call with confirmed cards — never pass mixed arrays
export function confirmedPnL(cards) {
  const confirmed = cards.filter(c => c.cost_basis_source === 'confirmed');
  const totalValue = confirmed.reduce((s, c) => s + effectivePrice(c) * (c.quantity || 1), 0);
  const totalCost = confirmed.reduce((s, c) => s + effectiveCost(c) * (c.quantity || 1), 0);
  const totalGain = totalValue - totalCost;
  const roi = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  return { totalValue, totalCost, totalGain, roi, count: confirmed.length };
}

// Only call with estimated cards — never added to confirmed totals
export function estimatedPnL(cards) {
  const estimated = cards.filter(c => c.cost_basis_source === 'estimated' && c.estimated_cost != null);
  const totalValue = estimated.reduce((s, c) => s + effectivePrice(c) * (c.quantity || 1), 0);
  const totalCost = estimated.reduce((s, c) => s + c.estimated_cost * (c.quantity || 1), 0);
  const totalGain = totalValue - totalCost;
  const roi = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  return { totalValue, totalCost, totalGain, roi, count: estimated.length };
}

export function formatCurrency(amount) {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatPercent(pct) {
  if (pct == null) return '—';
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
}

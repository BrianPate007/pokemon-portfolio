/**
 * eBay integration stubs.
 *
 * When wiring real eBay calls, apply these filters:
 *   1. Exclude statistical outliers beyond 2 standard deviations from the median
 *   2. Require at least 3 sold listings before trusting a price
 *   3. Weight Buy It Now sales more heavily than auctions
 *   4. Exclude duplicate sales from same seller within 7 days at same price
 *   5. Only use sales from the last 90 days
 */

// STUB: Replace with real eBay Finding API (sold listings) call.
// Should return { price: number, sampleSize: number, lastUpdated: string } or null.
export async function fetchEbayHistoricalPrice(productName, setName, grade) {
  return null;
}

// STUB: PSA 10 comparable sales lookup.
// Should return { price: number, sampleSize: number, lastUpdated: string } or null.
export async function fetchPsa10Comp(productName, setName) {
  return null;
}

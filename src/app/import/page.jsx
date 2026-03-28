'use client';
import { useState } from 'react';
import Papa from 'papaparse';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

function parsePrice(val) {
  if (!val || val === '') return 0;
  return parseFloat(String(val).replace(/,/g, '')) || 0;
}

function parseWatchlist(val) {
  const v = String(val).toLowerCase().trim();
  return v === 'true' || v === '1' || v === 'yes';
}

function parseRow(row) {
  const avgCost = parsePrice(row['Average Cost Paid']);
  return {
    id: uuidv4(),
    portfolio_name: row['Portfolio Name'] || null,
    category: row['Category'] || null,
    set_name: row['Set'] || null,
    product_name: row['Product Name'] || '',
    card_number: row['Card Number'] || null,
    rarity: row['Rarity'] || null,
    variance: row['Variance'] || null,
    grade: row['Grade'] || null,
    card_condition: row['Card Condition'] || null,
    avg_cost_paid: avgCost,
    quantity: parseInt(row['Quantity']) || 1,
    market_price: parsePrice(row['Market Price']),
    price_override: parsePrice(row['Price Override']) || null,
    watchlist: parseWatchlist(row['Watchlist']),
    date_added: row['Date Added'] || null,
    notes: row['Notes'] || null,
    cost_basis_source: avgCost > 0 ? 'confirmed' : 'untracked',
    manual_cost: null,
    estimated_cost: null,
  };
}

const PREVIEW_COLS = ['Product Name', 'Set', 'Grade', 'Average Cost Paid', 'Market Price', 'Quantity'];

export default function ImportPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setDone(null);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length > 0) {
          setError(`Parse warning: ${errors[0].message}`);
        }
        setRows(data.map(parseRow));
      },
      error: (err) => setError(err.message),
    });
  }

  async function handleImport() {
    setImporting(true);
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Not authenticated.'); setImporting(false); return; }

    const payload = rows.map(r => ({ ...r, user_id: user.id }));

    // Upsert in batches of 500
    const BATCH = 500;
    for (let i = 0; i < payload.length; i += BATCH) {
      const { error } = await supabase.from('cards').upsert(payload.slice(i, i + BATCH));
      if (error) { setError(error.message); setImporting(false); return; }
    }

    setDone(rows.length);
    setRows([]);
    setImporting(false);
  }

  const confirmed = rows.filter(r => r.cost_basis_source === 'confirmed').length;
  const untracked = rows.filter(r => r.cost_basis_source === 'untracked').length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Import CSV</h1>
        <p className="text-sm text-gray-400 mt-1">Export your collection from Collectr and upload it here.</p>
      </div>

      {done && (
        <div className="bg-green-900/40 border border-green-800 rounded-lg p-4 text-green-300 text-sm">
          ✓ Successfully imported {done} cards.
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <label className="block">
          <span className="text-sm text-gray-400 mb-2 block">Select CSV file</span>
          <input
            type="file"
            accept=".csv"
            onChange={handleFile}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer"
          />
        </label>

        {rows.length > 0 && (
          <>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-400">{rows.length} rows parsed</span>
              <span className="text-green-400">✓ {confirmed} confirmed cost</span>
              <span className="text-gray-500">◌ {untracked} untracked</span>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800">
                    {PREVIEW_COLS.map(c => (
                      <th key={c} className="text-left px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">{c}</th>
                    ))}
                    <th className="text-left px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">Basis</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 50).map((row, i) => (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="px-3 py-2 text-gray-200 max-w-xs truncate">{row.product_name}</td>
                      <td className="px-3 py-2 text-gray-400">{row.set_name}</td>
                      <td className="px-3 py-2 text-gray-400">{row.grade || '—'}</td>
                      <td className="px-3 py-2 text-gray-300">${row.avg_cost_paid.toFixed(2)}</td>
                      <td className="px-3 py-2 text-gray-300">${row.market_price.toFixed(2)}</td>
                      <td className="px-3 py-2 text-gray-400">{row.quantity}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          row.cost_basis_source === 'confirmed'
                            ? 'bg-green-900 text-green-300'
                            : 'bg-gray-800 text-gray-500'
                        }`}>
                          {row.cost_basis_source.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 50 && (
                <p className="text-xs text-gray-500 px-3 py-2">Showing first 50 of {rows.length} rows</p>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={importing}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
            >
              {importing ? 'Importing…' : `Import ${rows.length} Cards`}
            </button>
          </>
        )}

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-500 space-y-1">
        <p className="font-medium text-gray-400">Expected columns:</p>
        <p>Portfolio Name, Category, Set, Product Name, Card Number, Rarity, Variance, Grade, Card Condition, Average Cost Paid, Quantity, Market Price, Price Override, Watchlist, Date Added, Notes</p>
        <p className="mt-2">Prices with commas (e.g. <code className="text-gray-300">1,079.73</code>) are handled automatically.</p>
      </div>
    </div>
  );
}

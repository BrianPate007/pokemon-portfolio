'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MetricCard from '@/components/MetricCard';
import Badge from '@/components/Badge';
import TopSetsChart from '@/components/TopSetsChart';
import GradedBreakdownChart from '@/components/GradedBreakdownChart';
import { confirmedPnL, estimatedPnL, effectivePrice, cardGainLoss, formatCurrency, formatPercent } from '@/lib/calculations';
import Link from 'next/link';

export default function DashboardPage() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('cards').select('*').then(({ data }) => {
        setCards(data || []);
        setLoading(false);
      });
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-32 space-y-4">
        <div className="text-5xl">📭</div>
        <h2 className="text-xl font-semibold text-white">No cards yet</h2>
        <p className="text-gray-400 text-sm">Import a CSV from Collectr to get started.</p>
        <Link href="/import" className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
          Import CSV
        </Link>
      </div>
    );
  }

  const confirmed = confirmedPnL(cards);
  const estimated = estimatedPnL(cards);
  const totalMarketValue = cards.reduce((s, c) => s + effectivePrice(c) * (c.quantity || 1), 0);
  const untrackedCount = cards.filter(c => c.cost_basis_source === 'untracked').length;

  // Top 5 gainers / losers (confirmed only)
  const confirmedCards = cards
    .filter(c => c.cost_basis_source === 'confirmed')
    .map(c => ({ ...c, gainLoss: cardGainLoss(c) }))
    .filter(c => c.gainLoss !== null)
    .sort((a, b) => b.gainLoss - a.gainLoss);

  const top5Gainers = confirmedCards.slice(0, 5);
  const top5Losers = [...confirmedCards].sort((a, b) => a.gainLoss - b.gainLoss).slice(0, 5);

  const roiVariant = confirmed.roi >= 0 ? 'green' : 'red';
  const gainVariant = confirmed.totalGain >= 0 ? 'green' : 'red';

  return (
    <div className="space-y-6">
      {/* Confirmed P&L metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard label="Total Market Value" value={formatCurrency(totalMarketValue)} />
        <MetricCard label="Confirmed Cost Basis" value={formatCurrency(confirmed.totalCost)} sub={`${confirmed.count} cards`} />
        <MetricCard label="Confirmed Gain / Loss" value={formatCurrency(confirmed.totalGain)} variant={gainVariant} />
        <MetricCard label="Confirmed ROI" value={formatPercent(confirmed.roi)} variant={roiVariant} sub={<Badge type="confirmed" />} />
      </div>

      {/* Estimated P&L banner */}
      {estimated.count > 0 && (
        <div className="bg-amber-900/30 border border-amber-800 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Badge type="estimated" />
            <span className="text-sm text-amber-300 font-medium">
              Estimated P&L ({estimated.count} cards): {formatCurrency(estimated.totalGain)} gain · {formatPercent(estimated.roi)} ROI
            </span>
          </div>
          <span className="text-xs text-amber-600">eBay historical pricing — not confirmed</span>
        </div>
      )}

      {/* Untracked reminder */}
      {untrackedCount > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Badge type="untracked" />
            <span className="text-sm text-gray-400">
              {untrackedCount} card{untrackedCount !== 1 ? 's' : ''} have no cost basis.
            </span>
          </div>
          <Link href="/cost-entry" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
            Enter costs →
          </Link>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Top Sets by Market Value</h2>
          <TopSetsChart cards={cards} />
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Graded vs Ungraded</h2>
          <GradedBreakdownChart cards={cards} />
        </div>
      </div>

      {/* Gainers / Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: '🏆 Top 5 Gainers', rows: top5Gainers, positive: true },
          { title: '📉 Top 5 Losers', rows: top5Losers, positive: false },
        ].map(({ title, rows, positive }) => (
          <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3">{title}</h2>
            {rows.length === 0 ? (
              <p className="text-sm text-gray-600">No confirmed P&L data yet.</p>
            ) : (
              <div className="space-y-2">
                {rows.map(card => (
                  <div key={card.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-200 truncate">{card.product_name}</p>
                      <p className="text-xs text-gray-500 truncate">{card.set_name}{card.grade ? ` · ${card.grade}` : ''}</p>
                    </div>
                    <span className={`text-sm font-semibold shrink-0 ${card.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatCurrency(card.gainLoss)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

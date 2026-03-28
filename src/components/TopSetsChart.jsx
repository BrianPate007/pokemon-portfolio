'use client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function TopSetsChart({ cards }) {
  const setTotals = {};
  for (const card of cards) {
    const set = card.set_name || 'Unknown';
    const price = (card.price_override ?? card.market_price) * (card.quantity || 1);
    setTotals[set] = (setTotals[set] || 0) + price;
  }

  const sorted = Object.entries(setTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const data = {
    labels: sorted.map(([set]) => set),
    datasets: [{
      data: sorted.map(([, val]) => val),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: {
      callbacks: { label: ctx => ` $${ctx.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` }
    }},
    scales: {
      x: { ticks: { color: '#6b7280', callback: v => `$${v.toLocaleString()}` }, grid: { color: '#1f2937' } },
      y: { ticks: { color: '#9ca3af', font: { size: 11 } }, grid: { display: false } },
    },
  };

  if (sorted.length === 0) return <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No data</div>;

  return <div style={{ height: Math.max(180, sorted.length * 36) }}><Bar data={data} options={options} /></div>;
}

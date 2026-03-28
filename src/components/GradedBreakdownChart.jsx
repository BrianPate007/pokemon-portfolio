'use client';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function GradedBreakdownChart({ cards }) {
  const graded = cards.filter(c => c.grade && c.grade.trim() !== '');
  const ungraded = cards.filter(c => !c.grade || c.grade.trim() === '');

  const gradedValue = graded.reduce((s, c) => s + (c.price_override ?? c.market_price) * (c.quantity || 1), 0);
  const ungradedValue = ungraded.reduce((s, c) => s + (c.price_override ?? c.market_price) * (c.quantity || 1), 0);

  if (gradedValue === 0 && ungradedValue === 0) {
    return <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No data</div>;
  }

  const data = {
    labels: ['Graded', 'Ungraded'],
    datasets: [{
      data: [gradedValue, ungradedValue],
      backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(107, 114, 128, 0.5)'],
      borderColor: ['rgba(59, 130, 246, 1)', 'rgba(107, 114, 128, 1)'],
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 12 } } },
      tooltip: { callbacks: { label: ctx => ` $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` } },
    },
  };

  return <div style={{ height: 220 }}><Doughnut data={data} options={options} /></div>;
}

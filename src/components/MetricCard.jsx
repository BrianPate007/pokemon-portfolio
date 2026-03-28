export default function MetricCard({ label, value, sub, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-900 border-gray-800',
    green: 'bg-gray-900 border-green-900',
    red: 'bg-gray-900 border-red-900',
    amber: 'bg-gray-900 border-amber-900',
  };
  const valueColors = {
    default: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    amber: 'text-amber-400',
  };
  return (
    <div className={`border rounded-xl p-4 ${variants[variant]}`}>
      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueColors[variant]}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

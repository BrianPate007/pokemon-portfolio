const STYLES = {
  confirmed: 'bg-green-900 text-green-300 border-green-800',
  estimated: 'bg-amber-900 text-amber-300 border-amber-800',
  untracked: 'bg-gray-800 text-gray-400 border-gray-700',
};
const LABELS = {
  confirmed: 'CONFIRMED',
  estimated: 'ESTIMATED',
  untracked: 'UNTRACKED',
};

export default function Badge({ type }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${STYLES[type] ?? STYLES.untracked}`}>
      {LABELS[type] ?? type.toUpperCase()}
    </span>
  );
}

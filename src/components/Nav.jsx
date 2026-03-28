'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/', label: 'Dashboard' },
  { href: '/import', label: 'Import CSV' },
  { href: '/cost-entry', label: 'Cost Entry' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/grading', label: 'Grading' },
];

export default function Nav({ user, onSignOut }) {
  const pathname = usePathname();
  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 h-14">
        <span className="text-lg font-bold text-white flex items-center gap-2">
          🃏 <span className="hidden sm:inline">Pokemon Portfolio</span>
        </span>
        <nav className="flex items-center gap-1 flex-1 overflow-x-auto">
          {LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === link.href
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-gray-500 hidden md:block">{user.email}</span>
          <button
            onClick={onSignOut}
            className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-800 px-2.5 py-1 rounded-md transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

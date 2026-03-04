'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: '探索', icon: '🔍' },
  { href: '/bookings', label: '預約', icon: '📅' },
  { href: '/manage', label: '業者中心', icon: '🏪' },
  { href: '/profile', label: '我的', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on provider detail pages
  if (pathname.startsWith('/provider/')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-50">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-primary' : 'text-muted'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[11px] font-medium mt-0.5">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

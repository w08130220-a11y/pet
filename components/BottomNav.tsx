'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: '探索', icon: '🔍' },
  { href: '/matching', label: '媒合', icon: '🤖' },
  { href: '/bookings', label: '預約', icon: '📅' },
  { href: '/chat', label: '訊息', icon: '💬' },
  { href: '/manage', label: '業者', icon: '🏪' },
  { href: '/profile', label: '我的', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on provider detail and chat room pages
  if (pathname.startsWith('/provider/')) return null;
  if (pathname.match(/^\/chat\/.+/)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 area-glass">
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center justify-center flex-1 py-1 transition-colors"
              style={{ color: isActive ? '#4a6741' : '#8a8a80' }}
            >
              <span className="text-lg">{tab.icon}</span>
              <span style={{
                fontSize: 11,
                marginTop: 2,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: isActive ? 600 : 500,
              }}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

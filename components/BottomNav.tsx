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
    <nav className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(240,244,237,0.92)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-secondary' : 'text-muted'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className={`text-[11px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

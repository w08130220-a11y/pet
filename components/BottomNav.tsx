'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: '首頁', icon: '🏠' },
  { href: '/pet-world', label: '寵物世界', icon: '🐾' },
  { href: '/health', label: '健康', icon: '💚' },
  { href: '/profile', label: '我的', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="nav-glass fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2">
        {tabs.map(tab => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
                isActive ? 'text-olive-dark' : 'text-muted'
              }`}
            >
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-[11px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

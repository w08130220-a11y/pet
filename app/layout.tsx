import type { Metadata } from 'next';
import './globals.css';
import { AppStoreProvider } from '@/lib/store';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'BeautyBook - 全台美容預約平台',
  description: '找到你附近最好的美容服務',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-background text-foreground">
        <AppStoreProvider>
          <main className="max-w-lg mx-auto min-h-screen pb-16">
            {children}
          </main>
          <BottomNav />
        </AppStoreProvider>
      </body>
    </html>
  );
}

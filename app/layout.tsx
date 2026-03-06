import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PetLife - 寵物社交 APP',
  description: '專為寵物主人設計的社交應用程式',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className="bg-background text-foreground font-body">
        <main className="max-w-lg mx-auto min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}

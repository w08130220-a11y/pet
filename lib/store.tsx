'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Stylist, Service, Booking, PortfolioItem } from './types';

// --- Mock Data ---

const mockStylists: Stylist[] = [
  {
    id: 's1', name: 'Emily Chen', avatar: '', salon: 'Glow Studio',
    rating: 4.9, reviewCount: 128, specialties: ['剪髮', '染髮', '造型'],
    distance: '0.8 km',
  },
  {
    id: 's2', name: 'Sophie Lin', avatar: '', salon: 'Nail Paradise',
    rating: 4.8, reviewCount: 96, specialties: ['美甲', '光療', '手部護理'],
    distance: '1.2 km',
  },
  {
    id: 's3', name: 'Mia Wang', avatar: '', salon: 'Lash Bar',
    rating: 4.7, reviewCount: 73, specialties: ['美睫', '嫁接', '臉部保養'],
    distance: '2.1 km',
  },
  {
    id: 's4', name: 'Ava Liu', avatar: '', salon: 'Hair Artistry',
    rating: 4.9, reviewCount: 215, specialties: ['染髮', '護髮', '頭皮護理'],
    distance: '3.0 km',
  },
];

const mockServices: Service[] = [
  { id: 'sv1', name: '女生剪髮', category: 'haircut', price: 800, duration: 60, description: '洗＋剪＋吹整造型' },
  { id: 'sv2', name: '質感染髮', category: 'coloring', price: 2500, duration: 120, description: '全頭染色＋護色護髮' },
  { id: 'sv3', name: '深層護髮', category: 'treatment', price: 1200, duration: 45, description: '結構式護髮＋頭皮按摩' },
  { id: 'sv4', name: '日式美甲', category: 'nails', price: 1000, duration: 90, description: '基礎保養＋光療凝膠' },
  { id: 'sv5', name: '自然款美睫', category: 'lashes', price: 1500, duration: 75, description: '單根嫁接 100-120 根' },
  { id: 'sv6', name: '臉部保濕', category: 'facial', price: 1800, duration: 60, description: '深層清潔＋保濕導入＋面膜' },
];

const mockBookings: Booking[] = [
  {
    id: 'b1', stylistId: 's1', stylistName: 'Emily Chen', serviceName: '女生剪髮',
    date: '2026-03-10', time: '14:00', duration: 60, price: 800, status: 'upcoming',
  },
  {
    id: 'b2', stylistId: 's2', stylistName: 'Sophie Lin', serviceName: '日式美甲',
    date: '2026-03-15', time: '10:30', duration: 90, price: 1000, status: 'upcoming',
  },
  {
    id: 'b3', stylistId: 's4', stylistName: 'Ava Liu', serviceName: '質感染髮',
    date: '2026-02-20', time: '13:00', duration: 120, price: 2500, status: 'completed',
    rating: 5,
  },
  {
    id: 'b4', stylistId: 's3', stylistName: 'Mia Wang', serviceName: '自然款美睫',
    date: '2026-02-05', time: '11:00', duration: 75, price: 1500, status: 'completed',
    rating: 4,
  },
  {
    id: 'b5', stylistId: 's1', stylistName: 'Emily Chen', serviceName: '深層護髮',
    date: '2026-01-28', time: '16:00', duration: 45, price: 1200, status: 'cancelled',
  },
];

const mockPortfolio: PortfolioItem[] = [
  { id: 'p1', stylistId: 's1', stylistName: 'Emily Chen', imageUri: '', category: '染髮', caption: '霧感奶茶棕，超顯白！', likes: 86, liked: false },
  { id: 'p2', stylistId: 's2', stylistName: 'Sophie Lin', imageUri: '', category: '美甲', caption: '春季花卉款光療', likes: 124, liked: true },
  { id: 'p3', stylistId: 's4', stylistName: 'Ava Liu', imageUri: '', category: '染髮', caption: '漸層蜜桃粉，夢幻感', likes: 203, liked: false },
  { id: 'p4', stylistId: 's3', stylistName: 'Mia Wang', imageUri: '', category: '美睫', caption: '自然濃密款，素顏也好看', likes: 67, liked: false },
  { id: 'p5', stylistId: 's1', stylistName: 'Emily Chen', imageUri: '', category: '剪髮', caption: '法式短鮑伯，俐落又時尚', likes: 95, liked: true },
  { id: 'p6', stylistId: 's4', stylistName: 'Ava Liu', imageUri: '', category: '護髮', caption: '結構式護髮前後對比', likes: 45, liked: false },
];

// --- Categories ---

export const serviceCategories = [
  { key: 'all', label: '全部', emoji: '✨' },
  { key: 'haircut', label: '剪髮', emoji: '✂️' },
  { key: 'coloring', label: '染髮', emoji: '🎨' },
  { key: 'treatment', label: '護髮', emoji: '💆' },
  { key: 'nails', label: '美甲', emoji: '💅' },
  { key: 'lashes', label: '美睫', emoji: '👁️' },
  { key: 'facial', label: '保養', emoji: '🧴' },
];

// --- Store ---

interface AppState {
  stylists: Stylist[];
  services: Service[];
  bookings: Booking[];
  portfolio: PortfolioItem[];
  togglePortfolioLike: (id: string) => void;
  cancelBooking: (id: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [stylists] = useState<Stylist[]>(mockStylists);
  const [services] = useState<Service[]>(mockServices);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(mockPortfolio);

  const togglePortfolioLike = (id: string) => {
    setPortfolio(prev =>
      prev.map(p =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const cancelBooking = (id: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: 'cancelled' as const } : b))
    );
  };

  return (
    <AppContext.Provider value={{ stylists, services, bookings, portfolio, togglePortfolioLike, cancelBooking }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Pet, Post, MealRecord, MedicalRecord } from './types';

// --- Mock Data ---

const mockPets: Pet[] = [
  {
    id: '1',
    name: 'Mochi',
    species: 'dog',
    breed: '柴犬',
    birthDate: '2022-03-15',
    weight: 10.5,
    photoUri: '',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    name: 'Luna',
    species: 'cat',
    breed: '英國短毛貓',
    birthDate: '2023-06-20',
    weight: 4.2,
    photoUri: '',
    createdAt: '2024-02-01',
  },
];

const mockPosts: Post[] = [
  {
    id: '1',
    userId: 'u1',
    userName: '小明',
    userAvatar: '',
    petId: '1',
    petName: 'Mochi',
    imageUri: '',
    caption: '今天帶 Mochi 去公園散步，玩得超開心！🐕',
    likes: 24,
    comments: 5,
    liked: false,
    createdAt: '2026-03-06T10:30:00',
  },
  {
    id: '2',
    userId: 'u2',
    userName: '小美',
    userAvatar: '',
    petId: '2',
    petName: 'Luna',
    imageUri: '',
    caption: 'Luna 又在窗邊曬太陽了，好療癒 ☀️',
    likes: 18,
    comments: 3,
    liked: true,
    createdAt: '2026-03-06T09:15:00',
  },
  {
    id: '3',
    userId: 'u3',
    userName: '阿翔',
    userAvatar: '',
    petId: '3',
    petName: 'Cooper',
    imageUri: '',
    caption: 'Cooper 學會握手了！訓練了兩週終於成功 🎉',
    likes: 42,
    comments: 12,
    liked: false,
    createdAt: '2026-03-05T18:00:00',
  },
];

const mockMeals: MealRecord[] = [
  { id: 'm1', petId: '1', foodType: '乾糧', amount: 120, calories: 360, mealTime: '08:00', createdAt: '2026-03-06' },
  { id: 'm2', petId: '1', foodType: '雞胸肉', amount: 50, calories: 80, mealTime: '12:30', createdAt: '2026-03-06' },
  { id: 'm3', petId: '1', foodType: '乾糧', amount: 100, calories: 300, mealTime: '18:00', createdAt: '2026-03-06' },
];

const mockMedical: MedicalRecord[] = [
  {
    id: 'md1', petId: '1', type: 'vaccine', title: '狂犬病疫苗',
    description: '年度狂犬病疫苗接種', date: '2026-01-15',
    nextDueDate: '2027-01-15', veterinarian: '王醫師', createdAt: '2026-01-15',
  },
  {
    id: 'md2', petId: '1', type: 'checkup', title: '年度健檢',
    description: '血液檢查、X光、心臟超音波', date: '2026-02-10',
    veterinarian: '李醫師', createdAt: '2026-02-10',
  },
];

// --- Store ---

interface AppState {
  pets: Pet[];
  posts: Post[];
  meals: MealRecord[];
  medical: MedicalRecord[];
  activePetId: string;
  setActivePetId: (id: string) => void;
  toggleLike: (postId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [pets] = useState<Pet[]>(mockPets);
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [meals] = useState<MealRecord[]>(mockMeals);
  const [medical] = useState<MedicalRecord[]>(mockMedical);
  const [activePetId, setActivePetId] = useState('1');

  const toggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  return (
    <AppContext.Provider value={{ pets, posts, meals, medical, activePetId, setActivePetId, toggleLike }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

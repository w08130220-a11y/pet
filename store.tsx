import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Provider, Service, Booking, Review, TimeSlot, ServiceCategory } from './index';

// ── State ──
interface AppState {
  providers: Provider[];
  bookings: Booking[];
  reviews: Review[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: ServiceCategory | null;
  selectedCity: string | null;
  userRole: 'customer' | 'provider';
}

const initialState: AppState = {
  providers: [],
  bookings: [],
  reviews: [],
  isLoading: true,
  searchQuery: '',
  selectedCategory: null,
  selectedCity: null,
  userRole: 'customer',
};

// ── Actions ──
type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_CATEGORY'; payload: ServiceCategory | null }
  | { type: 'SET_CITY'; payload: string | null }
  | { type: 'SET_ROLE'; payload: 'customer' | 'provider' }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'UPDATE_BOOKING'; payload: { id: string; updates: Partial<Booking> } }
  | { type: 'CANCEL_BOOKING'; payload: string }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'ADD_PROVIDER'; payload: Provider }
  | { type: 'UPDATE_PROVIDER'; payload: { id: string; updates: Partial<Provider> } };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_CITY':
      return { ...state, selectedCity: action.payload };
    case 'SET_ROLE':
      return { ...state, userRole: action.payload };
    case 'ADD_BOOKING': {
      const bookings = [...state.bookings, action.payload];
      return { ...state, bookings };
    }
    case 'UPDATE_BOOKING': {
      const bookings = state.bookings.map((b) =>
        b.id === action.payload.id ? { ...b, ...action.payload.updates } : b
      );
      return { ...state, bookings };
    }
    case 'CANCEL_BOOKING': {
      const bookings = state.bookings.map((b) =>
        b.id === action.payload ? { ...b, status: 'cancelled' as const } : b
      );
      return { ...state, bookings };
    }
    case 'ADD_REVIEW': {
      const reviews = [...state.reviews, action.payload];
      return { ...state, reviews };
    }
    case 'ADD_PROVIDER': {
      const providers = [...state.providers, action.payload];
      return { ...state, providers };
    }
    case 'UPDATE_PROVIDER': {
      const providers = state.providers.map((p) =>
        p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
      );
      return { ...state, providers };
    }
    default:
      return state;
  }
}

// ── Mock Data ──
const MOCK_PROVIDERS: Provider[] = [
  {
    id: '1',
    name: 'Nail Room 指尖藝術',
    category: 'nail',
    address: '台北市大安區忠孝東路四段155號3樓',
    city: '台北市',
    district: '大安區',
    phone: '02-2771-0001',
    rating: 4.9,
    reviewCount: 238,
    imageUri: '',
    description: '日系高質感美甲工作室，專注凝膠美甲與手足保養。環境舒適寧靜，使用日本進口材料。',
    isVerified: true,
    services: [
      { id: 's1', providerId: '1', name: '單色凝膠美甲', description: '含基礎保養+單色凝膠', category: 'nail', duration: 60, price: 800, isAvailable: true },
      { id: 's2', providerId: '1', name: '造型凝膠美甲', description: '含基礎保養+造型設計', category: 'nail', duration: 90, price: 1500, isAvailable: true },
      { id: 's3', providerId: '1', name: '手部深層保養', description: '去角質+保濕護理+按摩', category: 'nail', duration: 45, price: 600, isAvailable: true },
      { id: 's4', providerId: '1', name: '凝膠卸除', description: '安全卸除+基礎保養', category: 'nail', duration: 30, price: 400, isAvailable: true },
    ],
    staffMembers: [
      { id: 'st1', providerId: '1', name: '小雅', title: '資深美甲師', photoUri: '', specialties: ['日式美甲', '暈染設計'], rating: 4.9, reviewCount: 156 },
      { id: 'st2', providerId: '1', name: '小芳', title: '美甲師', photoUri: '', specialties: ['韓式美甲', '法式美甲'], rating: 4.7, reviewCount: 82 },
    ],
    businessHours: {
      mon: { open: '10:00', close: '20:00' },
      tue: { open: '10:00', close: '20:00' },
      wed: { open: '10:00', close: '20:00' },
      thu: { open: '10:00', close: '20:00' },
      fri: { open: '10:00', close: '21:00' },
      sat: { open: '10:00', close: '21:00' },
      sun: { open: '11:00', close: '19:00' },
    },
  },
  {
    id: '2',
    name: 'MORI Hair Salon',
    category: 'hair',
    address: '台北市中山區南京東路一段86號2樓',
    city: '台北市',
    district: '中山區',
    phone: '02-2541-0002',
    rating: 4.7,
    reviewCount: 412,
    imageUri: '',
    description: '簡約風格髮廊，擅長韓系髮型設計與質感染髮。使用OLAPLEX護髮系統。',
    isVerified: true,
    services: [
      { id: 's5', providerId: '2', name: '剪髮', description: '含洗髮+造型吹整', category: 'hair', duration: 60, price: 800, isAvailable: true },
      { id: 's6', providerId: '2', name: '染髮', description: '全頭染髮（不含漂髮）', category: 'hair', duration: 120, price: 2500, isAvailable: true },
      { id: 's7', providerId: '2', name: '燙髮', description: '溫塑燙/冷燙+護髮', category: 'hair', duration: 150, price: 3000, isAvailable: true },
      { id: 's8', providerId: '2', name: '頭皮養護', description: '頭皮檢測+深層清潔+養護', category: 'hair', duration: 60, price: 1200, isAvailable: true },
    ],
    staffMembers: [
      { id: 'st3', providerId: '2', name: 'Ken', title: '總監', photoUri: '', specialties: ['韓系設計剪', '質感染髮'], rating: 4.8, reviewCount: 230 },
      { id: 'st4', providerId: '2', name: 'Yuki', title: '設計師', photoUri: '', specialties: ['日系燙髮', '漂髮設計'], rating: 4.6, reviewCount: 120 },
      { id: 'st5', providerId: '2', name: 'Mia', title: '設計師', photoUri: '', specialties: ['女生長髮', '護髮療程'], rating: 4.7, reviewCount: 62 },
    ],
    businessHours: {
      mon: null,
      tue: { open: '11:00', close: '20:00' },
      wed: { open: '11:00', close: '20:00' },
      thu: { open: '11:00', close: '20:00' },
      fri: { open: '11:00', close: '21:00' },
      sat: { open: '10:00', close: '21:00' },
      sun: { open: '10:00', close: '19:00' },
    },
  },
  {
    id: '3',
    name: '靜心養身會館',
    category: 'massage',
    address: '台北市松山區民生東路三段128號',
    city: '台北市',
    district: '松山區',
    phone: '02-2712-0003',
    rating: 4.8,
    reviewCount: 189,
    imageUri: '',
    description: '傳統與現代結合的養身按摩會館。提供泰式、精油、指壓等多種按摩服務。',
    isVerified: true,
    services: [
      { id: 's9', providerId: '3', name: '全身指壓', description: '傳統指壓手法，舒緩疲勞', category: 'massage', duration: 60, price: 1000, isAvailable: true },
      { id: 's10', providerId: '3', name: '精油SPA', description: '天然精油全身按摩+熱敷', category: 'massage', duration: 90, price: 1800, isAvailable: true },
      { id: 's11', providerId: '3', name: '泰式按摩', description: '正宗泰式拉筋按摩', category: 'massage', duration: 90, price: 1500, isAvailable: true },
      { id: 's12', providerId: '3', name: '肩頸放鬆', description: '針對肩頸痠痛加強調理', category: 'massage', duration: 30, price: 600, isAvailable: true },
    ],
    staffMembers: [
      { id: 'st6', providerId: '3', name: '陳師傅', title: '資深按摩師', photoUri: '', specialties: ['指壓', '推拿'], rating: 4.9, reviewCount: 95 },
      { id: 'st7', providerId: '3', name: 'Nisa', title: '泰式按摩師', photoUri: '', specialties: ['泰式按摩', '精油SPA'], rating: 4.8, reviewCount: 72 },
    ],
    businessHours: {
      mon: { open: '10:00', close: '22:00' },
      tue: { open: '10:00', close: '22:00' },
      wed: { open: '10:00', close: '22:00' },
      thu: { open: '10:00', close: '22:00' },
      fri: { open: '10:00', close: '23:00' },
      sat: { open: '10:00', close: '23:00' },
      sun: { open: '10:00', close: '21:00' },
    },
  },
  {
    id: '4',
    name: 'Lash Lab 睫毛實驗室',
    category: 'lash',
    address: '台中市西屯區文心路三段241號',
    city: '台中市',
    district: '西屯區',
    phone: '04-2312-0004',
    rating: 4.6,
    reviewCount: 97,
    imageUri: '',
    description: '專業美睫工作室，提供自然款到濃密款各式嫁接。使用韓國進口睫毛。',
    isVerified: true,
    services: [
      { id: 's13', providerId: '4', name: '自然款嫁接', description: '80根，自然素顏感', category: 'lash', duration: 75, price: 1000, isAvailable: true },
      { id: 's14', providerId: '4', name: '濃密款嫁接', description: '120根，濃密有神', category: 'lash', duration: 90, price: 1500, isAvailable: true },
      { id: 's15', providerId: '4', name: '睫毛補款', description: '兩週內回補', category: 'lash', duration: 45, price: 500, isAvailable: true },
    ],
    staffMembers: [
      { id: 'st8', providerId: '4', name: '小璇', title: '美睫師', photoUri: '', specialties: ['自然嫁接', '山茶花睫毛'], rating: 4.6, reviewCount: 97 },
    ],
    businessHours: {
      mon: { open: '10:00', close: '19:00' },
      tue: { open: '10:00', close: '19:00' },
      wed: null,
      thu: { open: '10:00', close: '19:00' },
      fri: { open: '10:00', close: '19:00' },
      sat: { open: '09:00', close: '18:00' },
      sun: { open: '09:00', close: '18:00' },
    },
  },
  {
    id: '5',
    name: '沐光 SPA',
    category: 'spa',
    address: '高雄市前鎮區中山二路260號',
    city: '高雄市',
    district: '前鎮區',
    phone: '07-3312-0005',
    rating: 4.5,
    reviewCount: 64,
    imageUri: '',
    description: '都市中的靜謐綠洲，提供臉部保養、身體護理等全方位SPA體驗。',
    isVerified: false,
    services: [
      { id: 's16', providerId: '5', name: '臉部深層保養', description: '清潔+導入+面膜', category: 'spa', duration: 75, price: 1800, isAvailable: true },
      { id: 's17', providerId: '5', name: '全身去角質', description: '磨砂去角質+保濕潤膚', category: 'spa', duration: 60, price: 1200, isAvailable: true },
      { id: 's18', providerId: '5', name: '岩盤浴+按摩', description: '岩盤浴30分+全身按摩60分', category: 'spa', duration: 90, price: 2500, isAvailable: true },
    ],
    staffMembers: [
      { id: 'st9', providerId: '5', name: '小薰', title: '美容師', photoUri: '', specialties: ['臉部護理', '精油按摩'], rating: 4.5, reviewCount: 40 },
      { id: 'st10', providerId: '5', name: '小婷', title: '美容師', photoUri: '', specialties: ['身體護理', '岩盤浴'], rating: 4.4, reviewCount: 24 },
    ],
    businessHours: {
      mon: { open: '11:00', close: '21:00' },
      tue: { open: '11:00', close: '21:00' },
      wed: { open: '11:00', close: '21:00' },
      thu: { open: '11:00', close: '21:00' },
      fri: { open: '11:00', close: '22:00' },
      sat: { open: '10:00', close: '22:00' },
      sun: null,
    },
  },
  {
    id: '6',
    name: '墨匠紋繡工作室',
    category: 'tattoo',
    address: '台北市信義區松仁路88號',
    city: '台北市',
    district: '信義區',
    phone: '02-2720-0006',
    rating: 4.9,
    reviewCount: 156,
    imageUri: '',
    description: '高端半永久紋繡工作室，專精霧眉、髮際線、美瞳線。一對一服務，預約制。',
    isVerified: true,
    services: [
      { id: 's19', providerId: '6', name: '韓式霧眉', description: '自然霧感眉型設計', category: 'tattoo', duration: 120, price: 8000, isAvailable: true },
      { id: 's20', providerId: '6', name: '美瞳線', description: '自然放大雙眼', category: 'tattoo', duration: 90, price: 6000, isAvailable: true },
      { id: 's21', providerId: '6', name: '髮際線修飾', description: '自然填補髮際線', category: 'tattoo', duration: 120, price: 12000, isAvailable: true },
    ],
    staffMembers: [
      { id: 'st11', providerId: '6', name: 'Emily', title: '紋繡總監', photoUri: '', specialties: ['霧眉', '美瞳線', '髮際線'], rating: 4.9, reviewCount: 156 },
    ],
    businessHours: {
      mon: { open: '10:00', close: '18:00' },
      tue: { open: '10:00', close: '18:00' },
      wed: { open: '10:00', close: '18:00' },
      thu: { open: '10:00', close: '18:00' },
      fri: { open: '10:00', close: '18:00' },
      sat: { open: '10:00', close: '17:00' },
      sun: null,
    },
  },
];

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', bookingId: 'b0', providerId: '1', providerName: 'Nail Room 指尖藝術', serviceName: '造型凝膠美甲', staffName: '小雅', rating: 5, comment: '超級滿意！小雅老師手很穩，花紋超精緻，下次還要再來。', createdAt: '2026-02-28T14:00:00Z' },
  { id: 'r2', bookingId: 'b0', providerId: '2', providerName: 'MORI Hair Salon', serviceName: '染髮', staffName: 'Ken', rating: 5, comment: '染出來的顏色很有質感，Ken老師會根據膚色推薦色系，很專業。', createdAt: '2026-02-25T10:00:00Z' },
  { id: 'r3', bookingId: 'b0', providerId: '3', providerName: '靜心養身會館', serviceName: '全身指壓', staffName: '陳師傅', rating: 4, comment: '力道剛好，按完整個人鬆了很多。環境安靜舒適。', createdAt: '2026-02-20T16:00:00Z' },
];

// ── Storage Keys ──
const STORAGE_KEYS = {
  bookings: 'beautybook_bookings',
  reviews: 'beautybook_reviews',
  role: 'beautybook_role',
};

// ── Context ──
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helpers
  getProvider: (id: string) => Provider | undefined;
  getFilteredProviders: () => Provider[];
  getAvailableSlots: (providerId: string, staffId: string, date: string) => TimeSlot[];
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  cancelBooking: (id: string) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// ── Provider Component ──
export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load persisted data
  useEffect(() => {
    (async () => {
      try {
        const [bookingsStr, reviewsStr, roleStr] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.bookings),
          AsyncStorage.getItem(STORAGE_KEYS.reviews),
          AsyncStorage.getItem(STORAGE_KEYS.role),
        ]);
        dispatch({
          type: 'LOAD_DATA',
          payload: {
            providers: MOCK_PROVIDERS,
            bookings: bookingsStr ? JSON.parse(bookingsStr) : [],
            reviews: reviewsStr ? JSON.parse(reviewsStr) : MOCK_REVIEWS,
            userRole: (roleStr as 'customer' | 'provider') || 'customer',
          },
        });
      } catch {
        dispatch({ type: 'LOAD_DATA', payload: { providers: MOCK_PROVIDERS, reviews: MOCK_REVIEWS } });
      }
    })();
  }, []);

  // Persist bookings
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEYS.bookings, JSON.stringify(state.bookings));
    }
  }, [state.bookings, state.isLoading]);

  // Persist reviews
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(state.reviews));
    }
  }, [state.reviews, state.isLoading]);

  // Persist role
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEYS.role, state.userRole);
    }
  }, [state.userRole, state.isLoading]);

  const getProvider = useCallback(
    (id: string) => state.providers.find((p) => p.id === id),
    [state.providers]
  );

  const getFilteredProviders = useCallback(() => {
    let result = state.providers;
    if (state.selectedCategory) {
      result = result.filter((p) => p.category === state.selectedCategory);
    }
    if (state.selectedCity) {
      result = result.filter((p) => p.city === state.selectedCity);
    }
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.services.some((s) => s.name.toLowerCase().includes(q)) ||
          p.staffMembers.some((s) => s.name.toLowerCase().includes(q))
      );
    }
    return result;
  }, [state.providers, state.selectedCategory, state.selectedCity, state.searchQuery]);

  const getAvailableSlots = useCallback(
    (providerId: string, staffId: string, date: string): TimeSlot[] => {
      const provider = state.providers.find((p) => p.id === providerId);
      if (!provider) return [];

      const staff = provider.staffMembers.find((s) => s.id === staffId);
      if (!staff) return [];

      const dayMap: Record<string, string> = {
        '0': 'sun', '1': 'mon', '2': 'tue', '3': 'wed',
        '4': 'thu', '5': 'fri', '6': 'sat',
      };
      const dayOfWeek = dayMap[new Date(date).getDay().toString()];
      const hours = provider.businessHours[dayOfWeek];
      if (!hours) return [];

      const bookedTimes = state.bookings
        .filter((b) => b.providerId === providerId && b.staffId === staffId && b.date === date && b.status !== 'cancelled')
        .map((b) => b.time);

      const slots: TimeSlot[] = [];
      const [openH, openM] = hours.open.split(':').map(Number);
      const [closeH, closeM] = hours.close.split(':').map(Number);
      let currentH = openH;
      let currentM = openM;

      while (currentH < closeH || (currentH === closeH && currentM < closeM)) {
        const timeStr = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`;
        slots.push({
          id: `${staffId}-${date}-${timeStr}`,
          staffId,
          staffName: staff.name,
          date,
          time: timeStr,
          isAvailable: !bookedTimes.includes(timeStr),
        });
        currentM += 30;
        if (currentM >= 60) {
          currentH += 1;
          currentM = 0;
        }
      }
      return slots;
    },
    [state.providers, state.bookings]
  );

  const createBooking = useCallback(
    (booking: Omit<Booking, 'id' | 'createdAt'>) => {
      const newBooking: Booking = {
        ...booking,
        id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_BOOKING', payload: newBooking });
    },
    []
  );

  const cancelBooking = useCallback((id: string) => {
    dispatch({ type: 'CANCEL_BOOKING', payload: id });
  }, []);

  const addReview = useCallback((review: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...review,
      id: `r-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_REVIEW', payload: newReview });
  }, []);

  return (
    <AppContext.Provider
      value={{ state, dispatch, getProvider, getFilteredProviders, getAvailableSlots, createBooking, cancelBooking, addReview }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider');
  return ctx;
}

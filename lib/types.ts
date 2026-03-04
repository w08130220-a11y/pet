// === Beauty Booking App Types ===

export type ServiceCategory = 'nail' | 'hair' | 'massage' | 'lash' | 'spa' | 'tattoo';

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  nail: '美甲',
  hair: '美髮',
  massage: '按摩',
  lash: '美睫',
  spa: 'SPA',
  tattoo: '紋繡',
};

export const SERVICE_CATEGORY_ICONS: Record<ServiceCategory, string> = {
  nail: '💅',
  hair: '💇',
  massage: '💆',
  lash: '👁',
  spa: '🧖',
  tattoo: '✨',
};

export interface Provider {
  id: string;
  name: string;
  category: ServiceCategory;
  address: string;
  city: string;
  district: string;
  phone: string;
  rating: number;
  reviewCount: number;
  imageUri: string;
  description: string;
  isVerified: boolean;
  services: Service[];
  staffMembers: StaffMember[];
  businessHours: BusinessHours;
  photos: string[];
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  category: ServiceCategory;
  duration: number;
  price: number;
  isAvailable: boolean;
}

export interface StaffMember {
  id: string;
  providerId: string;
  name: string;
  title: string;
  photoUri: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
}

export interface BusinessHours {
  [day: string]: { open: string; close: string } | null;
}

export interface TimeSlot {
  id: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  isAvailable: boolean;
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'provider_cancelled';

export interface Booking {
  id: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  status: BookingStatus;
  note: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  staffName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: '待確認',
  confirmed: '已確認',
  completed: '已完成',
  cancelled: '已取消',
  provider_cancelled: '商家取消',
};

export const CITIES = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
  '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣',
];

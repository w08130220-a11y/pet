export interface Stylist {
  id: string;
  name: string;
  avatar: string;
  salon: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  distance?: string;
}

export interface Service {
  id: string;
  name: string;
  category: 'haircut' | 'coloring' | 'treatment' | 'nails' | 'lashes' | 'facial';
  price: number;
  duration: number;
  description: string;
}

export interface Booking {
  id: string;
  stylistId: string;
  stylistName: string;
  serviceName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  note?: string;
  rating?: number;
}

export interface PortfolioItem {
  id: string;
  stylistId: string;
  stylistName: string;
  imageUri: string;
  category: string;
  caption: string;
  likes: number;
  liked: boolean;
}

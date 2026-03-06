export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  birthDate: string;
  weight: number;
  photoUri: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  petId: string;
  petName: string;
  imageUri: string;
  caption: string;
  likes: number;
  comments: number;
  liked: boolean;
  createdAt: string;
}

export interface MealRecord {
  id: string;
  petId: string;
  foodType: string;
  amount: number;
  calories: number;
  mealTime: string;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  type: 'vaccine' | 'checkup' | 'treatment' | 'other';
  title: string;
  description: string;
  date: string;
  nextDueDate?: string;
  veterinarian?: string;
  createdAt: string;
}

export interface Scene {
  id: string;
  name: string;
  emoji: string;
}

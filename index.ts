// Pet types
export type PetSpecies = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: string;
  weight: number; // kg
  photoUri: string;
  createdAt: string;
}

// Post types
export interface Post {
  id: string;
  petId: string;
  petName: string;
  petPhotoUri: string;
  imageUri: string;
  caption: string;
  likes: number;
  isLiked: boolean;
  comments: number;
  createdAt: string;
}

// Meal types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealRecord {
  id: string;
  petId: string;
  foodType: string;
  amount: number; // grams
  calories: number;
  mealType: MealType;
  mealTime: string;
  createdAt: string;
}

// Medical types
export type MedicalRecordType = 'vaccine' | 'checkup' | 'treatment' | 'other';

export interface MedicalRecord {
  id: string;
  petId: string;
  type: MedicalRecordType;
  title: string;
  description: string;
  date: string;
  nextDueDate?: string;
  veterinarian?: string;
  createdAt: string;
}

// Scene types for Pet World
export type SceneType = 'park' | 'living-room' | 'beach' | 'forest';

export interface Scene {
  id: SceneType;
  name: string;
  backgroundImage: any;
}

// Pet animation states
export type PetAnimationState = 'idle' | 'walk' | 'sit' | 'sleep' | 'play' | 'eat';

// AI Health suggestion
export interface HealthSuggestion {
  dailyCalories: number;
  currentCalories: number;
  exerciseMinutes: number;
  suggestions: string[];
}

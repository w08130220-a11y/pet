import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, Post, MealRecord, MedicalRecord, HealthSuggestion } from '@/types';

// Storage keys
const STORAGE_KEYS = {
  PETS: 'petlife_pets',
  POSTS: 'petlife_posts',
  MEALS: 'petlife_meals',
  MEDICAL: 'petlife_medical',
};

// State interface
interface PetStoreState {
  pets: Pet[];
  posts: Post[];
  meals: MealRecord[];
  medicalRecords: MedicalRecord[];
  isLoading: boolean;
}

// Action types
type PetStoreAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOAD_DATA'; payload: Partial<PetStoreState> }
  | { type: 'ADD_PET'; payload: Pet }
  | { type: 'UPDATE_PET'; payload: Pet }
  | { type: 'DELETE_PET'; payload: string }
  | { type: 'ADD_POST'; payload: Post }
  | { type: 'TOGGLE_LIKE'; payload: string }
  | { type: 'DELETE_POST'; payload: string }
  | { type: 'ADD_MEAL'; payload: MealRecord }
  | { type: 'DELETE_MEAL'; payload: string }
  | { type: 'ADD_MEDICAL'; payload: MedicalRecord }
  | { type: 'UPDATE_MEDICAL'; payload: MedicalRecord }
  | { type: 'DELETE_MEDICAL'; payload: string };

// Initial state
const initialState: PetStoreState = {
  pets: [],
  posts: [],
  meals: [],
  medicalRecords: [],
  isLoading: true,
};

// Reducer
function petStoreReducer(state: PetStoreState, action: PetStoreAction): PetStoreState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOAD_DATA':
      return { ...state, ...action.payload, isLoading: false };
    case 'ADD_PET':
      return { ...state, pets: [...state.pets, action.payload] };
    case 'UPDATE_PET':
      return {
        ...state,
        pets: state.pets.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PET':
      return {
        ...state,
        pets: state.pets.filter(p => p.id !== action.payload),
        posts: state.posts.filter(p => p.petId !== action.payload),
        meals: state.meals.filter(m => m.petId !== action.payload),
        medicalRecords: state.medicalRecords.filter(m => m.petId !== action.payload),
      };
    case 'ADD_POST':
      return { ...state, posts: [action.payload, ...state.posts] };
    case 'TOGGLE_LIKE':
      return {
        ...state,
        posts: state.posts.map(p =>
          p.id === action.payload
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        ),
      };
    case 'DELETE_POST':
      return { ...state, posts: state.posts.filter(p => p.id !== action.payload) };
    case 'ADD_MEAL':
      return { ...state, meals: [action.payload, ...state.meals] };
    case 'DELETE_MEAL':
      return { ...state, meals: state.meals.filter(m => m.id !== action.payload) };
    case 'ADD_MEDICAL':
      return { ...state, medicalRecords: [action.payload, ...state.medicalRecords] };
    case 'UPDATE_MEDICAL':
      return {
        ...state,
        medicalRecords: state.medicalRecords.map(m =>
          m.id === action.payload.id ? action.payload : m
        ),
      };
    case 'DELETE_MEDICAL':
      return { ...state, medicalRecords: state.medicalRecords.filter(m => m.id !== action.payload) };
    default:
      return state;
  }
}

// Context
interface PetStoreContextType {
  state: PetStoreState;
  addPet: (pet: Omit<Pet, 'id' | 'createdAt'>) => Promise<Pet>;
  updatePet: (pet: Pet) => Promise<void>;
  deletePet: (id: string) => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'comments'>) => Promise<Post>;
  toggleLike: (postId: string) => void;
  deletePost: (id: string) => Promise<void>;
  addMeal: (meal: Omit<MealRecord, 'id' | 'createdAt'>) => Promise<MealRecord>;
  deleteMeal: (id: string) => Promise<void>;
  addMedicalRecord: (record: Omit<MedicalRecord, 'id' | 'createdAt'>) => Promise<MedicalRecord>;
  updateMedicalRecord: (record: MedicalRecord) => Promise<void>;
  deleteMedicalRecord: (id: string) => Promise<void>;
  getHealthSuggestion: (petId: string) => HealthSuggestion;
  getPetById: (id: string) => Pet | undefined;
  getMealsByPetId: (petId: string) => MealRecord[];
  getMedicalByPetId: (petId: string) => MedicalRecord[];
  getTodayMeals: (petId: string) => MealRecord[];
}

const PetStoreContext = createContext<PetStoreContextType | null>(null);

// Generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Provider component
export function PetStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(petStoreReducer, initialState);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever state changes
  useEffect(() => {
    if (!state.isLoading) {
      saveData();
    }
  }, [state.pets, state.posts, state.meals, state.medicalRecords]);

  async function loadData() {
    try {
      const [petsJson, postsJson, mealsJson, medicalJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.PETS),
        AsyncStorage.getItem(STORAGE_KEYS.POSTS),
        AsyncStorage.getItem(STORAGE_KEYS.MEALS),
        AsyncStorage.getItem(STORAGE_KEYS.MEDICAL),
      ]);

      dispatch({
        type: 'LOAD_DATA',
        payload: {
          pets: petsJson ? JSON.parse(petsJson) : [],
          posts: postsJson ? JSON.parse(postsJson) : [],
          meals: mealsJson ? JSON.parse(mealsJson) : [],
          medicalRecords: medicalJson ? JSON.parse(medicalJson) : [],
        },
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function saveData() {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.PETS, JSON.stringify(state.pets)),
        AsyncStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(state.posts)),
        AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(state.meals)),
        AsyncStorage.setItem(STORAGE_KEYS.MEDICAL, JSON.stringify(state.medicalRecords)),
      ]);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  // Pet actions
  async function addPet(petData: Omit<Pet, 'id' | 'createdAt'>): Promise<Pet> {
    const pet: Pet = {
      ...petData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_PET', payload: pet });
    return pet;
  }

  async function updatePet(pet: Pet): Promise<void> {
    dispatch({ type: 'UPDATE_PET', payload: pet });
  }

  async function deletePet(id: string): Promise<void> {
    dispatch({ type: 'DELETE_PET', payload: id });
  }

  // Post actions
  async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'comments'>): Promise<Post> {
    const post: Post = {
      ...postData,
      id: generateId(),
      likes: 0,
      isLiked: false,
      comments: 0,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_POST', payload: post });
    return post;
  }

  function toggleLike(postId: string): void {
    dispatch({ type: 'TOGGLE_LIKE', payload: postId });
  }

  async function deletePost(id: string): Promise<void> {
    dispatch({ type: 'DELETE_POST', payload: id });
  }

  // Meal actions
  async function addMeal(mealData: Omit<MealRecord, 'id' | 'createdAt'>): Promise<MealRecord> {
    const meal: MealRecord = {
      ...mealData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MEAL', payload: meal });
    return meal;
  }

  async function deleteMeal(id: string): Promise<void> {
    dispatch({ type: 'DELETE_MEAL', payload: id });
  }

  // Medical actions
  async function addMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt'>): Promise<MedicalRecord> {
    const record: MedicalRecord = {
      ...recordData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MEDICAL', payload: record });
    return record;
  }

  async function updateMedicalRecord(record: MedicalRecord): Promise<void> {
    dispatch({ type: 'UPDATE_MEDICAL', payload: record });
  }

  async function deleteMedicalRecord(id: string): Promise<void> {
    dispatch({ type: 'DELETE_MEDICAL', payload: id });
  }

  // Helper functions
  function getPetById(id: string): Pet | undefined {
    return state.pets.find(p => p.id === id);
  }

  function getMealsByPetId(petId: string): MealRecord[] {
    return state.meals.filter(m => m.petId === petId);
  }

  function getMedicalByPetId(petId: string): MedicalRecord[] {
    return state.medicalRecords.filter(m => m.petId === petId);
  }

  function getTodayMeals(petId: string): MealRecord[] {
    const today = new Date().toDateString();
    return state.meals.filter(m => 
      m.petId === petId && new Date(m.mealTime).toDateString() === today
    );
  }

  // AI Health suggestion calculator
  function getHealthSuggestion(petId: string): HealthSuggestion {
    const pet = getPetById(petId);
    const todayMeals = getTodayMeals(petId);
    
    if (!pet) {
      return {
        dailyCalories: 0,
        currentCalories: 0,
        exerciseMinutes: 0,
        suggestions: ['請先新增寵物資料'],
      };
    }

    // Calculate daily calorie needs based on pet weight and species
    // Using simplified RER (Resting Energy Requirement) formula
    const weight = pet.weight;
    let dailyCalories = 0;
    let exerciseMinutes = 30;

    switch (pet.species) {
      case 'dog':
        // Dogs: 30 * weight + 70 for maintenance
        dailyCalories = Math.round(30 * weight + 70);
        exerciseMinutes = weight < 10 ? 30 : weight < 25 ? 45 : 60;
        break;
      case 'cat':
        // Cats: 40 * weight for adult cats
        dailyCalories = Math.round(40 * weight);
        exerciseMinutes = 20;
        break;
      case 'bird':
        dailyCalories = Math.round(weight * 200);
        exerciseMinutes = 15;
        break;
      case 'rabbit':
        dailyCalories = Math.round(weight * 50);
        exerciseMinutes = 30;
        break;
      default:
        dailyCalories = Math.round(30 * weight + 70);
        exerciseMinutes = 30;
    }

    const currentCalories = todayMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const caloriePercentage = (currentCalories / dailyCalories) * 100;

    const suggestions: string[] = [];

    if (caloriePercentage < 50) {
      suggestions.push(`${pet.name} 今日攝取熱量偏低，建議增加餵食量`);
    } else if (caloriePercentage >= 50 && caloriePercentage < 80) {
      suggestions.push(`${pet.name} 進食狀況良好，請繼續保持`);
    } else if (caloriePercentage >= 80 && caloriePercentage <= 100) {
      suggestions.push(`${pet.name} 今日攝取接近目標，注意不要過量餵食`);
    } else {
      suggestions.push(`${pet.name} 今日攝取已超標，建議增加運動量`);
      exerciseMinutes += 15;
    }

    suggestions.push(`建議每日運動時間：${exerciseMinutes} 分鐘`);

    if (pet.species === 'dog') {
      suggestions.push('狗狗需要規律的散步和戶外活動');
    } else if (pet.species === 'cat') {
      suggestions.push('貓咪適合短時間高強度的遊戲互動');
    }

    return {
      dailyCalories,
      currentCalories,
      exerciseMinutes,
      suggestions,
    };
  }

  const value: PetStoreContextType = {
    state,
    addPet,
    updatePet,
    deletePet,
    addPost,
    toggleLike,
    deletePost,
    addMeal,
    deleteMeal,
    addMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getHealthSuggestion,
    getPetById,
    getMealsByPetId,
    getMedicalByPetId,
    getTodayMeals,
  };

  return (
    <PetStoreContext.Provider value={value}>
      {children}
    </PetStoreContext.Provider>
  );
}

// Hook to use the store
export function usePetStore(): PetStoreContextType {
  const context = useContext(PetStoreContext);
  if (!context) {
    throw new Error('usePetStore must be used within a PetStoreProvider');
  }
  return context;
}

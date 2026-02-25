import { describe, it, expect, beforeEach } from 'vitest';

// Test data types
interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed: string;
  birthDate: string;
  weight: number;
  photoUri: string;
  createdAt: string;
}

interface MealRecord {
  id: string;
  petId: string;
  foodType: string;
  amount: number;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  mealTime: string;
  createdAt: string;
}

interface MedicalRecord {
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

// Helper function to generate unique ID
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Health suggestion calculator (same logic as in pet-store.tsx)
function calculateHealthSuggestion(pet: Pet, todayMeals: MealRecord[]) {
  const weight = pet.weight;
  let dailyCalories = 0;
  let exerciseMinutes = 30;

  switch (pet.species) {
    case 'dog':
      dailyCalories = Math.round(30 * weight + 70);
      exerciseMinutes = weight < 10 ? 30 : weight < 25 ? 45 : 60;
      break;
    case 'cat':
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

  return {
    dailyCalories,
    currentCalories,
    exerciseMinutes,
  };
}

describe('Pet Data Model', () => {
  it('should create a valid pet object', () => {
    const pet: Pet = {
      id: generateId(),
      name: '小黃',
      species: 'dog',
      breed: '柴犬',
      birthDate: '2022-01-15',
      weight: 10,
      photoUri: '',
      createdAt: new Date().toISOString(),
    };

    expect(pet.name).toBe('小黃');
    expect(pet.species).toBe('dog');
    expect(pet.weight).toBe(10);
    expect(pet.id).toBeTruthy();
  });

  it('should support different pet species', () => {
    const species: Pet['species'][] = ['dog', 'cat', 'bird', 'rabbit', 'other'];
    
    species.forEach((s) => {
      const pet: Pet = {
        id: generateId(),
        name: 'Test Pet',
        species: s,
        breed: '',
        birthDate: '',
        weight: 5,
        photoUri: '',
        createdAt: new Date().toISOString(),
      };
      expect(pet.species).toBe(s);
    });
  });
});

describe('Health Suggestion Calculator', () => {
  it('should calculate correct daily calories for dogs', () => {
    const dog: Pet = {
      id: '1',
      name: 'Dog',
      species: 'dog',
      breed: '',
      birthDate: '',
      weight: 10,
      photoUri: '',
      createdAt: '',
    };

    const suggestion = calculateHealthSuggestion(dog, []);
    // Formula: 30 * weight + 70 = 30 * 10 + 70 = 370
    expect(suggestion.dailyCalories).toBe(370);
    expect(suggestion.exerciseMinutes).toBe(45); // weight = 10, so weight < 10 is false, weight < 25 is true, so 45 minutes
  });

  it('should calculate correct daily calories for cats', () => {
    const cat: Pet = {
      id: '2',
      name: 'Cat',
      species: 'cat',
      breed: '',
      birthDate: '',
      weight: 5,
      photoUri: '',
      createdAt: '',
    };

    const suggestion = calculateHealthSuggestion(cat, []);
    // Formula: 40 * weight = 40 * 5 = 200
    expect(suggestion.dailyCalories).toBe(200);
    expect(suggestion.exerciseMinutes).toBe(20);
  });

  it('should sum up current calories from meals', () => {
    const pet: Pet = {
      id: '1',
      name: 'Pet',
      species: 'dog',
      breed: '',
      birthDate: '',
      weight: 10,
      photoUri: '',
      createdAt: '',
    };

    const meals: MealRecord[] = [
      {
        id: '1',
        petId: '1',
        foodType: '乾糧',
        amount: 100,
        calories: 150,
        mealType: 'breakfast',
        mealTime: new Date().toISOString(),
        createdAt: '',
      },
      {
        id: '2',
        petId: '1',
        foodType: '罐頭',
        amount: 50,
        calories: 80,
        mealType: 'lunch',
        mealTime: new Date().toISOString(),
        createdAt: '',
      },
    ];

    const suggestion = calculateHealthSuggestion(pet, meals);
    expect(suggestion.currentCalories).toBe(230); // 150 + 80
  });

  it('should adjust exercise time based on dog weight', () => {
    const smallDog: Pet = {
      id: '1',
      name: 'Small Dog',
      species: 'dog',
      breed: '',
      birthDate: '',
      weight: 5,
      photoUri: '',
      createdAt: '',
    };

    const mediumDog: Pet = {
      id: '2',
      name: 'Medium Dog',
      species: 'dog',
      breed: '',
      birthDate: '',
      weight: 15,
      photoUri: '',
      createdAt: '',
    };

    const largeDog: Pet = {
      id: '3',
      name: 'Large Dog',
      species: 'dog',
      breed: '',
      birthDate: '',
      weight: 30,
      photoUri: '',
      createdAt: '',
    };

    expect(calculateHealthSuggestion(smallDog, []).exerciseMinutes).toBe(30);
    expect(calculateHealthSuggestion(mediumDog, []).exerciseMinutes).toBe(45);
    expect(calculateHealthSuggestion(largeDog, []).exerciseMinutes).toBe(60);
  });
});

describe('Medical Record', () => {
  it('should create a valid medical record', () => {
    const record: MedicalRecord = {
      id: generateId(),
      petId: '1',
      type: 'vaccine',
      title: '狂犬病疫苗',
      description: '年度預防針',
      date: '2024-01-15',
      nextDueDate: '2025-01-15',
      veterinarian: '王醫師',
      createdAt: new Date().toISOString(),
    };

    expect(record.type).toBe('vaccine');
    expect(record.title).toBe('狂犬病疫苗');
    expect(record.nextDueDate).toBe('2025-01-15');
  });

  it('should support different record types', () => {
    const types: MedicalRecord['type'][] = ['vaccine', 'checkup', 'treatment', 'other'];
    
    types.forEach((t) => {
      const record: MedicalRecord = {
        id: generateId(),
        petId: '1',
        type: t,
        title: 'Test',
        description: '',
        date: '2024-01-01',
        createdAt: '',
      };
      expect(record.type).toBe(t);
    });
  });
});

describe('Meal Record', () => {
  it('should create a valid meal record', () => {
    const meal: MealRecord = {
      id: generateId(),
      petId: '1',
      foodType: '乾糧',
      amount: 100,
      calories: 350,
      mealType: 'breakfast',
      mealTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    expect(meal.foodType).toBe('乾糧');
    expect(meal.amount).toBe(100);
    expect(meal.calories).toBe(350);
    expect(meal.mealType).toBe('breakfast');
  });

  it('should support different meal types', () => {
    const mealTypes: MealRecord['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];
    
    mealTypes.forEach((mt) => {
      const meal: MealRecord = {
        id: generateId(),
        petId: '1',
        foodType: 'Test',
        amount: 50,
        calories: 100,
        mealType: mt,
        mealTime: '',
        createdAt: '',
      };
      expect(meal.mealType).toBe(mt);
    });
  });
});

describe('ID Generation', () => {
  it('should generate unique IDs', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateId());
    }
    expect(ids.size).toBe(100);
  });
});

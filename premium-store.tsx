import React, { createContext, useContext, useReducer, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@petlife_premium";

interface PremiumState {
  isPremium: boolean;
  purchaseDate: string | null;
  expiryDate: string | null;
}

type PremiumAction =
  | { type: "SET_PREMIUM"; payload: boolean }
  | { type: "LOAD_STATE"; payload: PremiumState }
  | { type: "PURCHASE"; payload: { purchaseDate: string; expiryDate: string } }
  | { type: "CANCEL" };

const initialState: PremiumState = {
  isPremium: false,
  purchaseDate: null,
  expiryDate: null,
};

function premiumReducer(state: PremiumState, action: PremiumAction): PremiumState {
  switch (action.type) {
    case "SET_PREMIUM":
      return { ...state, isPremium: action.payload };
    case "LOAD_STATE":
      return action.payload;
    case "PURCHASE":
      return {
        isPremium: true,
        purchaseDate: action.payload.purchaseDate,
        expiryDate: action.payload.expiryDate,
      };
    case "CANCEL":
      return initialState;
    default:
      return state;
  }
}

interface PremiumContextType {
  state: PremiumState;
  activatePremium: () => Promise<void>;
  deactivatePremium: () => Promise<void>;
  checkPremiumStatus: () => boolean;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(premiumReducer, initialState);

  // Load state from storage on mount
  useEffect(() => {
    loadState();
  }, []);

  // Save state to storage whenever it changes
  useEffect(() => {
    saveState();
  }, [state]);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PremiumState;
        
        // Check if premium has expired
        if (parsed.expiryDate) {
          const expiry = new Date(parsed.expiryDate);
          if (expiry < new Date()) {
            // Premium expired
            dispatch({ type: "CANCEL" });
            return;
          }
        }
        
        dispatch({ type: "LOAD_STATE", payload: parsed });
      }
    } catch (error) {
      console.error("Failed to load premium state:", error);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save premium state:", error);
    }
  };

  const activatePremium = async () => {
    // In a real app, this would integrate with payment processing
    // For demo purposes, we'll just activate premium for 30 days
    const now = new Date();
    const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    dispatch({
      type: "PURCHASE",
      payload: {
        purchaseDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
      },
    });
  };

  const deactivatePremium = async () => {
    dispatch({ type: "CANCEL" });
  };

  const checkPremiumStatus = (): boolean => {
    if (!state.isPremium) return false;
    
    if (state.expiryDate) {
      const expiry = new Date(state.expiryDate);
      if (expiry < new Date()) {
        // Premium expired
        dispatch({ type: "CANCEL" });
        return false;
      }
    }
    
    return true;
  };

  return (
    <PremiumContext.Provider
      value={{
        state,
        activatePremium,
        deactivatePremium,
        checkPremiumStatus,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}

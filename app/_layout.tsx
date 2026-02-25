import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { PetStoreProvider } from "@/lib/pet-store";
import { PremiumProvider } from "@/lib/premium-store";
import { trpc, getTRPCClient } from "@/lib/trpc";

import "../global.css";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();
const trpcClient = getTRPCClient();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <PetStoreProvider>
            <PremiumProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="add-pet"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="create-post"
                  options={{ presentation: "modal" }}
                />
                <Stack.Screen
                  name="meal-log"
                  options={{ presentation: "modal" }}
                />
              </Stack>
              <StatusBar style="auto" />
            </PremiumProvider>
          </PetStoreProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

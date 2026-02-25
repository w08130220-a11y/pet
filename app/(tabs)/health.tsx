import { Text, View, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { useColors } from "@/hooks/use-colors";
import { Pet, MealRecord } from "@/types";

function CalorieRing({ current, target }: { current: number; target: number }) {
  const colors = useColors();
  const percentage = Math.min((current / target) * 100, 100);
  const isOver = current > target;

  return (
    <View className="items-center justify-center w-40 h-40">
      {/* Background circle */}
      <View
        className="absolute w-36 h-36 rounded-full border-8"
        style={{ borderColor: colors.border }}
      />
      {/* Progress indicator (simplified visual) */}
      <View
        className="absolute w-36 h-36 rounded-full border-8"
        style={{
          borderColor: isOver ? colors.error : colors.primary,
          borderTopColor: "transparent",
          borderRightColor: percentage > 25 ? (isOver ? colors.error : colors.primary) : "transparent",
          borderBottomColor: percentage > 50 ? (isOver ? colors.error : colors.primary) : "transparent",
          borderLeftColor: percentage > 75 ? (isOver ? colors.error : colors.primary) : "transparent",
          transform: [{ rotate: "-45deg" }],
        }}
      />
      {/* Center content */}
      <View className="items-center">
        <Text className="text-3xl font-bold text-foreground">{current}</Text>
        <Text className="text-muted text-sm">/ {target} kcal</Text>
      </View>
    </View>
  );
}

function MealItem({ meal, onDelete }: { meal: MealRecord; onDelete: (id: string) => void }) {
  const colors = useColors();
  const time = new Date(meal.mealTime).toLocaleTimeString("zh-TW", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const mealTypeLabels: Record<string, string> = {
    breakfast: "早餐",
    lunch: "午餐",
    dinner: "晚餐",
    snack: "點心",
  };

  return (
    <View className="flex-row items-center bg-surface rounded-xl p-3 mb-2 border border-border">
      <View className="w-10 h-10 rounded-full bg-secondary/20 items-center justify-center">
        <IconSymbol name="fork.knife" size={20} color={colors.secondary} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-foreground font-medium">{meal.foodType}</Text>
        <Text className="text-muted text-sm">
          {mealTypeLabels[meal.mealType] || meal.mealType} · {meal.amount}g · {time}
        </Text>
      </View>
      <Text className="text-primary font-semibold">{meal.calories} kcal</Text>
    </View>
  );
}

function PetSelector({
  pets,
  selectedId,
  onSelect,
}: {
  pets: Pet[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const colors = useColors();

  if (pets.length <= 1) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
      <View className="flex-row gap-2 px-4">
        {pets.map((pet) => (
          <TouchableOpacity
            key={pet.id}
            onPress={() => onSelect(pet.id)}
            className={`flex-row items-center px-3 py-2 rounded-full ${
              selectedId === pet.id ? "bg-primary" : "bg-surface border border-border"
            }`}
            activeOpacity={0.7}
          >
            <View className="w-6 h-6 rounded-full overflow-hidden mr-2">
              {pet.photoUri ? (
                <Image source={{ uri: pet.photoUri }} style={{ width: 24, height: 24 }} />
              ) : (
                <View className="w-full h-full bg-primary/20 items-center justify-center">
                  <IconSymbol name="pawprint.fill" size={12} color={colors.primary} />
                </View>
              )}
            </View>
            <Text
              className={`font-medium ${
                selectedId === pet.id ? "text-white" : "text-foreground"
              }`}
            >
              {pet.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function EmptyState() {
  const colors = useColors();

  return (
    <View className="flex-1 items-center justify-center py-10">
      <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
        <IconSymbol name="heart.fill" size={40} color={colors.primary} />
      </View>
      <Text className="text-foreground text-xl font-bold mb-2">開始追蹤健康</Text>
      <Text className="text-muted text-center px-8">
        請先在「我的」頁面新增您的寵物，即可開始記錄飲食與健康狀況
      </Text>
    </View>
  );
}

export default function HealthScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, getHealthSuggestion, getTodayMeals, deleteMeal } = usePetStore();
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    state.pets.length > 0 ? state.pets[0].id : null
  );

  const selectedPet = state.pets.find((p) => p.id === selectedPetId);
  const todayMeals = selectedPetId ? getTodayMeals(selectedPetId) : [];
  const healthSuggestion = selectedPetId ? getHealthSuggestion(selectedPetId) : null;

  const handleAddMeal = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    if (selectedPetId) {
      router.push(`/meal-log?petId=${selectedPetId}` as any);
    }
  };

  if (state.pets.length === 0) {
    return (
      <ScreenContainer>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">健康追蹤</Text>
        </View>
        <EmptyState />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">健康追蹤</Text>
        <TouchableOpacity onPress={handleAddMeal} activeOpacity={0.7}>
          <IconSymbol name="plus.circle.fill" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Selector */}
        <View className="pt-4">
          <PetSelector
            pets={state.pets}
            selectedId={selectedPetId}
            onSelect={setSelectedPetId}
          />
        </View>

        {/* Calorie Summary */}
        {healthSuggestion && (
          <View className="items-center py-4">
            <CalorieRing
              current={healthSuggestion.currentCalories}
              target={healthSuggestion.dailyCalories}
            />
            <Text className="text-muted mt-2">今日熱量攝取</Text>
          </View>
        )}

        {/* AI Suggestions */}
        {healthSuggestion && (
          <View className="mx-4 mb-4 bg-secondary/10 rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <IconSymbol name="info.circle" size={20} color={colors.secondary} />
              <Text className="text-foreground font-semibold ml-2">AI 健康建議</Text>
            </View>
            {healthSuggestion.suggestions.map((suggestion, index) => (
              <Text key={index} className="text-foreground mb-1">
                • {suggestion}
              </Text>
            ))}
          </View>
        )}

        {/* Today's Meals */}
        <View className="px-4 pb-4">
          <Text className="text-foreground font-semibold text-lg mb-3">今日飲食紀錄</Text>
          {todayMeals.length === 0 ? (
            <View className="bg-surface rounded-xl p-6 items-center border border-border">
              <Text className="text-muted">尚無今日飲食紀錄</Text>
              <TouchableOpacity
                onPress={handleAddMeal}
                className="mt-3 bg-primary px-4 py-2 rounded-full"
                activeOpacity={0.8}
              >
                <Text className="text-white font-medium">新增紀錄</Text>
              </TouchableOpacity>
            </View>
          ) : (
            todayMeals.map((meal) => (
              <MealItem key={meal.id} meal={meal} onDelete={deleteMeal} />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

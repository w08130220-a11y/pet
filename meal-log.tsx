import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform as RNPlatform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { useColors } from "@/hooks/use-colors";
import { MealType } from "@/types";

const MEAL_TYPES: { value: MealType; label: string; icon: string }[] = [
  { value: "breakfast", label: "早餐", icon: "🌅" },
  { value: "lunch", label: "午餐", icon: "☀️" },
  { value: "dinner", label: "晚餐", icon: "🌙" },
  { value: "snack", label: "點心", icon: "🍪" },
];

const COMMON_FOODS = [
  { name: "乾糧", calories: 350 },
  { name: "罐頭", calories: 100 },
  { name: "鮮食", calories: 150 },
  { name: "零食", calories: 50 },
  { name: "肉類", calories: 200 },
  { name: "蔬菜", calories: 30 },
];

export default function MealLogScreen() {
  const router = useRouter();
  const colors = useColors();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { addMeal, getPetById } = usePetStore();

  const pet = petId ? getPetById(petId) : null;

  const [foodType, setFoodType] = useState("");
  const [amount, setAmount] = useState("");
  const [mealType, setMealType] = useState<MealType>("breakfast");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate calories based on food type and amount
  const calculateCalories = (): number => {
    const commonFood = COMMON_FOODS.find((f) => f.name === foodType);
    const amountNum = parseFloat(amount) || 0;
    if (commonFood) {
      // Calories per 100g
      return Math.round((commonFood.calories * amountNum) / 100);
    }
    // Default: 3 calories per gram
    return Math.round(amountNum * 3);
  };

  const handleSubmit = async () => {
    if (!foodType.trim()) {
      Alert.alert("請輸入食物類型");
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert("請輸入有效的份量");
      return;
    }

    if (!petId) {
      Alert.alert("錯誤", "未選擇寵物");
      return;
    }

    setIsSubmitting(true);

    try {
      await addMeal({
        petId,
        foodType: foodType.trim(),
        amount: parseFloat(amount),
        calories: calculateCalories(),
        mealType,
        mealTime: new Date().toISOString(),
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      Alert.alert("錯誤", "新增失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectCommonFood = (food: { name: string; calories: number }) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setFoodType(food.name);
  };

  if (!pet) {
    return (
      <ScreenContainer edges={["top", "left", "right", "bottom"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-foreground">找不到寵物資料</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-primary px-4 py-2 rounded-full"
          >
            <Text className="text-white">返回</Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={RNPlatform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <IconSymbol name="xmark" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">記錄飲食</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Text className={`font-semibold ${isSubmitting ? "text-muted" : "text-primary"}`}>
              {isSubmitting ? "儲存中..." : "儲存"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Pet Info */}
          <View className="bg-surface mx-4 mt-4 rounded-xl p-4 flex-row items-center border border-border">
            <View className="w-12 h-12 rounded-full bg-primary/20 items-center justify-center">
              <IconSymbol name="pawprint.fill" size={24} color={colors.primary} />
            </View>
            <View className="ml-3">
              <Text className="text-foreground font-semibold">{pet.name}</Text>
              <Text className="text-muted text-sm">記錄飲食</Text>
            </View>
          </View>

          {/* Meal Type */}
          <View className="px-4 mt-6">
            <Text className="text-foreground font-medium mb-3">餐別</Text>
            <View className="flex-row flex-wrap gap-2">
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setMealType(type.value)}
                  className={`px-4 py-2 rounded-full ${
                    mealType === type.value
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-medium ${
                      mealType === type.value ? "text-white" : "text-foreground"
                    }`}
                  >
                    {type.icon} {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Common Foods */}
          <View className="px-4 mt-6">
            <Text className="text-foreground font-medium mb-3">常見食物</Text>
            <View className="flex-row flex-wrap gap-2">
              {COMMON_FOODS.map((food) => (
                <TouchableOpacity
                  key={food.name}
                  onPress={() => handleSelectCommonFood(food)}
                  className={`px-4 py-2 rounded-full ${
                    foodType === food.name
                      ? "bg-secondary"
                      : "bg-surface border border-border"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-medium ${
                      foodType === food.name ? "text-white" : "text-foreground"
                    }`}
                  >
                    {food.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Food Type Input */}
          <View className="px-4 mt-6">
            <Text className="text-foreground font-medium mb-2">食物類型 *</Text>
            <TextInput
              value={foodType}
              onChangeText={setFoodType}
              placeholder="輸入或選擇食物類型"
              placeholderTextColor={colors.muted}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              returnKeyType="done"
            />
          </View>

          {/* Amount Input */}
          <View className="px-4 mt-4">
            <Text className="text-foreground font-medium mb-2">份量 (g) *</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="輸入份量（克）"
              placeholderTextColor={colors.muted}
              keyboardType="decimal-pad"
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
              returnKeyType="done"
            />
          </View>

          {/* Calorie Preview */}
          {amount && parseFloat(amount) > 0 && (
            <View className="mx-4 mt-6 bg-secondary/10 rounded-xl p-4">
              <Text className="text-foreground font-medium">預估熱量</Text>
              <Text className="text-3xl font-bold text-secondary mt-1">
                {calculateCalories()} kcal
              </Text>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

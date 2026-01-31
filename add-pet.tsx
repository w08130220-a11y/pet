import { Text, View, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform as RNPlatform } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { useColors } from "@/hooks/use-colors";
import { PetSpecies } from "@/types";

const SPECIES_OPTIONS: { value: PetSpecies; label: string; icon: string }[] = [
  { value: "dog", label: "狗狗", icon: "🐕" },
  { value: "cat", label: "貓咪", icon: "🐱" },
  { value: "bird", label: "鳥類", icon: "🐦" },
  { value: "rabbit", label: "兔子", icon: "🐰" },
  { value: "other", label: "其他", icon: "🐾" },
];

export default function AddPetScreen() {
  const router = useRouter();
  const colors = useColors();
  const { addPet } = usePetStore();

  const [photoUri, setPhotoUri] = useState<string>("");
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<PetSpecies>("dog");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("權限不足", "需要相簿存取權限才能選擇照片");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("權限不足", "需要相機權限才能拍照");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert("請輸入寵物名稱");
      return;
    }

    if (!weight || isNaN(parseFloat(weight))) {
      Alert.alert("請輸入有效的體重");
      return;
    }

    setIsSubmitting(true);

    try {
      await addPet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        birthDate: birthDate || new Date().toISOString(),
        weight: parseFloat(weight),
        photoUri,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      Alert.alert("錯誤", "新增寵物失敗，請稍後再試");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Text className="text-lg font-semibold text-foreground">新增寵物</Text>
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
          {/* Photo Section */}
          <View className="items-center py-6">
            <TouchableOpacity
              onPress={handlePickImage}
              className="w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-border"
              activeOpacity={0.7}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <View className="w-full h-full bg-surface items-center justify-center">
                  <IconSymbol name="camera.fill" size={32} color={colors.muted} />
                  <Text className="text-muted text-sm mt-1">新增照片</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="flex-row gap-4 mt-4">
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-row items-center px-4 py-2 bg-surface rounded-full border border-border"
                activeOpacity={0.7}
              >
                <IconSymbol name="camera.fill" size={18} color={colors.primary} />
                <Text className="text-foreground ml-2">拍照</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-row items-center px-4 py-2 bg-surface rounded-full border border-border"
                activeOpacity={0.7}
              >
                <IconSymbol name="photo.fill" size={18} color={colors.primary} />
                <Text className="text-foreground ml-2">相簿</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View className="px-4 pb-8">
            {/* Name */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">寵物名稱 *</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="輸入寵物名稱"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            {/* Species */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">寵物種類</Text>
              <View className="flex-row flex-wrap gap-2">
                {SPECIES_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSpecies(option.value)}
                    className={`px-4 py-2 rounded-full ${
                      species === option.value
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-medium ${
                        species === option.value ? "text-white" : "text-foreground"
                      }`}
                    >
                      {option.icon} {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Breed */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">品種</Text>
              <TextInput
                value={breed}
                onChangeText={setBreed}
                placeholder="例如：柴犬、布偶貓"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            {/* Weight */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">體重 (kg) *</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="輸入體重"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            {/* Birth Date */}
            <View className="mb-4">
              <Text className="text-foreground font-medium mb-2">出生日期</Text>
              <TextInput
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

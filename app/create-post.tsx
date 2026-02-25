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
import { Pet } from "@/types";

export default function CreatePostScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, addPost } = usePetStore();

  const [imageUri, setImageUri] = useState<string>("");
  const [caption, setCaption] = useState("");
  const [selectedPetId, setSelectedPetId] = useState<string>(
    state.pets.length > 0 ? state.pets[0].id : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPet = state.pets.find((p) => p.id === selectedPetId);

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
      setImageUri(result.assets[0].uri);
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
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!imageUri) {
      Alert.alert("請選擇或拍攝一張照片");
      return;
    }

    if (!selectedPet) {
      Alert.alert("請選擇一隻寵物");
      return;
    }

    setIsSubmitting(true);

    try {
      await addPost({
        petId: selectedPet.id,
        petName: selectedPet.name,
        petPhotoUri: selectedPet.photoUri,
        imageUri,
        caption: caption.trim(),
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      router.back();
    } catch (error) {
      Alert.alert("錯誤", "發布失敗，請稍後再試");
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
          <Text className="text-lg font-semibold text-foreground">發布貼文</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting || !imageUri}
            activeOpacity={0.7}
          >
            <Text
              className={`font-semibold ${
                isSubmitting || !imageUri ? "text-muted" : "text-primary"
              }`}
            >
              {isSubmitting ? "發布中..." : "發布"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Image Section */}
          <View className="p-4">
            <TouchableOpacity
              onPress={handlePickImage}
              className="w-full aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-border"
              activeOpacity={0.7}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} />
              ) : (
                <View className="w-full h-full bg-surface items-center justify-center">
                  <IconSymbol name="photo.fill" size={48} color={colors.muted} />
                  <Text className="text-muted mt-2">點擊選擇照片</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center gap-4 mt-4">
              <TouchableOpacity
                onPress={handleTakePhoto}
                className="flex-row items-center px-6 py-3 bg-primary rounded-full"
                activeOpacity={0.8}
              >
                <IconSymbol name="camera.fill" size={20} color="#FFFFFF" />
                <Text className="text-white font-medium ml-2">拍照</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickImage}
                className="flex-row items-center px-6 py-3 bg-surface rounded-full border border-border"
                activeOpacity={0.7}
              >
                <IconSymbol name="photo.fill" size={20} color={colors.primary} />
                <Text className="text-foreground font-medium ml-2">相簿</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pet Selector */}
          <View className="px-4 mb-4">
            <Text className="text-foreground font-medium mb-2">選擇寵物</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {state.pets.map((pet) => (
                  <TouchableOpacity
                    key={pet.id}
                    onPress={() => setSelectedPetId(pet.id)}
                    className={`flex-row items-center px-3 py-2 rounded-full ${
                      selectedPetId === pet.id
                        ? "bg-primary"
                        : "bg-surface border border-border"
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
                        selectedPetId === pet.id ? "text-white" : "text-foreground"
                      }`}
                    >
                      {pet.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Caption */}
          <View className="px-4 pb-8">
            <Text className="text-foreground font-medium mb-2">說點什麼...</Text>
            <TextInput
              value={caption}
              onChangeText={setCaption}
              placeholder="分享這張照片的故事..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={4}
              className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground min-h-[100px]"
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

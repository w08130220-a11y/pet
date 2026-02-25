import { Text, View, TouchableOpacity, ScrollView, Alert, TextInput, Modal, KeyboardAvoidingView, Platform as RNPlatform } from "react-native";
import { Image } from "expo-image";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { useColors } from "@/hooks/use-colors";
import { Pet, PetSpecies } from "@/types";

const SPECIES_LABELS: Record<PetSpecies, string> = {
  dog: "狗狗",
  cat: "貓咪",
  bird: "鳥類",
  rabbit: "兔子",
  other: "其他",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-border">
      <Text className="text-muted">{label}</Text>
      <Text className="text-foreground font-medium">{value}</Text>
    </View>
  );
}

function EditPetModal({
  visible,
  pet,
  onClose,
  onSave,
}: {
  visible: boolean;
  pet: Pet;
  onClose: () => void;
  onSave: (updatedPet: Pet) => void;
}) {
  const colors = useColors();
  const [name, setName] = useState(pet.name);
  const [breed, setBreed] = useState(pet.breed);
  const [weight, setWeight] = useState(pet.weight.toString());

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("請輸入寵物名稱");
      return;
    }

    if (!weight || isNaN(parseFloat(weight))) {
      Alert.alert("請輸入有效的體重");
      return;
    }

    onSave({
      ...pet,
      name: name.trim(),
      breed: breed.trim(),
      weight: parseFloat(weight),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <ScreenContainer edges={["top", "left", "right", "bottom"]} containerClassName="bg-background">
        <KeyboardAvoidingView
          behavior={RNPlatform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text className="text-primary font-medium">取消</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">編輯寵物</Text>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.7}>
              <Text className="text-primary font-semibold">儲存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            <View className="mt-4">
              <Text className="text-foreground font-medium mb-2">名稱</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="寵物名稱"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            <View className="mt-4">
              <Text className="text-foreground font-medium mb-2">品種</Text>
              <TextInput
                value={breed}
                onChangeText={setBreed}
                placeholder="品種"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            <View className="mt-4">
              <Text className="text-foreground font-medium mb-2">體重 (kg)</Text>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="體重"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </Modal>
  );
}

export default function PetDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getPetById, updatePet, deletePet, getMedicalByPetId, getTodayMeals, getHealthSuggestion } = usePetStore();

  const [showEditModal, setShowEditModal] = useState(false);

  const pet = id ? getPetById(id) : null;
  const medicalRecords = id ? getMedicalByPetId(id) : [];
  const todayMeals = id ? getTodayMeals(id) : [];
  const healthSuggestion = id ? getHealthSuggestion(id) : null;

  const handleEdit = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedPet: Pet) => {
    try {
      await updatePet(updatedPet);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setShowEditModal(false);
    } catch (error) {
      Alert.alert("錯誤", "更新失敗");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "刪除寵物",
      `確定要刪除 ${pet?.name} 嗎？此操作無法復原，所有相關的貼文、飲食和醫療紀錄都會被刪除。`,
      [
        { text: "取消", style: "cancel" },
        {
          text: "刪除",
          style: "destructive",
          onPress: async () => {
            if (id) {
              await deletePet(id);
              router.back();
            }
          },
        },
      ]
    );
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

  const age = pet.birthDate
    ? Math.floor(
        (new Date().getTime() - new Date(pet.birthDate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <ScreenContainer edges={["top", "left", "right", "bottom"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">{pet.name}</Text>
        <TouchableOpacity onPress={handleEdit} activeOpacity={0.7}>
          <IconSymbol name="pencil" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pet Photo */}
        <View className="items-center py-6">
          <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20">
            {pet.photoUri ? (
              <Image source={{ uri: pet.photoUri }} style={{ width: "100%", height: "100%" }} />
            ) : (
              <View className="w-full h-full bg-primary/10 items-center justify-center">
                <IconSymbol name="pawprint.fill" size={48} color={colors.primary} />
              </View>
            )}
          </View>
          <Text className="text-2xl font-bold text-foreground mt-4">{pet.name}</Text>
          <Text className="text-muted">
            {SPECIES_LABELS[pet.species]} {pet.breed && `· ${pet.breed}`}
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row mx-4 mb-6">
          <View className="flex-1 bg-surface rounded-xl p-4 mr-2 items-center border border-border">
            <Text className="text-2xl font-bold text-primary">{pet.weight}</Text>
            <Text className="text-muted text-sm">公斤</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 mx-1 items-center border border-border">
            <Text className="text-2xl font-bold text-secondary">
              {age !== null ? age : "-"}
            </Text>
            <Text className="text-muted text-sm">歲</Text>
          </View>
          <View className="flex-1 bg-surface rounded-xl p-4 ml-2 items-center border border-border">
            <Text className="text-2xl font-bold text-success">{medicalRecords.length}</Text>
            <Text className="text-muted text-sm">醫療紀錄</Text>
          </View>
        </View>

        {/* Today's Health */}
        {healthSuggestion && (
          <View className="mx-4 mb-6 bg-surface rounded-xl p-4 border border-border">
            <Text className="text-foreground font-semibold mb-3">今日健康狀態</Text>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-muted">今日攝取熱量</Text>
              <Text className="text-foreground font-medium">
                {healthSuggestion.currentCalories} / {healthSuggestion.dailyCalories} kcal
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-muted">建議運動時間</Text>
              <Text className="text-foreground font-medium">
                {healthSuggestion.exerciseMinutes} 分鐘
              </Text>
            </View>
          </View>
        )}

        {/* Pet Info */}
        <View className="mx-4 mb-6 bg-surface rounded-xl px-4 border border-border">
          <InfoRow label="種類" value={SPECIES_LABELS[pet.species]} />
          <InfoRow label="品種" value={pet.breed || "未設定"} />
          <InfoRow label="體重" value={`${pet.weight} kg`} />
          <InfoRow
            label="出生日期"
            value={
              pet.birthDate
                ? new Date(pet.birthDate).toLocaleDateString("zh-TW")
                : "未設定"
            }
          />
          <InfoRow
            label="建立日期"
            value={new Date(pet.createdAt).toLocaleDateString("zh-TW")}
          />
        </View>

        {/* Quick Actions */}
        <View className="mx-4 mb-6">
          <Text className="text-foreground font-semibold mb-3">快速操作</Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push(`/medical-records/${pet.id}` as any)}
              className="flex-1 bg-primary/10 rounded-xl p-4 items-center"
              activeOpacity={0.7}
            >
              <IconSymbol name="cross.case.fill" size={24} color={colors.primary} />
              <Text className="text-primary font-medium mt-2">醫療紀錄</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/meal-log?petId=${pet.id}` as any)}
              className="flex-1 bg-secondary/10 rounded-xl p-4 items-center"
              activeOpacity={0.7}
            >
              <IconSymbol name="fork.knife" size={24} color={colors.secondary} />
              <Text className="text-secondary font-medium mt-2">記錄飲食</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delete Button */}
        <View className="mx-4 mb-8">
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-error/10 rounded-xl p-4 items-center"
            activeOpacity={0.7}
          >
            <Text className="text-error font-medium">刪除寵物</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      {pet && (
        <EditPetModal
          visible={showEditModal}
          pet={pet}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </ScreenContainer>
  );
}

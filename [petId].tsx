import { Text, View, FlatList, TouchableOpacity, Alert, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform as RNPlatform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { useColors } from "@/hooks/use-colors";
import { MedicalRecord, MedicalRecordType } from "@/types";

const RECORD_TYPES: { value: MedicalRecordType; label: string; icon: string }[] = [
  { value: "vaccine", label: "預防針", icon: "💉" },
  { value: "checkup", label: "健康檢查", icon: "🩺" },
  { value: "treatment", label: "治療", icon: "💊" },
  { value: "other", label: "其他", icon: "📋" },
];

function RecordCard({
  record,
  onDelete,
}: {
  record: MedicalRecord;
  onDelete: () => void;
}) {
  const colors = useColors();

  const typeInfo = RECORD_TYPES.find((t) => t.value === record.type) || RECORD_TYPES[3];
  const date = new Date(record.date).toLocaleDateString("zh-TW");
  const nextDue = record.nextDueDate
    ? new Date(record.nextDueDate).toLocaleDateString("zh-TW")
    : null;

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert("刪除紀錄", "確定要刪除此紀錄嗎？", [
      { text: "取消", style: "cancel" },
      { text: "刪除", style: "destructive", onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      className="bg-surface rounded-xl p-4 mb-3 border border-border"
      activeOpacity={0.7}
    >
      <View className="flex-row items-start">
        <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
          <Text className="text-lg">{typeInfo.icon}</Text>
        </View>
        <View className="flex-1 ml-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-foreground font-semibold">{record.title}</Text>
            <Text className="text-muted text-sm">{date}</Text>
          </View>
          <Text className="text-muted text-sm mt-1">{typeInfo.label}</Text>
          {record.description && (
            <Text className="text-foreground mt-2">{record.description}</Text>
          )}
          {record.veterinarian && (
            <Text className="text-muted text-sm mt-1">
              獸醫：{record.veterinarian}
            </Text>
          )}
          {nextDue && (
            <View className="flex-row items-center mt-2 bg-warning/10 px-3 py-1 rounded-full self-start">
              <IconSymbol name="calendar" size={14} color={colors.warning} />
              <Text className="text-warning text-sm ml-1">下次：{nextDue}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function AddRecordModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<MedicalRecord, "id" | "createdAt" | "petId">) => void;
}) {
  const colors = useColors();
  const [type, setType] = useState<MedicalRecordType>("vaccine");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [nextDueDate, setNextDueDate] = useState("");
  const [veterinarian, setVeterinarian] = useState("");

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert("請輸入標題");
      return;
    }

    onSubmit({
      type,
      title: title.trim(),
      description: description.trim(),
      date,
      nextDueDate: nextDueDate || undefined,
      veterinarian: veterinarian.trim() || undefined,
    });

    // Reset form
    setType("vaccine");
    setTitle("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setNextDueDate("");
    setVeterinarian("");
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
            <Text className="text-lg font-semibold text-foreground">新增紀錄</Text>
            <TouchableOpacity onPress={handleSubmit} activeOpacity={0.7}>
              <Text className="text-primary font-semibold">儲存</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {/* Record Type */}
            <View className="px-4 mt-4">
              <Text className="text-foreground font-medium mb-3">紀錄類型</Text>
              <View className="flex-row flex-wrap gap-2">
                {RECORD_TYPES.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    onPress={() => setType(item.value)}
                    className={`px-4 py-2 rounded-full ${
                      type === item.value
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    }`}
                    activeOpacity={0.7}
                  >
                    <Text
                      className={`font-medium ${
                        type === item.value ? "text-white" : "text-foreground"
                      }`}
                    >
                      {item.icon} {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View className="px-4 mt-4">
              <Text className="text-foreground font-medium mb-2">標題 *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="例如：狂犬病疫苗"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            {/* Description */}
            <View className="px-4 mt-4">
              <Text className="text-foreground font-medium mb-2">說明</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="詳細說明..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground min-h-[80px]"
                textAlignVertical="top"
              />
            </View>

            {/* Date */}
            <View className="px-4 mt-4">
              <Text className="text-foreground font-medium mb-2">日期</Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            {/* Next Due Date */}
            <View className="px-4 mt-4">
              <Text className="text-foreground font-medium mb-2">下次日期（選填）</Text>
              <TextInput
                value={nextDueDate}
                onChangeText={setNextDueDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                returnKeyType="done"
              />
            </View>

            {/* Veterinarian */}
            <View className="px-4 mt-4 mb-8">
              <Text className="text-foreground font-medium mb-2">獸醫（選填）</Text>
              <TextInput
                value={veterinarian}
                onChangeText={setVeterinarian}
                placeholder="獸醫師姓名或醫院"
                placeholderTextColor={colors.muted}
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

export default function MedicalRecordsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { petId } = useLocalSearchParams<{ petId: string }>();
  const { getPetById, getMedicalByPetId, addMedicalRecord, deleteMedicalRecord } = usePetStore();

  const [showAddModal, setShowAddModal] = useState(false);

  const pet = petId ? getPetById(petId) : null;
  const records = petId ? getMedicalByPetId(petId) : [];

  const handleAddRecord = async (data: Omit<MedicalRecord, "id" | "createdAt" | "petId">) => {
    if (!petId) return;

    try {
      await addMedicalRecord({
        ...data,
        petId,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setShowAddModal(false);
    } catch (error) {
      Alert.alert("錯誤", "新增失敗，請稍後再試");
    }
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
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-foreground">{pet.name} 的醫療紀錄</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)} activeOpacity={0.7}>
          <IconSymbol name="plus.circle.fill" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Records List */}
      <FlatList
        data={records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordCard record={item} onDelete={() => deleteMedicalRecord(item.id)} />
        )}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-20">
            <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-4">
              <IconSymbol name="cross.case.fill" size={40} color={colors.primary} />
            </View>
            <Text className="text-foreground text-xl font-bold mb-2">尚無醫療紀錄</Text>
            <Text className="text-muted text-center px-8 mb-6">
              點擊右上角的 + 按鈕新增預防針或醫療紀錄
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="bg-primary px-6 py-3 rounded-full"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">新增紀錄</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Add Record Modal */}
      <AddRecordModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddRecord}
      />
    </ScreenContainer>
  );
}

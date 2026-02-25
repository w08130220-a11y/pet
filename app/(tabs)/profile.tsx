import { Text, View, FlatList, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { useColors } from "@/hooks/use-colors";
import { Pet } from "@/types";

function PetCard({ pet, onPress, onDelete }: { pet: Pet; onPress: () => void; onDelete: () => void }) {
  const colors = useColors();

  const speciesLabels: Record<string, string> = {
    dog: "狗狗",
    cat: "貓咪",
    bird: "鳥類",
    rabbit: "兔子",
    other: "其他",
  };

  const handleLongPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "刪除寵物",
      `確定要刪除 ${pet.name} 嗎？此操作無法復原。`,
      [
        { text: "取消", style: "cancel" },
        { text: "刪除", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleLongPress}
      className="bg-surface rounded-2xl p-4 mr-3 border border-border"
      style={{ width: 160 }}
      activeOpacity={0.7}
    >
      <View className="w-full aspect-square rounded-xl overflow-hidden mb-3">
        {pet.photoUri ? (
          <Image source={{ uri: pet.photoUri }} style={{ width: "100%", height: "100%" }} />
        ) : (
          <View className="w-full h-full bg-primary/10 items-center justify-center">
            <IconSymbol name="pawprint.fill" size={48} color={colors.primary} />
          </View>
        )}
      </View>
      <Text className="text-foreground font-semibold text-lg">{pet.name}</Text>
      <Text className="text-muted text-sm">
        {speciesLabels[pet.species] || pet.species} · {pet.weight}kg
      </Text>
    </TouchableOpacity>
  );
}

function MenuItem({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: any;
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-surface rounded-xl p-4 mb-2 border border-border"
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
        <IconSymbol name={icon} size={20} color={colors.primary} />
      </View>
      <View className="flex-1 ml-3">
        <Text className="text-foreground font-medium">{title}</Text>
        {subtitle && <Text className="text-muted text-sm">{subtitle}</Text>}
      </View>
      <IconSymbol name="chevron.right" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useColors();
  const { state, deletePet } = usePetStore();

  const handleAddPet = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push("/add-pet" as any);
  };

  const handlePetPress = (petId: string) => {
    router.push(`/pet/${petId}` as any);
  };

  const handleMedicalRecords = (petId?: string) => {
    if (state.pets.length === 0) {
      Alert.alert("提示", "請先新增寵物");
      return;
    }
    const id = petId || state.pets[0].id;
    router.push(`/medical-records/${id}` as any);
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
        <Text className="text-2xl font-bold text-foreground">我的</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Section */}
        <View className="items-center py-6">
          <View className="w-20 h-20 rounded-full bg-primary/20 items-center justify-center mb-3">
            <IconSymbol name="person.fill" size={40} color={colors.primary} />
          </View>
          <Text className="text-foreground text-xl font-bold">寵物主人</Text>
          <Text className="text-muted">{state.pets.length} 隻寵物</Text>
        </View>

        {/* My Pets Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="text-foreground font-semibold text-lg">我的寵物</Text>
            <TouchableOpacity onPress={handleAddPet} activeOpacity={0.7}>
              <IconSymbol name="plus.circle.fill" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {state.pets.length === 0 ? (
            <TouchableOpacity
              onPress={handleAddPet}
              className="mx-4 bg-surface rounded-2xl p-6 items-center border border-border border-dashed"
              activeOpacity={0.7}
            >
              <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-3">
                <IconSymbol name="plus" size={32} color={colors.primary} />
              </View>
              <Text className="text-foreground font-medium">新增您的第一隻寵物</Text>
              <Text className="text-muted text-sm text-center mt-1">
                拍照或上傳照片，開始記錄寵物生活
              </Text>
            </TouchableOpacity>
          ) : (
            <FlatList
              horizontal
              data={state.pets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PetCard
                  pet={item}
                  onPress={() => handlePetPress(item.id)}
                  onDelete={() => deletePet(item.id)}
                />
              )}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              showsHorizontalScrollIndicator={false}
            />
          )}
        </View>

        {/* Menu Items */}
        <View className="px-4 pb-8">
          <Text className="text-foreground font-semibold text-lg mb-3">功能選單</Text>

          <MenuItem
            icon="cross.case.fill"
            title="醫療紀錄"
            subtitle="預防針、健檢、治療紀錄"
            onPress={() => handleMedicalRecords()}
          />

          <MenuItem
            icon="fork.knife"
            title="飲食管理"
            subtitle="查看所有飲食紀錄"
            onPress={() => {
              if (state.pets.length > 0) {
                router.push(`/meal-log?petId=${state.pets[0].id}` as any);
              } else {
                Alert.alert("提示", "請先新增寵物");
              }
            }}
          />

          <MenuItem
            icon="bell.fill"
            title="提醒設定"
            subtitle="餵食、預防針提醒"
            onPress={() => Alert.alert("即將推出", "提醒功能開發中")}
          />

          <MenuItem
            icon="gearshape.fill"
            title="設定"
            subtitle="應用程式設定"
            onPress={() => Alert.alert("即將推出", "設定功能開發中")}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

import { Text, View, TouchableOpacity, Dimensions, ScrollView, Platform as RNPlatform } from "react-native";
import { Image } from "expo-image";
import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
} from "react-native-reanimated";

import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { usePetStore } from "@/lib/pet-store";
import { usePremium } from "@/lib/premium-store";
import { useColors } from "@/hooks/use-colors";
import { Pet, SceneType, PetAnimationState } from "@/types";
import { PetChatModal } from "@/components/ai-chat";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Scene backgrounds for 2D mode
const SCENES: Record<SceneType, { name: string; gradient: string[]; icon: string }> = {
  park: { name: "公園", gradient: ["#87CEEB", "#90EE90"], icon: "🌳" },
  "living-room": { name: "客廳", gradient: ["#DEB887", "#F5DEB3"], icon: "🏠" },
  beach: { name: "海灘", gradient: ["#87CEEB", "#F0E68C"], icon: "🏖️" },
  forest: { name: "森林", gradient: ["#228B22", "#90EE90"], icon: "🌲" },
};

// Map 2D scene types to 3D scene types
const SCENE_TYPE_MAP: Record<SceneType, "park" | "living_room" | "beach" | "forest"> = {
  park: "park",
  "living-room": "living_room",
  beach: "beach",
  forest: "forest",
};

const ANIMATION_STATES: { state: PetAnimationState; label: string; icon: string }[] = [
  { state: "idle", label: "待機", icon: "😊" },
  { state: "walk", label: "走路", icon: "🚶" },
  { state: "sit", label: "坐下", icon: "🪑" },
  { state: "sleep", label: "睡覺", icon: "😴" },
  { state: "play", label: "玩耍", icon: "🎾" },
];

interface AnimatedPetProps {
  pet: Pet;
  animationState: PetAnimationState;
  onTap: () => void;
}

function AnimatedPet({ pet, animationState, onTap }: AnimatedPetProps) {
  const colors = useColors();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    // Reset animations
    translateX.value = 0;
    translateY.value = 0;
    scale.value = 1;
    rotation.value = 0;

    switch (animationState) {
      case "walk":
        translateX.value = withRepeat(
          withSequence(
            withTiming(50, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
            withTiming(-50, { duration: 1500, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        translateY.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          true
        );
        break;
      case "sit":
        scale.value = withTiming(0.9, { duration: 500 });
        translateY.value = withTiming(10, { duration: 500 });
        break;
      case "sleep":
        scale.value = withTiming(0.85, { duration: 1000 });
        translateY.value = withTiming(15, { duration: 1000 });
        rotation.value = withTiming(-5, { duration: 1000 });
        break;
      case "play":
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 200 }),
            withTiming(0.95, { duration: 200 })
          ),
          -1,
          true
        );
        rotation.value = withRepeat(
          withSequence(
            withTiming(5, { duration: 200 }),
            withTiming(-5, { duration: 200 })
          ),
          -1,
          true
        );
        break;
      case "idle":
      default:
        translateY.value = withRepeat(
          withSequence(
            withTiming(-3, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            withTiming(3, { duration: 2000, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
        break;
    }
  }, [animationState]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  return (
    <TouchableOpacity onPress={onTap} activeOpacity={0.9}>
      <Animated.View style={animatedStyle} className="items-center">
        <View className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {pet.photoUri ? (
            <Image source={{ uri: pet.photoUri }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <View className="w-full h-full bg-primary/20 items-center justify-center">
              <IconSymbol name="pawprint.fill" size={48} color={colors.primary} />
            </View>
          )}
        </View>
        <View className="bg-white/90 px-3 py-1 rounded-full mt-2">
          <Text className="text-foreground font-semibold">{pet.name}</Text>
        </View>
        {animationState === "sleep" && (
          <Text className="text-2xl absolute -top-2 -right-2">💤</Text>
        )}
        {animationState === "play" && (
          <Text className="text-2xl absolute -top-2 -right-2">✨</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

function EmptyPetWorld() {
  const colors = useColors();

  return (
    <View className="flex-1 items-center justify-center">
      <View className="w-24 h-24 rounded-full bg-white/30 items-center justify-center mb-4">
        <IconSymbol name="pawprint.fill" size={48} color={colors.foreground} />
      </View>
      <Text className="text-foreground text-xl font-bold mb-2">寵物世界空空如也</Text>
      <Text className="text-muted text-center px-8">
        請先在「我的」頁面新增您的寵物，讓牠們在這裡自由活動！
      </Text>
    </View>
  );
}

// Premium Upgrade Modal
function PremiumUpgradeModal({ 
  visible, 
  onClose, 
  onUpgrade 
}: { 
  visible: boolean; 
  onClose: () => void; 
  onUpgrade: () => void;
}) {
  const colors = useColors();

  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 items-center justify-center z-50">
      <View className="bg-background rounded-3xl p-6 mx-6 max-w-sm w-full">
        <View className="items-center mb-4">
          <Text className="text-4xl mb-2">🤖</Text>
          <Text className="text-xl font-bold text-foreground">升級 PRO 版本</Text>
        </View>
        
        <Text className="text-muted text-center mb-4">
          解鎖 AI 智能互動功能，讓您的寵物可以：
        </Text>
        
        <View className="gap-2 mb-6">
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">💬</Text>
            <Text className="text-foreground">與您進行智能對話</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">🎭</Text>
            <Text className="text-foreground">根據對話自動做出動作</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">🧠</Text>
            <Text className="text-foreground">擁有獨特的性格特徵</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Text className="text-lg">🔄</Text>
            <Text className="text-foreground">自主行為模式</Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-primary py-3 rounded-full mb-3"
          onPress={onUpgrade}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-semibold text-lg">
            立即升級（免費試用）
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
          <Text className="text-muted text-center">稍後再說</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 3D World Component using Canvas-based rendering
function PetWorld3DWrapper({ 
  pets, 
  currentScene, 
  onPetInteract,
  isPremium,
  onUpgradePress,
}: { 
  pets: Pet[]; 
  currentScene: SceneType;
  onPetInteract?: (petId: string) => void;
  isPremium?: boolean;
  onUpgradePress?: () => void;
}) {
  const [PetWorld3DCanvas, setPetWorld3DCanvas] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    // Load 3D Canvas component
    import("@/components/pet-3d/PetWorld3DCanvas")
      .then((module) => {
        setPetWorld3DCanvas(() => module.PetWorld3DCanvas);
      })
      .catch((err) => {
        console.warn("Failed to load 3D Canvas components:", err);
        setLoadError(true);
      });
  }, []);

  if (loadError) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground">3D 模式載入失敗</Text>
        <Text className="text-muted text-sm mt-2">請切換回 2D 模式</Text>
      </View>
    );
  }

  if (!PetWorld3DCanvas) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-foreground">載入 3D 世界中...</Text>
      </View>
    );
  }

  // Map scene type
  const sceneTypeMap: Record<SceneType, "park" | "living_room" | "beach" | "forest"> = {
    park: "park",
    "living-room": "living_room",
    beach: "beach",
    forest: "forest",
  };

  return (
    <PetWorld3DCanvas
      pets={pets}
      initialScene={sceneTypeMap[currentScene]}
      onPetInteract={onPetInteract}
      isPremium={isPremium}
      onUpgradePress={onUpgradePress}
    />
  );
}

export default function PetWorldScreen() {
  const colors = useColors();
  const { state } = usePetStore();
  const { state: premiumState, activatePremium, checkPremiumStatus } = usePremium();
  const [currentScene, setCurrentScene] = useState<SceneType>("park");
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [animationState, setAnimationState] = useState<PetAnimationState>("idle");
  const [viewMode, setViewMode] = useState<"2d" | "3d">("2d");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const isPremium = checkPremiumStatus();

  // Auto-select first pet
  useEffect(() => {
    if (state.pets.length > 0 && !selectedPetId) {
      setSelectedPetId(state.pets[0].id);
    }
  }, [state.pets, selectedPetId]);

  const selectedPet = state.pets.find((p) => p.id === selectedPetId);

  const handleSceneChange = (scene: SceneType) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentScene(scene);
  };

  const handleAnimationChange = (newState: PetAnimationState) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setAnimationState(newState);
  };

  const handlePetTap = () => {
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    // Cycle through random animation
    const states: PetAnimationState[] = ["idle", "play", "walk", "sit"];
    const randomState = states[Math.floor(Math.random() * states.length)];
    setAnimationState(randomState);
  };

  const handleViewModeToggle = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setViewMode(viewMode === "2d" ? "3d" : "2d");
  };

  const handleAIChatPress = () => {
    if (isPremium) {
      setShowChatModal(true);
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleUpgrade = async () => {
    await activatePremium();
    setShowUpgradeModal(false);
    // Open chat after upgrade
    setTimeout(() => setShowChatModal(true), 300);
  };

  const handleActionFromChat = (action: string) => {
    // Map AI response actions to animation states
    const actionMap: Record<string, PetAnimationState> = {
      idle: "idle",
      walk: "walk",
      sit: "sit",
      sleep: "sleep",
      play: "play",
      jump: "play",
      eat: "idle",
      happy: "play",
      sad: "sit",
    };
    const newState = actionMap[action] || "idle";
    setAnimationState(newState);
  };

  const sceneGradient = SCENES[currentScene].gradient;

  // 3D Mode
  if (viewMode === "3d" && RNPlatform.OS === "web") {
    return (
      <ScreenContainer containerClassName="bg-transparent" edges={["top", "left", "right"]}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 bg-background/80 z-10">
          <Text className="text-2xl font-bold text-foreground">寵物世界</Text>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={handleViewModeToggle}
              className="bg-primary px-3 py-1 rounded-full flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white font-medium">切換 2D</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3D World */}
        <View className="flex-1">
          {state.pets.length === 0 ? (
            <View className="flex-1 bg-surface items-center justify-center">
              <EmptyPetWorld />
            </View>
          ) : (
            <PetWorld3DWrapper
              pets={state.pets}
              currentScene={currentScene}
              isPremium={isPremium}
              onUpgradePress={() => setShowUpgradeModal(true)}
            />
          )}
        </View>

        {/* Modals */}
        <PremiumUpgradeModal
          visible={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleUpgrade}
        />
        
        {selectedPet && (
          <PetChatModal
            visible={showChatModal}
            onClose={() => setShowChatModal(false)}
            pet={selectedPet}
            onActionChange={handleActionFromChat}
          />
        )}
      </ScreenContainer>
    );
  }

  // 2D Mode (default)
  return (
    <ScreenContainer containerClassName="bg-transparent">
      {/* Scene Background */}
      <View
        className="absolute inset-0"
        style={{
          backgroundColor: sceneGradient[0],
        }}
      >
        <View
          className="absolute bottom-0 left-0 right-0 h-1/2"
          style={{ backgroundColor: sceneGradient[1] }}
        />
      </View>

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-2xl font-bold text-foreground">寵物世界</Text>
        <View className="flex-row items-center gap-2">
          {/* AI Chat Button */}
          {state.pets.length > 0 && (
            <TouchableOpacity
              onPress={handleAIChatPress}
              className={`px-3 py-1 rounded-full flex-row items-center ${isPremium ? "bg-primary" : "bg-white/80"}`}
              activeOpacity={0.7}
            >
              <Text className={`font-medium ${isPremium ? "text-white" : "text-foreground"}`}>
                🤖 {isPremium ? "AI 對話" : "PRO"}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* 3D Toggle (only on web) */}
          {RNPlatform.OS === "web" && (
            <TouchableOpacity
              onPress={handleViewModeToggle}
              className="bg-primary px-3 py-1 rounded-full flex-row items-center"
              activeOpacity={0.7}
            >
              <Text className="text-white font-medium">🎮 3D</Text>
            </TouchableOpacity>
          )}
          <View className="bg-white/80 px-3 py-1 rounded-full">
            <Text className="text-foreground font-medium">{SCENES[currentScene].name}</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center">
        {state.pets.length === 0 ? (
          <EmptyPetWorld />
        ) : selectedPet ? (
          <AnimatedPet
            pet={selectedPet}
            animationState={animationState}
            onTap={handlePetTap}
          />
        ) : null}
      </View>

      {/* Pet Selector (if multiple pets) */}
      {state.pets.length > 1 && (
        <View className="px-4 pb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {state.pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => setSelectedPetId(pet.id)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                    selectedPetId === pet.id ? "border-primary" : "border-white/50"
                  }`}
                  activeOpacity={0.7}
                >
                  {pet.photoUri ? (
                    <Image source={{ uri: pet.photoUri }} style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <View className="w-full h-full bg-primary/20 items-center justify-center">
                      <IconSymbol name="pawprint.fill" size={20} color={colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Animation Controls */}
      {state.pets.length > 0 && (
        <View className="px-4 pb-2">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {ANIMATION_STATES.map((item) => (
                <TouchableOpacity
                  key={item.state}
                  onPress={() => handleAnimationChange(item.state)}
                  className={`px-4 py-2 rounded-full ${
                    animationState === item.state ? "bg-primary" : "bg-white/80"
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`font-medium ${
                      animationState === item.state ? "text-white" : "text-foreground"
                    }`}
                  >
                    {item.icon} {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Scene Selector */}
      <View className="px-4 pb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row gap-2">
            {(Object.keys(SCENES) as SceneType[]).map((scene) => (
              <TouchableOpacity
                key={scene}
                onPress={() => handleSceneChange(scene)}
                className={`px-4 py-2 rounded-full ${
                  currentScene === scene ? "bg-primary" : "bg-white/80"
                }`}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-medium ${
                    currentScene === scene ? "text-white" : "text-foreground"
                  }`}
                >
                  {SCENES[scene].icon} {SCENES[scene].name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Modals */}
      <PremiumUpgradeModal
        visible={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
      />
      
      {selectedPet && (
        <PetChatModal
          visible={showChatModal}
          onClose={() => setShowChatModal(false)}
          pet={selectedPet}
          onActionChange={handleActionFromChat}
        />
      )}
    </ScreenContainer>
  );
}

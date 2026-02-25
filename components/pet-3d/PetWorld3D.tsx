import React, { useState, useCallback, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from "react-native";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

import { Pet3DModel } from "./Pet3DModel";
import { Scene3D, SceneType } from "./Scene3D";
import { Pet } from "@/types";
import { useColors } from "@/hooks/use-colors";
import { IconSymbol } from "@/components/ui/icon-symbol";

interface PetWorld3DProps {
  pets: Pet[];
  initialScene?: SceneType;
  onPetInteract?: (petId: string) => void;
  isPremium?: boolean;
  onUpgradePress?: () => void;
}

const SCENES: { type: SceneType; name: string; icon: string }[] = [
  { type: "park", name: "公園", icon: "🌳" },
  { type: "living_room", name: "客廳", icon: "🏠" },
  { type: "beach", name: "海灘", icon: "🏖️" },
  { type: "forest", name: "森林", icon: "🌲" },
];

const ANIMATIONS = [
  { id: "idle", name: "待機", icon: "😊" },
  { id: "walk", name: "走路", icon: "🚶" },
  { id: "sit", name: "坐下", icon: "🪑" },
  { id: "sleep", name: "睡覺", icon: "😴" },
  { id: "play", name: "玩耍", icon: "🎾" },
  { id: "jump", name: "跳躍", icon: "⬆️" },
] as const;

// Pet colors based on species
const PET_COLORS: Record<string, string> = {
  dog: "#D4A574",
  cat: "#F5A623",
  bird: "#4ECDC4",
  rabbit: "#FFFFFF",
  other: "#95A5A6",
};

export function PetWorld3D({
  pets,
  initialScene = "park",
  onPetInteract,
  isPremium = false,
  onUpgradePress,
}: PetWorld3DProps) {
  const colors = useColors();
  const [currentScene, setCurrentScene] = useState<SceneType>(initialScene);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(pets[0]?.id || null);
  const [currentAnimation, setCurrentAnimation] = useState<typeof ANIMATIONS[number]["id"]>("idle");
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const [showAnimationSelector, setShowAnimationSelector] = useState(false);

  const handlePetClick = useCallback((petId: string) => {
    setSelectedPetId(petId);
    onPetInteract?.(petId);
  }, [onPetInteract]);

  const handleSceneChange = (scene: SceneType) => {
    setCurrentScene(scene);
    setShowSceneSelector(false);
  };

  const handleAnimationChange = (anim: typeof ANIMATIONS[number]["id"]) => {
    setCurrentAnimation(anim);
    setShowAnimationSelector(false);
  };

  // Calculate pet positions in a circle
  const getPetPosition = (index: number, total: number): [number, number, number] => {
    if (total === 1) return [0, 0.5, 0];
    const angle = (index / total) * Math.PI * 2;
    const radius = 2;
    return [Math.cos(angle) * radius, 0.5, Math.sin(angle) * radius];
  };

  if (pets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.foreground }]}>
          尚未新增寵物
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.muted }]}>
          請先新增寵物才能進入寵物世界
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 3D Canvas */}
      <View style={styles.canvasContainer}>
        <Canvas shadows>
          <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={50} />
          <OrbitControls
            enablePan={false}
            minDistance={5}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2.2}
            minPolarAngle={Math.PI / 6}
          />
          
          <Physics gravity={[0, -9.81, 0]}>
            <Scene3D sceneType={currentScene} />
            
            {pets.map((pet, index) => (
              <Pet3DModel
                key={pet.id}
                species={pet.species}
                position={getPetPosition(index, pets.length)}
                color={PET_COLORS[pet.species]}
                animation={selectedPetId === pet.id ? currentAnimation : "idle"}
                onInteract={() => handlePetClick(pet.id)}
              />
            ))}
          </Physics>
        </Canvas>
      </View>

      {/* Controls Overlay */}
      <View style={styles.controlsOverlay}>
        {/* Scene Selector Button */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowSceneSelector(!showSceneSelector)}
          activeOpacity={0.7}
        >
          <Text style={styles.controlIcon}>
            {SCENES.find(s => s.type === currentScene)?.icon}
          </Text>
          <Text style={[styles.controlText, { color: colors.foreground }]}>場景</Text>
        </TouchableOpacity>

        {/* Animation Selector Button */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowAnimationSelector(!showAnimationSelector)}
          activeOpacity={0.7}
        >
          <Text style={styles.controlIcon}>
            {ANIMATIONS.find(a => a.id === currentAnimation)?.icon}
          </Text>
          <Text style={[styles.controlText, { color: colors.foreground }]}>動作</Text>
        </TouchableOpacity>

        {/* AI Chat Button (Premium) */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            { 
              backgroundColor: isPremium ? colors.primary : colors.surface,
              borderColor: isPremium ? colors.primary : colors.border,
            }
          ]}
          onPress={isPremium ? () => onPetInteract?.(selectedPetId || "") : onUpgradePress}
          activeOpacity={0.7}
        >
          <Text style={styles.controlIcon}>🤖</Text>
          <Text style={[styles.controlText, { color: isPremium ? "#FFFFFF" : colors.foreground }]}>
            {isPremium ? "AI 對話" : "升級"}
          </Text>
          {!isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: colors.warning }]}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Pet Selector */}
      {pets.length > 1 && (
        <View style={[styles.petSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petSelectorItem,
                selectedPetId === pet.id && { backgroundColor: colors.primary + "30" },
              ]}
              onPress={() => setSelectedPetId(pet.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.petSelectorIcon}>
                {pet.species === "dog" ? "🐕" : pet.species === "cat" ? "🐱" : pet.species === "bird" ? "🐦" : pet.species === "rabbit" ? "🐰" : "🐾"}
              </Text>
              <Text
                style={[
                  styles.petSelectorName,
                  { color: selectedPetId === pet.id ? colors.primary : colors.foreground },
                ]}
                numberOfLines={1}
              >
                {pet.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Scene Selector Modal */}
      {showSceneSelector && (
        <View style={[styles.selectorModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.selectorTitle, { color: colors.foreground }]}>選擇場景</Text>
          <View style={styles.selectorGrid}>
            {SCENES.map((scene) => (
              <TouchableOpacity
                key={scene.type}
                style={[
                  styles.selectorItem,
                  currentScene === scene.type && { backgroundColor: colors.primary + "30" },
                ]}
                onPress={() => handleSceneChange(scene.type)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorItemIcon}>{scene.icon}</Text>
                <Text style={[styles.selectorItemText, { color: colors.foreground }]}>{scene.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Animation Selector Modal */}
      {showAnimationSelector && (
        <View style={[styles.selectorModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.selectorTitle, { color: colors.foreground }]}>選擇動作</Text>
          <View style={styles.selectorGrid}>
            {ANIMATIONS.map((anim) => (
              <TouchableOpacity
                key={anim.id}
                style={[
                  styles.selectorItem,
                  currentAnimation === anim.id && { backgroundColor: colors.primary + "30" },
                ]}
                onPress={() => handleAnimationChange(anim.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorItemIcon}>{anim.icon}</Text>
                <Text style={[styles.selectorItemText, { color: colors.foreground }]}>{anim.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.instructions, { backgroundColor: colors.surface + "CC" }]}>
        <Text style={[styles.instructionText, { color: colors.muted }]}>
          拖曳旋轉視角 • 雙指縮放 • 點擊寵物互動
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  canvasContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  controlsOverlay: {
    position: "absolute",
    top: 16,
    right: 16,
    gap: 12,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    position: "relative",
  },
  controlIcon: {
    fontSize: 18,
  },
  controlText: {
    fontSize: 14,
    fontWeight: "500",
  },
  premiumBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  petSelector: {
    position: "absolute",
    bottom: 80,
    left: 16,
    right: 16,
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 8,
    gap: 8,
  },
  petSelectorItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 12,
  },
  petSelectorIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  petSelectorName: {
    fontSize: 12,
    fontWeight: "500",
  },
  selectorModal: {
    position: "absolute",
    top: "30%",
    left: 20,
    right: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  selectorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
  },
  selectorItem: {
    width: 80,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectorItemIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  selectorItemText: {
    fontSize: 12,
    fontWeight: "500",
  },
  instructions: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 12,
  },
});

export default PetWorld3D;

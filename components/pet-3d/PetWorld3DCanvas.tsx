import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from "react-native";
import { Pet, PetSpecies } from "@/types";
import { useColors } from "@/hooks/use-colors";

interface PetWorld3DCanvasProps {
  pets: Pet[];
  initialScene?: SceneType;
  onPetInteract?: (petId: string) => void;
  isPremium?: boolean;
  onUpgradePress?: () => void;
}

export type SceneType = "park" | "living_room" | "beach" | "forest";

const SCENES: { type: SceneType; name: string; icon: string; groundColor: string; skyColor: string }[] = [
  { type: "park", name: "公園", icon: "🌳", groundColor: "#4CAF50", skyColor: "#87CEEB" },
  { type: "living_room", name: "客廳", icon: "🏠", groundColor: "#8B7355", skyColor: "#FFF8DC" },
  { type: "beach", name: "海灘", icon: "🏖️", groundColor: "#F4D03F", skyColor: "#5DADE2" },
  { type: "forest", name: "森林", icon: "🌲", groundColor: "#2E7D32", skyColor: "#81C784" },
];

const ANIMATIONS = [
  { id: "idle", name: "待機", icon: "😊" },
  { id: "walk", name: "走路", icon: "🚶" },
  { id: "sit", name: "坐下", icon: "🪑" },
  { id: "sleep", name: "睡覺", icon: "😴" },
  { id: "play", name: "玩耍", icon: "🎾" },
  { id: "jump", name: "跳躍", icon: "⬆️" },
] as const;

type AnimationType = typeof ANIMATIONS[number]["id"];

// Pet 3D model using CSS transforms
interface Pet3DProps {
  pet: Pet;
  isSelected: boolean;
  animation: AnimationType;
  position: { x: number; y: number; z: number };
  onPress: () => void;
}

function Pet3DModel({ pet, isSelected, animation, position, onPress }: Pet3DProps) {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const walkAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  
  // Pet colors based on species
  const petColors: Record<PetSpecies, { body: string; accent: string }> = {
    dog: { body: "#D4A574", accent: "#8B6914" },
    cat: { body: "#F5A623", accent: "#E67E22" },
    bird: { body: "#4ECDC4", accent: "#1ABC9C" },
    rabbit: { body: "#FFFFFF", accent: "#BDC3C7" },
    other: { body: "#95A5A6", accent: "#7F8C8D" },
  };
  
  const colors = petColors[pet.species];
  
  useEffect(() => {
    // Stop all animations first
    bounceAnim.stopAnimation();
    walkAnim.stopAnimation();
    rotateAnim.stopAnimation();
    
    bounceAnim.setValue(0);
    walkAnim.setValue(0);
    rotateAnim.setValue(0);
    
    switch (animation) {
      case "idle":
        // Gentle breathing animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -5, duration: 1000, useNativeDriver: true }),
            Animated.timing(bounceAnim, { toValue: 0, duration: 1000, useNativeDriver: true }),
          ])
        ).start();
        break;
        
      case "walk":
        // Walking animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(walkAnim, { toValue: 10, duration: 300, useNativeDriver: true }),
            Animated.timing(walkAnim, { toValue: -10, duration: 300, useNativeDriver: true }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, { toValue: 5, duration: 300, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: -5, duration: 300, useNativeDriver: true }),
          ])
        ).start();
        break;
        
      case "sit":
        // Sitting pose - slight tilt
        Animated.timing(rotateAnim, { toValue: -10, duration: 500, useNativeDriver: true }).start();
        break;
        
      case "sleep":
        // Sleeping - lying down
        Animated.timing(rotateAnim, { toValue: 90, duration: 500, useNativeDriver: true }).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -3, duration: 2000, useNativeDriver: true }),
            Animated.timing(bounceAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
          ])
        ).start();
        break;
        
      case "play":
        // Playful bouncing
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -20, duration: 200, useNativeDriver: true }),
            Animated.timing(bounceAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(rotateAnim, { toValue: 10, duration: 200, useNativeDriver: true }),
            Animated.timing(rotateAnim, { toValue: -10, duration: 200, useNativeDriver: true }),
          ])
        ).start();
        break;
        
      case "jump":
        // Jump animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(bounceAnim, { toValue: -40, duration: 400, useNativeDriver: true }),
            Animated.timing(bounceAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          ])
        ).start();
        break;
    }
    
    return () => {
      bounceAnim.stopAnimation();
      walkAnim.stopAnimation();
      rotateAnim.stopAnimation();
    };
  }, [animation]);
  
  // Calculate 3D perspective position
  const scale = 1 - position.z * 0.1;
  const translateY = position.z * 20;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.pet3DContainer,
        {
          left: `${50 + position.x * 15}%`,
          bottom: 80 + translateY,
          transform: [{ scale }],
          zIndex: Math.round((1 - position.z) * 10),
        },
      ]}
    >
      <Animated.View
        style={[
          styles.pet3DBody,
          {
            transform: [
              { translateY: bounceAnim },
              { translateX: walkAnim },
              { rotate: rotateAnim.interpolate({
                inputRange: [-90, 90],
                outputRange: ['-90deg', '90deg'],
              })},
            ],
          },
        ]}
      >
        {/* Pet Body - 3D-like shape using multiple layers */}
        <View style={[styles.petBodyMain, { backgroundColor: colors.body }]}>
          {/* Head */}
          <View style={[styles.petHead, { backgroundColor: colors.body }]}>
            {/* Eyes */}
            <View style={styles.petEyeLeft} />
            <View style={styles.petEyeRight} />
            {/* Nose */}
            <View style={styles.petNose} />
            
            {/* Ears based on species */}
            {pet.species === "rabbit" ? (
              <>
                <View style={[styles.rabbitEarLeft, { backgroundColor: colors.body }]} />
                <View style={[styles.rabbitEarRight, { backgroundColor: colors.body }]} />
              </>
            ) : pet.species === "cat" ? (
              <>
                <View style={[styles.catEarLeft, { backgroundColor: colors.body, borderBottomColor: colors.body }]} />
                <View style={[styles.catEarRight, { backgroundColor: colors.body, borderBottomColor: colors.body }]} />
              </>
            ) : pet.species === "dog" ? (
              <>
                <View style={[styles.dogEarLeft, { backgroundColor: colors.accent }]} />
                <View style={[styles.dogEarRight, { backgroundColor: colors.accent }]} />
              </>
            ) : pet.species === "bird" ? (
              <View style={[styles.birdBeak, { borderLeftColor: "#F39C12" }]} />
            ) : null}
          </View>
          
          {/* Legs */}
          <View style={[styles.petLegFrontLeft, { backgroundColor: colors.body }]} />
          <View style={[styles.petLegFrontRight, { backgroundColor: colors.body }]} />
          <View style={[styles.petLegBackLeft, { backgroundColor: colors.body }]} />
          <View style={[styles.petLegBackRight, { backgroundColor: colors.body }]} />
          
          {/* Tail */}
          {pet.species !== "bird" && (
            <View style={[styles.petTail, { backgroundColor: colors.body }]} />
          )}
          
          {/* Wings for bird */}
          {pet.species === "bird" && (
            <>
              <View style={[styles.birdWingLeft, { backgroundColor: colors.accent }]} />
              <View style={[styles.birdWingRight, { backgroundColor: colors.accent }]} />
            </>
          )}
        </View>
        
        {/* Shadow */}
        <View style={styles.petShadow} />
      </Animated.View>
      
      {/* Pet name label */}
      <View style={[styles.petNameLabel, isSelected && styles.petNameLabelSelected]}>
        <Text style={styles.petNameText}>{pet.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Scene decorations
function SceneDecorations({ sceneType }: { sceneType: SceneType }) {
  switch (sceneType) {
    case "park":
      return (
        <>
          {/* Trees */}
          <View style={[styles.tree, { left: "10%" }]}>
            <View style={styles.treeTrunk} />
            <View style={styles.treeLeaves} />
          </View>
          <View style={[styles.tree, { left: "85%" }]}>
            <View style={styles.treeTrunk} />
            <View style={styles.treeLeaves} />
          </View>
          {/* Bench */}
          <View style={styles.bench}>
            <View style={styles.benchSeat} />
            <View style={styles.benchLegLeft} />
            <View style={styles.benchLegRight} />
          </View>
          {/* Flowers */}
          <View style={[styles.flower, { left: "20%", bottom: 60 }]}>
            <Text style={styles.flowerEmoji}>🌸</Text>
          </View>
          <View style={[styles.flower, { left: "70%", bottom: 70 }]}>
            <Text style={styles.flowerEmoji}>🌼</Text>
          </View>
        </>
      );
      
    case "living_room":
      return (
        <>
          {/* Sofa */}
          <View style={styles.sofa}>
            <View style={styles.sofaBack} />
            <View style={styles.sofaSeat} />
          </View>
          {/* Rug */}
          <View style={styles.rug} />
          {/* Lamp */}
          <View style={styles.lamp}>
            <View style={styles.lampShade} />
            <View style={styles.lampStand} />
          </View>
          {/* Pet bed */}
          <View style={styles.petBed} />
        </>
      );
      
    case "beach":
      return (
        <>
          {/* Water */}
          <View style={styles.water} />
          {/* Palm tree */}
          <View style={[styles.palmTree, { left: "15%" }]}>
            <View style={styles.palmTrunk} />
            <Text style={styles.palmLeaves}>🌴</Text>
          </View>
          {/* Umbrella */}
          <View style={styles.umbrella}>
            <View style={styles.umbrellaTop} />
            <View style={styles.umbrellaStand} />
          </View>
          {/* Beach ball */}
          <View style={styles.beachBall}>
            <Text style={styles.beachBallEmoji}>🏐</Text>
          </View>
          {/* Shells */}
          <View style={[styles.shell, { left: "30%", bottom: 55 }]}>
            <Text style={styles.shellEmoji}>🐚</Text>
          </View>
        </>
      );
      
    case "forest":
      return (
        <>
          {/* Pine trees */}
          <View style={[styles.pineTree, { left: "5%" }]}>
            <View style={styles.pineTreeTop} />
            <View style={styles.pineTreeMiddle} />
            <View style={styles.pineTreeBottom} />
            <View style={styles.pineTreeTrunk} />
          </View>
          <View style={[styles.pineTree, { left: "90%" }]}>
            <View style={styles.pineTreeTop} />
            <View style={styles.pineTreeMiddle} />
            <View style={styles.pineTreeBottom} />
            <View style={styles.pineTreeTrunk} />
          </View>
          {/* Mushrooms */}
          <View style={[styles.mushroom, { left: "25%", bottom: 55 }]}>
            <Text style={styles.mushroomEmoji}>🍄</Text>
          </View>
          <View style={[styles.mushroom, { left: "65%", bottom: 60 }]}>
            <Text style={styles.mushroomEmoji}>🍄</Text>
          </View>
          {/* Rocks */}
          <View style={[styles.rock, { left: "40%", bottom: 50 }]} />
        </>
      );
      
    default:
      return null;
  }
}

export function PetWorld3DCanvas({
  pets,
  initialScene = "park",
  onPetInteract,
  isPremium = false,
  onUpgradePress,
}: PetWorld3DCanvasProps) {
  const colors = useColors();
  const [currentScene, setCurrentScene] = useState<SceneType>(initialScene);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(pets[0]?.id || null);
  const [currentAnimation, setCurrentAnimation] = useState<AnimationType>("idle");
  const [showSceneSelector, setShowSceneSelector] = useState(false);
  const [showAnimationSelector, setShowAnimationSelector] = useState(false);
  
  const sceneConfig = SCENES.find(s => s.type === currentScene) || SCENES[0];
  
  const handlePetClick = useCallback((petId: string) => {
    setSelectedPetId(petId);
    onPetInteract?.(petId);
  }, [onPetInteract]);
  
  // Calculate pet positions in a semi-circle
  const getPetPosition = (index: number, total: number) => {
    if (total === 1) return { x: 0, y: 0, z: 0 };
    const angle = (index / (total - 1)) * Math.PI - Math.PI / 2;
    return {
      x: Math.sin(angle) * 1.5,
      y: 0,
      z: Math.cos(angle) * 0.5 + 0.5,
    };
  };
  
  if (pets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyText, { color: colors.foreground }]}>
          尚未新增寵物
        </Text>
        <Text style={[styles.emptySubtext, { color: colors.muted }]}>
          請先新增寵物才能進入 3D 寵物世界
        </Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      {/* Sky */}
      <View style={[styles.sky, { backgroundColor: sceneConfig.skyColor }]} />
      
      {/* Ground with perspective */}
      <View style={[styles.ground, { backgroundColor: sceneConfig.groundColor }]}>
        <View style={[styles.groundGradient, { backgroundColor: sceneConfig.groundColor }]} />
      </View>
      
      {/* Scene decorations */}
      <SceneDecorations sceneType={currentScene} />
      
      {/* 3D Pets */}
      {pets.map((pet, index) => (
        <Pet3DModel
          key={pet.id}
          pet={pet}
          isSelected={selectedPetId === pet.id}
          animation={selectedPetId === pet.id ? currentAnimation : "idle"}
          position={getPetPosition(index, pets.length)}
          onPress={() => handlePetClick(pet.id)}
        />
      ))}
      
      {/* Controls Overlay */}
      <View style={styles.controlsOverlay}>
        {/* Scene Selector Button */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            setShowSceneSelector(!showSceneSelector);
            setShowAnimationSelector(false);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.controlIcon}>{sceneConfig.icon}</Text>
          <Text style={[styles.controlText, { color: colors.foreground }]}>場景</Text>
        </TouchableOpacity>

        {/* Animation Selector Button */}
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => {
            setShowAnimationSelector(!showAnimationSelector);
            setShowSceneSelector(false);
          }}
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
            {isPremium ? "AI" : "PRO"}
          </Text>
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
                onPress={() => {
                  setCurrentScene(scene.type);
                  setShowSceneSelector(false);
                }}
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
                onPress={() => {
                  setCurrentAnimation(anim.id);
                  setShowAnimationSelector(false);
                }}
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
          點擊寵物互動 • 選擇動作讓寵物動起來
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    overflow: "hidden",
  },
  sky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
  },
  ground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    transform: [{ perspective: 500 }, { rotateX: "-10deg" }],
  },
  groundGradient: {
    flex: 1,
    opacity: 0.9,
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
  
  // Pet 3D styles
  pet3DContainer: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -40 }],
  },
  pet3DBody: {
    alignItems: "center",
  },
  petBodyMain: {
    width: 60,
    height: 40,
    borderRadius: 20,
    position: "relative",
  },
  petHead: {
    position: "absolute",
    top: -25,
    left: 35,
    width: 35,
    height: 30,
    borderRadius: 15,
  },
  petEyeLeft: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2C3E50",
  },
  petEyeRight: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2C3E50",
  },
  petNose: {
    position: "absolute",
    top: 16,
    left: "50%",
    marginLeft: -3,
    width: 6,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#1A1A1A",
  },
  
  // Dog ears
  dogEarLeft: {
    position: "absolute",
    top: -8,
    left: 2,
    width: 12,
    height: 18,
    borderRadius: 6,
    transform: [{ rotate: "-20deg" }],
  },
  dogEarRight: {
    position: "absolute",
    top: -8,
    right: 2,
    width: 12,
    height: 18,
    borderRadius: 6,
    transform: [{ rotate: "20deg" }],
  },
  
  // Cat ears
  catEarLeft: {
    position: "absolute",
    top: -12,
    left: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "-15deg" }],
  },
  catEarRight: {
    position: "absolute",
    top: -12,
    right: 2,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    transform: [{ rotate: "15deg" }],
  },
  
  // Rabbit ears
  rabbitEarLeft: {
    position: "absolute",
    top: -30,
    left: 5,
    width: 10,
    height: 35,
    borderRadius: 5,
    transform: [{ rotate: "-10deg" }],
  },
  rabbitEarRight: {
    position: "absolute",
    top: -30,
    right: 5,
    width: 10,
    height: 35,
    borderRadius: 5,
    transform: [{ rotate: "10deg" }],
  },
  
  // Bird beak
  birdBeak: {
    position: "absolute",
    top: 10,
    right: -8,
    width: 0,
    height: 0,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftWidth: 12,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  
  // Bird wings
  birdWingLeft: {
    position: "absolute",
    top: 5,
    left: -10,
    width: 20,
    height: 12,
    borderRadius: 10,
    transform: [{ rotate: "-30deg" }],
  },
  birdWingRight: {
    position: "absolute",
    top: 5,
    right: -10,
    width: 20,
    height: 12,
    borderRadius: 10,
    transform: [{ rotate: "30deg" }],
  },
  
  // Legs
  petLegFrontLeft: {
    position: "absolute",
    bottom: -15,
    left: 8,
    width: 8,
    height: 18,
    borderRadius: 4,
  },
  petLegFrontRight: {
    position: "absolute",
    bottom: -15,
    left: 20,
    width: 8,
    height: 18,
    borderRadius: 4,
  },
  petLegBackLeft: {
    position: "absolute",
    bottom: -15,
    right: 20,
    width: 8,
    height: 18,
    borderRadius: 4,
  },
  petLegBackRight: {
    position: "absolute",
    bottom: -15,
    right: 8,
    width: 8,
    height: 18,
    borderRadius: 4,
  },
  
  // Tail
  petTail: {
    position: "absolute",
    top: 5,
    left: -15,
    width: 20,
    height: 8,
    borderRadius: 4,
    transform: [{ rotate: "-30deg" }],
  },
  
  // Shadow
  petShadow: {
    width: 50,
    height: 10,
    borderRadius: 25,
    backgroundColor: "rgba(0,0,0,0.2)",
    marginTop: 15,
  },
  
  // Pet name label
  petNameLabel: {
    marginTop: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 10,
  },
  petNameLabelSelected: {
    backgroundColor: "#F8B4B4",
  },
  petNameText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  
  // Scene decorations
  tree: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
  },
  treeTrunk: {
    width: 15,
    height: 40,
    backgroundColor: "#8B4513",
    borderRadius: 3,
  },
  treeLeaves: {
    position: "absolute",
    top: -40,
    width: 50,
    height: 60,
    backgroundColor: "#228B22",
    borderRadius: 25,
  },
  
  bench: {
    position: "absolute",
    bottom: 70,
    right: "25%",
  },
  benchSeat: {
    width: 50,
    height: 8,
    backgroundColor: "#8B4513",
    borderRadius: 2,
  },
  benchLegLeft: {
    position: "absolute",
    bottom: -15,
    left: 5,
    width: 6,
    height: 15,
    backgroundColor: "#8B4513",
  },
  benchLegRight: {
    position: "absolute",
    bottom: -15,
    right: 5,
    width: 6,
    height: 15,
    backgroundColor: "#8B4513",
  },
  
  flower: {
    position: "absolute",
  },
  flowerEmoji: {
    fontSize: 20,
  },
  
  // Living room
  sofa: {
    position: "absolute",
    bottom: 80,
    left: "10%",
  },
  sofaBack: {
    width: 80,
    height: 30,
    backgroundColor: "#6B4423",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  sofaSeat: {
    width: 80,
    height: 20,
    backgroundColor: "#8B5A2B",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  rug: {
    position: "absolute",
    bottom: 50,
    left: "30%",
    width: 100,
    height: 60,
    backgroundColor: "#C0392B",
    borderRadius: 30,
    opacity: 0.8,
  },
  lamp: {
    position: "absolute",
    bottom: 80,
    right: "15%",
    alignItems: "center",
  },
  lampShade: {
    width: 30,
    height: 25,
    backgroundColor: "#F1C40F",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  lampStand: {
    width: 8,
    height: 50,
    backgroundColor: "#7F8C8D",
  },
  petBed: {
    position: "absolute",
    bottom: 55,
    right: "35%",
    width: 50,
    height: 20,
    backgroundColor: "#E8D5B7",
    borderRadius: 25,
  },
  
  // Beach
  water: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    height: "20%",
    backgroundColor: "#1E90FF",
    opacity: 0.7,
  },
  palmTree: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  palmTrunk: {
    width: 12,
    height: 60,
    backgroundColor: "#8B4513",
    borderRadius: 3,
  },
  palmLeaves: {
    position: "absolute",
    top: -30,
    fontSize: 50,
  },
  umbrella: {
    position: "absolute",
    bottom: 70,
    right: "30%",
    alignItems: "center",
  },
  umbrellaTop: {
    width: 50,
    height: 25,
    backgroundColor: "#FF6B6B",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  umbrellaStand: {
    width: 6,
    height: 40,
    backgroundColor: "#FFFFFF",
  },
  beachBall: {
    position: "absolute",
    bottom: 60,
    left: "60%",
  },
  beachBallEmoji: {
    fontSize: 25,
  },
  shell: {
    position: "absolute",
  },
  shellEmoji: {
    fontSize: 18,
  },
  
  // Forest
  pineTree: {
    position: "absolute",
    bottom: 80,
    alignItems: "center",
  },
  pineTreeTop: {
    width: 0,
    height: 0,
    borderLeftWidth: 20,
    borderRightWidth: 20,
    borderBottomWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#1B5E20",
  },
  pineTreeMiddle: {
    width: 0,
    height: 0,
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 35,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#2E7D32",
    marginTop: -15,
  },
  pineTreeBottom: {
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 40,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "#388E3C",
    marginTop: -20,
  },
  pineTreeTrunk: {
    width: 15,
    height: 25,
    backgroundColor: "#5D4037",
    marginTop: -5,
  },
  mushroom: {
    position: "absolute",
  },
  mushroomEmoji: {
    fontSize: 22,
  },
  rock: {
    position: "absolute",
    width: 30,
    height: 20,
    backgroundColor: "#7F8C8D",
    borderRadius: 10,
  },
  
  // Controls
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
  },
  controlIcon: {
    fontSize: 18,
  },
  controlText: {
    fontSize: 14,
    fontWeight: "500",
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
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
    width: 70,
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

export default PetWorld3DCanvas;

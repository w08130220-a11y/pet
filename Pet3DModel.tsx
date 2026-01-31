import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, RapierRigidBody, CuboidCollider, BallCollider } from "@react-three/rapier";
import * as THREE from "three";

import { PetSpecies } from "@/types";

interface Pet3DModelProps {
  species: PetSpecies;
  position?: [number, number, number];
  color?: string;
  animation?: "idle" | "walk" | "sit" | "sleep" | "play" | "jump";
  onInteract?: () => void;
  photoUri?: string;
}

// Pet body proportions based on species
const PET_CONFIGS: Record<PetSpecies, {
  bodySize: [number, number, number];
  headSize: number;
  earSize: [number, number, number];
  tailLength: number;
  legHeight: number;
  color: string;
}> = {
  dog: {
    bodySize: [0.8, 0.5, 0.5],
    headSize: 0.35,
    earSize: [0.12, 0.2, 0.05],
    tailLength: 0.4,
    legHeight: 0.3,
    color: "#D4A574",
  },
  cat: {
    bodySize: [0.6, 0.4, 0.35],
    headSize: 0.3,
    earSize: [0.1, 0.15, 0.05],
    tailLength: 0.5,
    legHeight: 0.25,
    color: "#F5A623",
  },
  bird: {
    bodySize: [0.3, 0.35, 0.25],
    headSize: 0.2,
    earSize: [0.05, 0.1, 0.02],
    tailLength: 0.2,
    legHeight: 0.15,
    color: "#4ECDC4",
  },
  rabbit: {
    bodySize: [0.5, 0.4, 0.35],
    headSize: 0.28,
    earSize: [0.08, 0.35, 0.04],
    tailLength: 0.1,
    legHeight: 0.2,
    color: "#FFFFFF",
  },
  other: {
    bodySize: [0.5, 0.4, 0.4],
    headSize: 0.3,
    earSize: [0.1, 0.12, 0.05],
    tailLength: 0.3,
    legHeight: 0.25,
    color: "#95A5A6",
  },
};

// Animation states
type AnimationState = {
  bodyRotation: THREE.Euler;
  headRotation: THREE.Euler;
  tailRotation: number;
  legOffset: number;
  bounceOffset: number;
};

export function Pet3DModel({
  species,
  position = [0, 1, 0],
  color,
  animation = "idle",
  onInteract,
}: Pet3DModelProps) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const groupRef = useRef<THREE.Group>(null);
  const config = PET_CONFIGS[species];
  const petColor = color || config.color;

  // Animation state
  const animState = useRef<AnimationState>({
    bodyRotation: new THREE.Euler(0, 0, 0),
    headRotation: new THREE.Euler(0, 0, 0),
    tailRotation: 0,
    legOffset: 0,
    bounceOffset: 0,
  });

  // Animation loop
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;
    const anim = animState.current;

    switch (animation) {
      case "idle":
        // Gentle breathing animation
        anim.bounceOffset = Math.sin(time * 2) * 0.02;
        anim.tailRotation = Math.sin(time * 3) * 0.3;
        anim.headRotation.y = Math.sin(time * 0.5) * 0.1;
        break;

      case "walk":
        // Walking animation
        anim.legOffset = Math.sin(time * 8) * 0.1;
        anim.bounceOffset = Math.abs(Math.sin(time * 8)) * 0.05;
        anim.tailRotation = Math.sin(time * 4) * 0.5;
        anim.bodyRotation.z = Math.sin(time * 8) * 0.05;
        break;

      case "sit":
        // Sitting pose
        anim.bodyRotation.x = -0.2;
        anim.bounceOffset = Math.sin(time * 2) * 0.01;
        anim.tailRotation = Math.sin(time * 2) * 0.2;
        break;

      case "sleep":
        // Sleeping animation
        anim.bodyRotation.z = Math.PI / 2;
        anim.bounceOffset = Math.sin(time * 1) * 0.02;
        break;

      case "play":
        // Playful bouncing
        anim.bounceOffset = Math.abs(Math.sin(time * 6)) * 0.15;
        anim.tailRotation = Math.sin(time * 10) * 0.8;
        anim.headRotation.x = Math.sin(time * 4) * 0.15;
        anim.legOffset = Math.sin(time * 6) * 0.15;
        break;

      case "jump":
        // Jump animation
        anim.bounceOffset = Math.abs(Math.sin(time * 4)) * 0.3;
        anim.legOffset = -0.1;
        anim.tailRotation = Math.sin(time * 8) * 0.6;
        break;
    }

    // Apply animations to group
    if (groupRef.current) {
      groupRef.current.position.y = anim.bounceOffset;
      groupRef.current.rotation.z = anim.bodyRotation.z;
    }
  });

  // Materials
  const bodyMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: petColor, roughness: 0.8 }),
    [petColor]
  );

  const eyeMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#2C3E50", roughness: 0.3 }),
    []
  );

  const noseMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#1A1A1A", roughness: 0.5 }),
    []
  );

  const handleClick = () => {
    // Apply impulse when clicked
    if (rigidBodyRef.current) {
      rigidBodyRef.current.applyImpulse({ x: 0, y: 3, z: 0 }, true);
    }
    onInteract?.();
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      position={position}
      colliders={false}
      mass={1}
      linearDamping={0.5}
      angularDamping={0.8}
    >
      <CuboidCollider args={[config.bodySize[0] / 2, config.bodySize[1] / 2 + config.legHeight, config.bodySize[2] / 2]} />
      
      <group ref={groupRef} onClick={handleClick}>
        {/* Body */}
        <mesh material={bodyMaterial} castShadow receiveShadow>
          <capsuleGeometry args={[config.bodySize[1] / 2, config.bodySize[0] - config.bodySize[1], 8, 16]} />
          <meshStandardMaterial color={petColor} />
        </mesh>

        {/* Head */}
        <group position={[config.bodySize[0] / 2 + config.headSize * 0.3, config.bodySize[1] * 0.3, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[config.headSize, 16, 16]} />
            <meshStandardMaterial color={petColor} />
          </mesh>

          {/* Eyes */}
          <mesh position={[config.headSize * 0.5, config.headSize * 0.2, config.headSize * 0.4]} material={eyeMaterial}>
            <sphereGeometry args={[config.headSize * 0.15, 8, 8]} />
          </mesh>
          <mesh position={[config.headSize * 0.5, config.headSize * 0.2, -config.headSize * 0.4]} material={eyeMaterial}>
            <sphereGeometry args={[config.headSize * 0.15, 8, 8]} />
          </mesh>

          {/* Nose */}
          <mesh position={[config.headSize * 0.9, 0, 0]} material={noseMaterial}>
            <sphereGeometry args={[config.headSize * 0.1, 8, 8]} />
          </mesh>

          {/* Ears */}
          {species !== "bird" && (
            <>
              <mesh
                position={[0, config.headSize * 0.7, config.headSize * 0.5]}
                rotation={[0, 0, species === "rabbit" ? 0 : 0.3]}
                castShadow
              >
                <boxGeometry args={config.earSize} />
                <meshStandardMaterial color={petColor} />
              </mesh>
              <mesh
                position={[0, config.headSize * 0.7, -config.headSize * 0.5]}
                rotation={[0, 0, species === "rabbit" ? 0 : -0.3]}
                castShadow
              >
                <boxGeometry args={config.earSize} />
                <meshStandardMaterial color={petColor} />
              </mesh>
            </>
          )}

          {/* Bird beak */}
          {species === "bird" && (
            <mesh position={[config.headSize * 0.8, -config.headSize * 0.1, 0]} rotation={[0, 0, -0.3]}>
              <coneGeometry args={[0.05, 0.15, 8]} />
              <meshStandardMaterial color="#F39C12" />
            </mesh>
          )}
        </group>

        {/* Legs */}
        {species !== "bird" ? (
          <>
            {/* Front legs */}
            <mesh position={[config.bodySize[0] * 0.3, -config.bodySize[1] / 2 - config.legHeight / 2, config.bodySize[2] * 0.3]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, config.legHeight, 8]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
            <mesh position={[config.bodySize[0] * 0.3, -config.bodySize[1] / 2 - config.legHeight / 2, -config.bodySize[2] * 0.3]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, config.legHeight, 8]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
            {/* Back legs */}
            <mesh position={[-config.bodySize[0] * 0.3, -config.bodySize[1] / 2 - config.legHeight / 2, config.bodySize[2] * 0.3]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, config.legHeight, 8]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
            <mesh position={[-config.bodySize[0] * 0.3, -config.bodySize[1] / 2 - config.legHeight / 2, -config.bodySize[2] * 0.3]} castShadow>
              <cylinderGeometry args={[0.06, 0.06, config.legHeight, 8]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
          </>
        ) : (
          <>
            {/* Bird legs */}
            <mesh position={[0, -config.bodySize[1] / 2 - config.legHeight / 2, config.bodySize[2] * 0.2]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, config.legHeight, 8]} />
              <meshStandardMaterial color="#F39C12" />
            </mesh>
            <mesh position={[0, -config.bodySize[1] / 2 - config.legHeight / 2, -config.bodySize[2] * 0.2]} castShadow>
              <cylinderGeometry args={[0.02, 0.02, config.legHeight, 8]} />
              <meshStandardMaterial color="#F39C12" />
            </mesh>
          </>
        )}

        {/* Tail */}
        <mesh
          position={[-config.bodySize[0] / 2 - config.tailLength / 2, config.bodySize[1] * 0.2, 0]}
          rotation={[0, 0, 0.5]}
          castShadow
        >
          {species === "bird" ? (
            <coneGeometry args={[0.08, config.tailLength, 8]} />
          ) : (
            <capsuleGeometry args={[0.05, config.tailLength, 4, 8]} />
          )}
          <meshStandardMaterial color={petColor} />
        </mesh>

        {/* Wings for bird */}
        {species === "bird" && (
          <>
            <mesh position={[0, config.bodySize[1] * 0.1, config.bodySize[2] / 2 + 0.1]} rotation={[0, 0, 0.3]} castShadow>
              <boxGeometry args={[0.2, 0.02, 0.15]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
            <mesh position={[0, config.bodySize[1] * 0.1, -config.bodySize[2] / 2 - 0.1]} rotation={[0, 0, -0.3]} castShadow>
              <boxGeometry args={[0.2, 0.02, 0.15]} />
              <meshStandardMaterial color={petColor} />
            </mesh>
          </>
        )}
      </group>
    </RigidBody>
  );
}

export default Pet3DModel;

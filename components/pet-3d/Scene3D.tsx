import React, { Suspense, useMemo } from "react";
import { RigidBody, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";

export type SceneType = "park" | "living_room" | "beach" | "forest";

interface Scene3DProps {
  sceneType: SceneType;
}

// Scene configurations
const SCENE_CONFIGS: Record<SceneType, {
  groundColor: string;
  skyColor: string;
  ambientIntensity: number;
  sunPosition: [number, number, number];
  fogColor: string;
  fogDensity: number;
}> = {
  park: {
    groundColor: "#4CAF50",
    skyColor: "#87CEEB",
    ambientIntensity: 0.6,
    sunPosition: [10, 20, 10],
    fogColor: "#87CEEB",
    fogDensity: 0.02,
  },
  living_room: {
    groundColor: "#8B7355",
    skyColor: "#FFF8DC",
    ambientIntensity: 0.8,
    sunPosition: [5, 10, 5],
    fogColor: "#FFF8DC",
    fogDensity: 0.01,
  },
  beach: {
    groundColor: "#F4D03F",
    skyColor: "#5DADE2",
    ambientIntensity: 0.7,
    sunPosition: [15, 25, 10],
    fogColor: "#5DADE2",
    fogDensity: 0.015,
  },
  forest: {
    groundColor: "#2E7D32",
    skyColor: "#81C784",
    ambientIntensity: 0.4,
    sunPosition: [5, 15, 5],
    fogColor: "#81C784",
    fogDensity: 0.03,
  },
};

// Ground component with physics
function Ground({ color }: { color: string }) {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider args={[50, 0.5, 50]} position={[0, -0.5, 0]} />
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

// Park decorations
function ParkDecorations() {
  const treePositions = useMemo(() => [
    [-5, 0, -5],
    [5, 0, -8],
    [-8, 0, 3],
    [7, 0, 5],
    [-3, 0, 8],
  ], []);

  return (
    <>
      {/* Trees */}
      {treePositions.map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          {/* Trunk */}
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[0.2, 1, 0.2]} position={[0, 1, 0]} />
            <mesh castShadow position={[0, 1, 0]}>
              <cylinderGeometry args={[0.2, 0.3, 2, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
          {/* Leaves */}
          <mesh castShadow position={[0, 3, 0]}>
            <coneGeometry args={[1.2, 2.5, 8]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
      ))}

      {/* Bench */}
      <RigidBody type="fixed" colliders={false} position={[3, 0, 0]}>
        <CuboidCollider args={[1, 0.3, 0.3]} position={[0, 0.5, 0]} />
        <mesh castShadow position={[0, 0.5, 0]}>
          <boxGeometry args={[2, 0.1, 0.6]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh castShadow position={[-0.8, 0.25, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        <mesh castShadow position={[0.8, 0.25, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </RigidBody>

      {/* Flowers */}
      {[...Array(10)].map((_, i) => (
        <mesh
          key={`flower-${i}`}
          position={[
            Math.random() * 10 - 5,
            0.1,
            Math.random() * 10 - 5,
          ]}
          castShadow
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color={["#FF6B6B", "#FFE66D", "#4ECDC4", "#FF69B4"][i % 4]} />
        </mesh>
      ))}
    </>
  );
}

// Living room decorations
function LivingRoomDecorations() {
  return (
    <>
      {/* Sofa */}
      <RigidBody type="fixed" colliders={false} position={[-4, 0, 0]}>
        <CuboidCollider args={[1.5, 0.4, 0.5]} position={[0, 0.4, 0]} />
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[3, 0.8, 1]} />
          <meshStandardMaterial color="#6B4423" />
        </mesh>
        <mesh castShadow position={[0, 0.9, -0.4]}>
          <boxGeometry args={[3, 0.6, 0.2]} />
          <meshStandardMaterial color="#6B4423" />
        </mesh>
      </RigidBody>

      {/* Coffee table */}
      <RigidBody type="fixed" colliders={false} position={[0, 0, 0]}>
        <CuboidCollider args={[0.6, 0.25, 0.4]} position={[0, 0.25, 0]} />
        <mesh castShadow position={[0, 0.25, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.8]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
        {/* Table legs */}
        {[[-0.5, 0.1, -0.3], [0.5, 0.1, -0.3], [-0.5, 0.1, 0.3], [0.5, 0.1, 0.3]].map((pos, i) => (
          <mesh key={i} castShadow position={pos as [number, number, number]}>
            <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        ))}
      </RigidBody>

      {/* Rug */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial color="#C0392B" />
      </mesh>

      {/* Pet bed */}
      <RigidBody type="fixed" colliders={false} position={[4, 0, -2]}>
        <CuboidCollider args={[0.5, 0.1, 0.5]} position={[0, 0.1, 0]} />
        <mesh castShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.6, 0.7, 0.2, 16]} />
          <meshStandardMaterial color="#E8D5B7" />
        </mesh>
      </RigidBody>

      {/* Walls */}
      <mesh position={[0, 2.5, -6]} receiveShadow>
        <planeGeometry args={[20, 5]} />
        <meshStandardMaterial color="#FFF8DC" />
      </mesh>
    </>
  );
}

// Beach decorations
function BeachDecorations() {
  return (
    <>
      {/* Water */}
      <mesh position={[0, 0.02, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[100, 10]} />
        <meshStandardMaterial color="#1E90FF" transparent opacity={0.8} />
      </mesh>

      {/* Palm trees */}
      {[[-6, 0, 2], [6, 0, 3], [-3, 0, 5]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[0.15, 1.5, 0.15]} position={[0, 1.5, 0]} />
            <mesh castShadow position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.15, 0.2, 3, 8]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          </RigidBody>
          {/* Palm leaves */}
          {[0, 1, 2, 3, 4].map((j) => (
            <mesh
              key={j}
              castShadow
              position={[Math.cos(j * 1.2) * 0.5, 3.2, Math.sin(j * 1.2) * 0.5]}
              rotation={[0.5, j * 1.2, 0]}
            >
              <boxGeometry args={[1.5, 0.05, 0.3]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          ))}
        </group>
      ))}

      {/* Beach umbrella */}
      <group position={[2, 0, 1]}>
        <mesh castShadow position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 3, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        <mesh castShadow position={[0, 2.8, 0]}>
          <coneGeometry args={[1.2, 0.5, 8]} />
          <meshStandardMaterial color="#FF6B6B" />
        </mesh>
      </group>

      {/* Beach ball */}
      <RigidBody colliders="ball" position={[-2, 0.3, 2]} restitution={0.8}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>
      </RigidBody>

      {/* Shells */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={`shell-${i}`}
          position={[Math.random() * 8 - 4, 0.02, Math.random() * 6 - 2]}
          rotation={[0, Math.random() * Math.PI, 0]}
        >
          <torusGeometry args={[0.08, 0.03, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#FFF5EE" />
        </mesh>
      ))}
    </>
  );
}

// Forest decorations
function ForestDecorations() {
  const treePositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    for (let i = 0; i < 15; i++) {
      positions.push([
        Math.random() * 16 - 8,
        0,
        Math.random() * 16 - 8,
      ]);
    }
    return positions;
  }, []);

  return (
    <>
      {/* Dense trees */}
      {treePositions.map((pos, i) => (
        <group key={i} position={pos}>
          <RigidBody type="fixed" colliders={false}>
            <CuboidCollider args={[0.25, 1.5, 0.25]} position={[0, 1.5, 0]} />
            <mesh castShadow position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.2, 0.35, 3, 8]} />
              <meshStandardMaterial color="#5D4037" />
            </mesh>
          </RigidBody>
          {/* Multiple layers of leaves */}
          {[0, 0.8, 1.6].map((y, j) => (
            <mesh key={j} castShadow position={[0, 3.5 + y, 0]}>
              <coneGeometry args={[1.5 - j * 0.3, 1.5, 8]} />
              <meshStandardMaterial color={j === 0 ? "#1B5E20" : "#2E7D32"} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Mushrooms */}
      {[...Array(6)].map((_, i) => (
        <group key={`mushroom-${i}`} position={[Math.random() * 6 - 3, 0, Math.random() * 6 - 3]}>
          <mesh castShadow position={[0, 0.1, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.2, 8]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
          <mesh castShadow position={[0, 0.25, 0]}>
            <sphereGeometry args={[0.1, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#E74C3C" : "#8E44AD"} />
          </mesh>
        </group>
      ))}

      {/* Rocks */}
      {[...Array(5)].map((_, i) => (
        <RigidBody key={`rock-${i}`} type="fixed" colliders="hull" position={[Math.random() * 8 - 4, 0.2, Math.random() * 8 - 4]}>
          <mesh castShadow>
            <dodecahedronGeometry args={[0.3 + Math.random() * 0.2, 0]} />
            <meshStandardMaterial color="#7F8C8D" />
          </mesh>
        </RigidBody>
      ))}

      {/* Fallen log */}
      <RigidBody type="fixed" colliders={false} position={[0, 0.2, 3]} rotation={[0, 0.5, Math.PI / 2]}>
        <CuboidCollider args={[0.2, 1, 0.2]} />
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.25, 2, 8]} />
          <meshStandardMaterial color="#5D4037" />
        </mesh>
      </RigidBody>
    </>
  );
}

export function Scene3D({ sceneType }: Scene3DProps) {
  const config = SCENE_CONFIGS[sceneType];

  return (
    <Suspense fallback={null}>
      {/* Lighting */}
      <ambientLight intensity={config.ambientIntensity} />
      <directionalLight
        position={config.sunPosition}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Sky color */}
      <color attach="background" args={[config.skyColor]} />

      {/* Fog */}
      <fog attach="fog" args={[config.fogColor, 10, 50]} />

      {/* Ground */}
      <Ground color={config.groundColor} />

      {/* Scene-specific decorations */}
      {sceneType === "park" && <ParkDecorations />}
      {sceneType === "living_room" && <LivingRoomDecorations />}
      {sceneType === "beach" && <BeachDecorations />}
      {sceneType === "forest" && <ForestDecorations />}
    </Suspense>
  );
}

export default Scene3D;

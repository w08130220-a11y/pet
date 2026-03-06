'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Scene } from '@/lib/types';

const scenes: Scene[] = [
  { id: 'park', name: '公園', emoji: '🌳' },
  { id: 'living', name: '客廳', emoji: '🛋️' },
  { id: 'beach', name: '海灘', emoji: '🏖️' },
  { id: 'forest', name: '森林', emoji: '🌲' },
];

const petActions = ['走路 🚶', '坐下 🪑', '睡覺 💤', '玩耍 🎾'];

export default function PetWorld() {
  const { pets, activePetId } = useAppStore();
  const [activeScene, setActiveScene] = useState(scenes[0]);
  const [currentAction, setCurrentAction] = useState('待機 ✨');
  const activePet = pets.find(p => p.id === activePetId) || pets[0];

  const triggerAction = () => {
    const action = petActions[Math.floor(Math.random() * petActions.length)];
    setCurrentAction(action);
    setTimeout(() => setCurrentAction('待機 ✨'), 3000);
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-[32px] font-bold font-heading tracking-tight" style={{ color: 'var(--color-black)' }}>
          寵物世界
        </h1>
        <p className="text-body mt-1">點擊寵物觸發互動，切換不同場景</p>
      </div>

      {/* Scene */}
      <div className="mx-5 rounded-2xl overflow-hidden relative" style={{ height: '320px', background: 'var(--color-cream)' }}>
        {/* Scene bg */}
        <div className="absolute inset-0 flex items-center justify-center text-[120px] opacity-30">
          {activeScene.emoji}
        </div>

        {/* Pet */}
        <button
          onClick={triggerAction}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-lg"
            style={{ background: 'var(--color-surface-white)' }}
          >
            {activePet.species === 'dog' ? '🐕' : '🐱'}
          </div>
          <span className="badge">{activePet.name}</span>
        </button>

        {/* Action indicator */}
        <div className="absolute bottom-4 left-4">
          <span className="chip chip-active text-[12px]">{currentAction}</span>
        </div>
      </div>

      {/* Scene picker */}
      <div className="px-5 mt-5">
        <p className="text-ui mb-3">場景選擇</p>
        <div className="flex gap-2">
          {scenes.map(scene => (
            <button
              key={scene.id}
              onClick={() => setActiveScene(scene)}
              className={`chip ${activeScene.id === scene.id ? 'chip-active' : ''}`}
            >
              {scene.emoji} {scene.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pet selector */}
      <div className="px-5 mt-5">
        <p className="text-ui mb-3">我的寵物</p>
        <div className="flex gap-3">
          {pets.map(pet => (
            <div
              key={pet.id}
              className={`card p-3 flex items-center gap-3 cursor-pointer ${
                pet.id === activePetId ? 'ring-2' : ''
              }`}
              style={pet.id === activePetId ? { borderColor: 'var(--color-olive-dark)' } : undefined}
            >
              <span className="text-2xl">{pet.species === 'dog' ? '🐕' : '🐱'}</span>
              <div>
                <p className="text-ui text-[13px]">{pet.name}</p>
                <p className="text-label text-[11px]">{pet.breed}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

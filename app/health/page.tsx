'use client';

import { useAppStore } from '@/lib/store';

export default function Health() {
  const { pets, meals, activePetId } = useAppStore();
  const activePet = pets.find(p => p.id === activePetId) || pets[0];
  const petMeals = meals.filter(m => m.petId === activePetId);
  const totalCalories = petMeals.reduce((sum, m) => sum + m.calories, 0);
  const targetCalories = Math.round(activePet.weight * 70); // 簡易計算

  const progress = Math.min((totalCalories / targetCalories) * 100, 100);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-[32px] font-bold font-heading tracking-tight" style={{ color: 'var(--color-black)' }}>
          健康
        </h1>
        <p className="text-body mt-1">{activePet.name} 的飲食與健康追蹤</p>
      </div>

      {/* Calorie Summary Card */}
      <div className="mx-5 card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-ui">今日熱量</p>
          <span className="badge-light badge">{activePet.name}</span>
        </div>

        {/* Progress ring (simplified as bar) */}
        <div className="flex items-end gap-4 mb-4">
          <div>
            <p className="font-heading text-[48px] font-bold leading-none" style={{ color: 'var(--color-olive-dark)' }}>
              {totalCalories}
            </p>
            <p className="text-label mt-1">/ {targetCalories} kcal</p>
          </div>
          <div className="flex-1">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-cream)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progress}%`,
                  background: progress > 90 ? 'var(--color-warning)' : 'var(--color-olive-dark)',
                }}
              />
            </div>
            <p className="text-label text-[11px] mt-1 text-right">{Math.round(progress)}%</p>
          </div>
        </div>

        <button className="btn-filled w-full text-center justify-center">
          + 新增飲食紀錄
        </button>
      </div>

      {/* AI Suggestion */}
      <div className="mx-5 card p-5 mb-4" style={{ background: 'var(--color-olive-light)' }}>
        <p className="text-ui mb-2">🤖 AI 建議</p>
        <p className="text-body" style={{ color: 'var(--color-olive-dark)' }}>
          {activePet.name} 今日已攝取 {totalCalories} kcal，
          {totalCalories < targetCalories
            ? `還可以再攝取 ${targetCalories - totalCalories} kcal。建議傍晚補充適量的蛋白質食物。`
            : '已達到每日建議攝取量，建議增加 30 分鐘的散步運動。'}
        </p>
      </div>

      {/* Meal Records */}
      <div className="px-5">
        <p className="text-ui mb-3">今日飲食紀錄</p>
        <div className="flex flex-col gap-2">
          {petMeals.map(meal => (
            <div key={meal.id} className="card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                  style={{ background: 'var(--color-cream)' }}
                >
                  🍽️
                </div>
                <div>
                  <p className="text-ui text-[13px]">{meal.foodType}</p>
                  <p className="text-label text-[11px]">{meal.amount}g · {meal.mealTime}</p>
                </div>
              </div>
              <p className="text-keypoint text-[14px]" style={{ color: 'var(--color-olive-dark)' }}>
                {meal.calories} kcal
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise Suggestion */}
      <div className="mx-5 mt-4 card p-4 flex items-center gap-3">
        <span className="text-2xl">🏃</span>
        <div>
          <p className="text-ui text-[13px]">運動建議</p>
          <p className="text-body text-[12px]">
            依據 {activePet.breed} 的品種特性，建議每日散步 40-60 分鐘
          </p>
        </div>
      </div>
    </div>
  );
}

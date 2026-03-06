'use client';

import { useAppStore } from '@/lib/store';

export default function Profile() {
  const { pets, medical } = useAppStore();

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
            style={{ background: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
          >
            U
          </div>
          <div>
            <h1 className="text-[24px] font-bold font-heading" style={{ color: 'var(--color-black)' }}>
              使用者
            </h1>
            <p className="text-label">{pets.length} 隻寵物</p>
          </div>
        </div>
      </div>

      <hr className="divider mx-5 mb-5" />

      {/* My Pets */}
      <div className="px-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-ui">我的寵物</p>
          <button className="btn-outline text-[12px] py-1.5 px-4">+ 新增</button>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {pets.map(pet => (
            <div key={pet.id} className="card p-4 min-w-[160px] flex flex-col items-center gap-2">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                style={{ background: 'var(--color-cream)' }}
              >
                {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐱' : '🐾'}
              </div>
              <p className="text-ui text-[14px]">{pet.name}</p>
              <p className="text-label text-[12px]">{pet.breed}</p>
              <div className="flex gap-2 mt-1">
                <span className="chip text-[10px] py-0.5 px-2">{pet.weight} kg</span>
                <span className="chip text-[10px] py-0.5 px-2">
                  {Math.floor((Date.now() - new Date(pet.birthDate).getTime()) / (365.25 * 86400000))} 歲
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Medical Records */}
      <div className="px-5 mb-6">
        <p className="text-ui mb-3">近期醫療紀錄</p>
        <div className="flex flex-col gap-2">
          {medical.map(record => (
            <div key={record.id} className="card p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{
                  background: record.type === 'vaccine' ? 'var(--color-olive-light)' : 'var(--color-cream)',
                }}
              >
                {record.type === 'vaccine' ? '💉' : record.type === 'checkup' ? '🩺' : '📋'}
              </div>
              <div className="flex-1">
                <p className="text-ui text-[13px]">{record.title}</p>
                <p className="text-label text-[11px]">{record.date} · {record.veterinarian}</p>
              </div>
              {record.nextDueDate && (
                <span className="badge text-[9px]">
                  下次 {record.nextDueDate}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-5">
        <p className="text-ui mb-3">設定</p>
        <div className="card overflow-hidden">
          {['醫療紀錄管理', '通知設定', '帳號設定', '關於 PetLife'].map((item, i, arr) => (
            <button
              key={item}
              className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors hover:bg-cream/50 ${
                i < arr.length - 1 ? 'border-b' : ''
              }`}
              style={{ borderColor: 'var(--color-border)' }}
            >
              <span className="text-ui text-[13px] font-medium">{item}</span>
              <span style={{ color: 'var(--color-gray)' }}>›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

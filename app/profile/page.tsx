'use client';

import { useAppStore } from '@/lib/store';

export default function Profile() {
  const { stylists, bookings } = useAppStore();
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalSpent = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0);

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
            <p className="text-label">美容愛好者</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-5 grid grid-cols-3 gap-3">
        {[
          { label: '完成預約', value: completedCount, unit: '次' },
          { label: '總消費', value: `$${totalSpent}`, unit: '' },
          { label: '收藏', value: stylists.length, unit: '位' },
        ].map(stat => (
          <div key={stat.label} className="card p-3 flex flex-col items-center gap-1">
            <p className="font-heading text-[20px] font-bold" style={{ color: 'var(--color-olive-dark)' }}>
              {stat.value}{stat.unit}
            </p>
            <p className="text-label text-[11px]">{stat.label}</p>
          </div>
        ))}
      </div>

      <hr className="divider mx-5 mb-5" />

      {/* Favorite Stylists */}
      <div className="px-5 mb-6">
        <p className="text-ui mb-3">收藏的美容師</p>
        <div className="flex flex-col gap-2">
          {stylists.slice(0, 3).map(s => (
            <div key={s.id} className="card p-4 flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                style={{ background: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
              >
                {s.name.split(' ')[0][0]}
              </div>
              <div className="flex-1">
                <p className="text-ui text-[14px]">{s.name}</p>
                <p className="text-label text-[12px]">{s.salon}</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[12px]">⭐ {s.rating}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-5">
        <p className="text-ui mb-3">設定</p>
        <div className="card overflow-hidden">
          {['消費紀錄', '評價管理', '通知設定', '帳號設定', '關於 BeautyBook'].map((item, i, arr) => (
            <button
              key={item}
              className={`w-full text-left px-4 py-3.5 flex items-center justify-between transition-colors ${
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

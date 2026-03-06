'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';

const statusTabs = [
  { key: 'upcoming', label: '即將到來' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
] as const;

const statusStyles: Record<string, { bg: string; color: string; label: string }> = {
  upcoming: { bg: 'var(--color-olive-light)', color: 'var(--color-olive-dark)', label: '即將到來' },
  completed: { bg: '#E8F5E9', color: '#2E7D32', label: '已完成' },
  cancelled: { bg: '#FFF3E0', color: '#E65100', label: '已取消' },
};

export default function MyBookings() {
  const { bookings, cancelBooking } = useAppStore();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');

  const filtered = bookings.filter(b => b.status === activeTab);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-[32px] font-bold font-heading tracking-tight" style={{ color: 'var(--color-black)' }}>
          我的預約
        </h1>
        <p className="text-body mt-1">管理你的所有預約</p>
      </div>

      {/* Status Tabs */}
      <div className="px-5 mb-5 flex gap-2">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`chip ${activeTab === tab.key ? 'chip-active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Booking Cards */}
      <div className="px-5 flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="card p-8 flex flex-col items-center gap-2">
            <span className="text-3xl">📭</span>
            <p className="text-body">目前沒有{statusStyles[activeTab].label}的預約</p>
          </div>
        )}

        {filtered.map(booking => {
          const style = statusStyles[booking.status];
          return (
            <div key={booking.id} className="card p-4">
              {/* Status badge */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[11px] font-semibold px-3 py-1 rounded-full"
                  style={{ background: style.bg, color: style.color }}
                >
                  {style.label}
                </span>
                <p className="text-label text-[12px]">{booking.date}</p>
              </div>

              {/* Info */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                  style={{ background: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
                >
                  {booking.stylistName.split(' ')[0][0]}
                </div>
                <div className="flex-1">
                  <p className="text-ui text-[14px]">{booking.stylistName}</p>
                  <p className="text-label text-[12px]">{booking.serviceName} · {booking.duration} 分鐘</p>
                </div>
                <p className="text-keypoint font-bold" style={{ color: 'var(--color-olive-dark)' }}>
                  ${booking.price}
                </p>
              </div>

              {/* Time */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                style={{ background: 'var(--color-cream)' }}
              >
                <span className="text-[14px]">🕐</span>
                <p className="text-[13px] font-medium" style={{ color: 'var(--color-black)' }}>
                  {booking.date} {booking.time}
                </p>
              </div>

              {/* Actions */}
              {booking.status === 'upcoming' && (
                <div className="flex gap-2">
                  <button className="btn-outline flex-1 text-center justify-center text-[13px]">
                    改期
                  </button>
                  <button
                    onClick={() => cancelBooking(booking.id)}
                    className="btn-outline flex-1 text-center justify-center text-[13px]"
                    style={{ borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                  >
                    取消預約
                  </button>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="flex items-center justify-between">
                  {booking.rating ? (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="text-[14px]">
                          {i < (booking.rating || 0) ? '⭐' : '☆'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <button className="btn-filled text-[13px] py-2">
                      給予評價
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

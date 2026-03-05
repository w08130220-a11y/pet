'use client';

import { useAppStore } from '@/lib/store';

export default function ProfilePage() {
  const { state, dispatch } = useAppStore();

  const totalBookings = state.bookings.length;
  const completedBookings = state.bookings.filter((b) => b.status === 'completed').length;
  const totalReviews = state.reviews.length;
  const totalFavorites = state.favorites.length;

  const menuItems = [
    { icon: '📋', label: '預約紀錄', value: `${totalBookings} 筆` },
    { icon: '👍', label: '我的評價', value: `${totalReviews} 則` },
    { icon: '❤️', label: '收藏店家', value: `${totalFavorites} 間` },
    { icon: '🎫', label: '優惠券', value: '0 張' },
  ];

  const settingsItems = [
    { icon: '🔔', label: '通知設定' },
    { icon: '💳', label: '付款方式' },
    { icon: '🔒', label: '隱私設定' },
    { icon: '❓', label: '使用說明' },
    { icon: '💬', label: '意見回饋' },
    { icon: '📄', label: '服務條款' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f0f4ed' }}>
      {/* Area Hero Header */}
      <div className="area-hero px-6 pt-12 pb-6">
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: '#f0f4ed',
          letterSpacing: '-0.03em',
          position: 'relative',
          zIndex: 1,
          marginBottom: 4,
        }}>
          我的
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'rgba(240,244,237,0.6)',
          position: 'relative',
          zIndex: 1,
        }}>
          個人資料與設定
        </p>
      </div>

      <div className="px-5 pt-4">
        {/* Avatar & Info */}
        <div className="flex items-center mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mr-3.5" style={{ background: 'rgba(200,216,194,0.4)' }}>
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <p className="text-lg font-semibold" style={{ color: '#1a1a18' }}>使用者</p>
            <p style={{ fontSize: 13, color: '#8a8a80' }}>
              {state.userRole === 'provider' ? '業者帳號' : '一般會員'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="area-card p-4 flex mb-6">
          {[
            { label: '已預約', value: totalBookings },
            { label: '已完成', value: completedBookings },
            { label: '已評價', value: totalReviews },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`flex-1 text-center ${i > 0 ? '' : ''}`}
              style={i > 0 ? { borderLeft: '1px solid #e8ede6' } : undefined}
            >
              <p className="text-xl font-bold mb-0.5" style={{ color: '#1a1a18' }}>{stat.value}</p>
              <p style={{ fontSize: 12, color: '#8a8a80' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mb-6">
          <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 8 }}>我的紀錄</p>
          <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e8ede6' }}>
            {menuItems.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={i > 0 ? { borderTop: '1px solid #e8ede6' } : undefined}
              >
                <div className="flex items-center">
                  <span className="text-base mr-2.5">{item.icon}</span>
                  <span style={{ fontSize: 15, color: '#1a1a18' }}>{item.label}</span>
                </div>
                <div className="flex items-center">
                  <span style={{ fontSize: 13, color: '#8a8a80', marginRight: 6 }}>{item.value}</span>
                  <span style={{ fontSize: 12, color: '#8a8a80' }}>›</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="mb-6">
          <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 8 }}>設定</p>
          <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #e8ede6' }}>
            {settingsItems.map((item, i) => (
              <div
                key={item.label}
                className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
                style={i > 0 ? { borderTop: '1px solid #e8ede6' } : undefined}
              >
                <div className="flex items-center">
                  <span className="text-base mr-2.5">{item.icon}</span>
                  <span style={{ fontSize: 15, color: '#1a1a18' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 12, color: '#8a8a80' }}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* Role Switch */}
        <div className="mb-6">
          <button
            onClick={() => dispatch({
              type: 'SET_ROLE',
              payload: state.userRole === 'customer' ? 'provider' : 'customer',
            })}
            className="w-full rounded-full py-3.5 text-sm font-medium transition-all"
            style={{ border: '1.5px solid #4a6741', color: '#4a6741', background: 'transparent' }}
          >
            {state.userRole === 'customer' ? '切換為業者模式' : '切換為客戶模式'}
          </button>
        </div>

        {/* Version */}
        <p className="text-center mb-8" style={{ fontSize: 12, color: '#8a8a80' }}>BeautyBook v1.0.0</p>
      </div>
    </div>
  );
}

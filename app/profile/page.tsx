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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="pt-5 px-5 mb-6">
        <h1 className="text-[28px] font-bold text-foreground mb-5 font-heading tracking-tight">我的</h1>

        {/* Avatar & Info */}
        <div className="flex items-center">
          <div className="w-14 h-14 rounded-full bg-accent/40 flex items-center justify-center mr-3.5">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">使用者</p>
            <p className="text-[13px] text-muted">
              {state.userRole === 'provider' ? '業者帳號' : '一般會員'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-5 mb-6 bg-surface rounded-xl border border-border p-4 flex">
        {[
          { label: '已預約', value: totalBookings },
          { label: '已完成', value: completedBookings },
          { label: '已評價', value: totalReviews },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`flex-1 text-center ${i > 0 ? 'border-l border-border' : ''}`}
          >
            <p className="text-xl font-bold text-foreground mb-0.5">{stat.value}</p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Menu Items */}
      <div className="mx-5 mb-6">
        <p className="text-[13px] text-muted mb-2">我的紀錄</p>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {menuItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-background/50 ${
                i > 0 ? 'border-t border-border' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-base mr-2.5">{item.icon}</span>
                <span className="text-[15px] text-foreground">{item.label}</span>
              </div>
              <div className="flex items-center">
                <span className="text-[13px] text-muted mr-1.5">{item.value}</span>
                <span className="text-xs text-muted">›</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="mx-5 mb-6">
        <p className="text-[13px] text-muted mb-2">設定</p>
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          {settingsItems.map((item, i) => (
            <div
              key={item.label}
              className={`flex items-center justify-between px-4 py-3.5 cursor-pointer hover:bg-background/50 ${
                i > 0 ? 'border-t border-border' : ''
              }`}
            >
              <div className="flex items-center">
                <span className="text-base mr-2.5">{item.icon}</span>
                <span className="text-[15px] text-foreground">{item.label}</span>
              </div>
              <span className="text-xs text-muted">›</span>
            </div>
          ))}
        </div>
      </div>

      {/* Role Switch */}
      <div className="mx-5 mb-6">
        <button
          onClick={() => dispatch({
            type: 'SET_ROLE',
            payload: state.userRole === 'customer' ? 'provider' : 'customer',
          })}
          className="w-full rounded-full border border-secondary py-3.5 text-sm text-secondary font-medium transition-all hover:bg-secondary hover:text-white"
        >
          {state.userRole === 'customer' ? '切換為業者模式' : '切換為客戶模式'}
        </button>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-muted mb-8">BeautyBook v1.0.0</p>
    </div>
  );
}

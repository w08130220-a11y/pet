'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { BOOKING_STATUS_LABELS, type BookingStatus } from '@/lib/types';

const STATUS_TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'confirmed', label: '已確認' },
  { key: 'pending', label: '待確認' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
  { key: 'provider_cancelled', label: '商家取消' },
];

export default function BookingsPage() {
  const { state, cancelBooking, addReview } = useAppStore();
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const filteredBookings = activeTab === 'all'
    ? state.bookings
    : state.bookings.filter((b) => b.status === activeTab);

  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return '#4a6741';
      case 'pending': return '#c4956a';
      case 'completed': return '#8a8a80';
      case 'cancelled': return '#a85a4a';
      case 'provider_cancelled': return '#c4956a';
    }
  };

  const handleCancel = (bookingId: string) => {
    if (confirm('確定要取消這筆預約嗎？無故取消訂金視同放棄。')) {
      cancelBooking(bookingId);
    }
  };

  const handleSubmitReview = (booking: typeof sortedBookings[0]) => {
    if (!reviewComment.trim()) {
      alert('請填寫評價內容');
      return;
    }
    addReview({
      bookingId: booking.id,
      providerId: booking.providerId,
      providerName: booking.providerName,
      serviceName: booking.serviceName,
      staffName: booking.staffName,
      rating: reviewRating,
      comment: reviewComment,
    });
    setReviewingId(null);
    setReviewRating(5);
    setReviewComment('');
    alert('感謝您的評價！');
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid #4a6741', borderTopColor: 'transparent' }} />
      </div>
    );
  }

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
          我的預約
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'rgba(240,244,237,0.6)',
          position: 'relative',
          zIndex: 1,
        }}>
          查看與管理你的預約紀錄
        </p>
      </div>

      <div className="px-5 pt-4">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key ? 'area-chip area-chip-active' : 'area-chip'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        {sortedBookings.length === 0 ? (
          <div className="text-center pt-20">
            <div className="text-[40px] mb-3">📋</div>
            <p style={{ fontSize: 16, color: '#8a8a80' }}>尚無預約紀錄</p>
            <p style={{ fontSize: 13, color: '#8a8a80', marginTop: 4 }}>到「探索」頁面尋找喜歡的店家吧</p>
          </div>
        ) : (
          sortedBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const hasReview = state.reviews.some((r) => r.bookingId === booking.id);
            const canReview =
              (booking.status === 'completed' && !hasReview) ||
              (booking.status === 'provider_cancelled' && !hasReview);

            return (
              <div key={booking.id} className="area-card p-4 mb-3">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <span style={{ fontSize: 17, fontWeight: 600, color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>{booking.providerName}</span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: statusColor + '18', color: statusColor }}
                  >
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3">
                  {[
                    { label: '服務', value: booking.serviceName },
                    { label: '設計師', value: booking.staffName },
                    { label: '日期', value: `${booking.date} ${booking.time}` },
                    { label: '時長', value: `${booking.duration} 分鐘` },
                  ].map((row) => (
                    <div key={row.label} className="flex">
                      <span style={{ fontSize: 13, color: '#8a8a80', width: 60 }}>{row.label}</span>
                      <span style={{ fontSize: 13, color: '#1a1a18' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex justify-between items-center pt-3" style={{ borderTop: '1px solid #e8ede6' }}>
                  <span style={{ fontSize: 13, color: '#8a8a80' }}>
                    訂金 ${booking.depositAmount}
                    {booking.depositPaid ? ' ✓ 已付' : ' 未付'}
                  </span>
                  <span style={{ fontSize: 17, fontWeight: 600, color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>${booking.totalPrice}</span>
                </div>

                {/* Provider cancelled notice */}
                {booking.status === 'provider_cancelled' && (
                  <div className="mt-2.5 rounded-xl p-2.5" style={{ background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.3)' }}>
                    <p style={{ fontSize: 12, color: '#1a1a18', lineHeight: '18px' }}>
                      此預約由商家取消（未提前告知），您可對該商家進行一次評價。
                    </p>
                  </div>
                )}

                {/* Cancel actions */}
                {(booking.status === 'confirmed' || booking.status === 'pending') && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="mt-3 w-full py-2.5 rounded-full text-sm font-medium transition-all"
                    style={
                      booking.status === 'confirmed'
                        ? { border: '1px solid #a85a4a', color: '#a85a4a' }
                        : { border: '1px solid #e8ede6', color: '#8a8a80' }
                    }
                  >
                    取消預約
                  </button>
                )}

                {/* Review */}
                {canReview && (
                  <>
                    <button
                      onClick={() => {
                        if (reviewingId === booking.id) {
                          setReviewingId(null);
                        } else {
                          setReviewingId(booking.id);
                          setReviewRating(5);
                          setReviewComment('');
                        }
                      }}
                      className="mt-3 w-full py-2.5 rounded-full text-sm font-medium transition-all hover:opacity-90"
                      style={{ background: '#4a6741', color: '#fff' }}
                    >
                      撰寫評價
                    </button>

                    {reviewingId === booking.id && (
                      <div className="mt-3">
                        <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 8 }}>評分（滿分 5 個讚）</p>
                        <div className="flex gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => setReviewRating(n)}
                              className={`text-[28px] ${n <= reviewRating ? 'opacity-100' : 'opacity-25'}`}
                            >
                              👍
                            </button>
                          ))}
                        </div>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="分享你的體驗..."
                          className="w-full rounded-xl px-3.5 py-3 text-sm h-20 resize-none mb-2.5"
                          style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }}
                        />
                        <button
                          onClick={() => handleSubmitReview(booking)}
                          className="w-full rounded-full py-2.5 text-sm font-semibold"
                          style={{ background: '#4a6741', color: '#fff' }}
                        >
                          送出評價
                        </button>
                      </div>
                    )}
                  </>
                )}

                {(booking.status === 'completed' || booking.status === 'provider_cancelled') && hasReview && (
                  <div className="mt-3 text-center">
                    <span style={{ fontSize: 13, color: '#4a6741' }}>✓ 已評價</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

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
      case 'confirmed': return 'var(--color-success)';
      case 'pending': return 'var(--color-warning)';
      case 'completed': return 'var(--color-muted)';
      case 'cancelled': return 'var(--color-error)';
      case 'provider_cancelled': return '#FF6B00';
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-5 px-5">
        <h1 className="text-[28px] font-bold text-foreground mb-4">我的預約</h1>

        {/* Status Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium ${
                activeTab === tab.key
                  ? 'bg-primary text-surface border-primary'
                  : 'bg-surface text-foreground border-border'
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
            <p className="text-base text-muted">尚無預約紀錄</p>
            <p className="text-[13px] text-muted mt-1">到「探索」頁面尋找喜歡的店家吧</p>
          </div>
        ) : (
          sortedBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const hasReview = state.reviews.some((r) => r.bookingId === booking.id);
            const canReview =
              (booking.status === 'completed' && !hasReview) ||
              (booking.status === 'provider_cancelled' && !hasReview);

            return (
              <div key={booking.id} className="bg-surface rounded-xl border border-border p-4 mb-3">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[17px] font-semibold text-foreground">{booking.providerName}</span>
                  <span
                    className="px-2.5 py-0.5 rounded-xl text-xs font-semibold"
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
                      <span className="text-[13px] text-muted w-[60px]">{row.label}</span>
                      <span className="text-[13px] text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Price */}
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="text-[13px] text-muted">
                    訂金 ${booking.depositAmount}
                    {booking.depositPaid ? ' ✓ 已付' : ' 未付'}
                  </span>
                  <span className="text-[17px] font-semibold text-foreground">${booking.totalPrice}</span>
                </div>

                {/* Provider cancelled notice */}
                {booking.status === 'provider_cancelled' && (
                  <div className="mt-2.5 bg-orange-50 rounded-lg p-2.5 border border-orange-300">
                    <p className="text-xs text-orange-900 leading-[18px]">
                      此預約由商家取消（未提前告知），您可對該商家進行一次評價。
                    </p>
                  </div>
                )}

                {/* Cancel actions */}
                {(booking.status === 'confirmed' || booking.status === 'pending') && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className={`mt-3 w-full py-2.5 rounded-lg border text-sm font-medium ${
                      booking.status === 'confirmed'
                        ? 'border-error text-error'
                        : 'border-border text-muted'
                    }`}
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
                      className="mt-3 w-full py-2.5 rounded-lg bg-primary text-surface text-sm font-medium"
                    >
                      撰寫評價
                    </button>

                    {reviewingId === booking.id && (
                      <div className="mt-3">
                        <p className="text-[13px] text-muted mb-2">評分（滿分 5 個讚）</p>
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
                          className="w-full bg-background border border-border rounded-lg px-3.5 py-3 text-sm text-foreground placeholder:text-muted h-20 resize-none mb-2.5"
                        />
                        <button
                          onClick={() => handleSubmitReview(booking)}
                          className="w-full bg-primary rounded-lg py-2.5 text-sm font-semibold text-surface"
                        >
                          送出評價
                        </button>
                      </div>
                    )}
                  </>
                )}

                {(booking.status === 'completed' || booking.status === 'provider_cancelled') && hasReview && (
                  <div className="mt-3 text-center">
                    <span className="text-[13px] text-success">✓ 已評價</span>
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

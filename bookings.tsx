import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { useAppStore } from './store';
import { BOOKING_STATUS_LABELS, type BookingStatus } from './index';

const STATUS_TABS: { key: BookingStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'confirmed', label: '已確認' },
  { key: 'pending', label: '待確認' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export default function BookingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, cancelBooking, addReview } = useAppStore();
  const [activeTab, setActiveTab] = useState<BookingStatus | 'all'>('all');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const filteredBookings = activeTab === 'all'
    ? state.bookings
    : state.bookings.filter((b) => b.status === activeTab);

  const sortedBookings = [...filteredBookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed': return colors.success;
      case 'pending': return colors.warning;
      case 'completed': return colors.muted;
      case 'cancelled': return colors.error;
    }
  };

  const handleCancel = (bookingId: string) => {
    if (Platform.OS === 'web') {
      if (confirm('確定要取消這筆預約嗎？訂金將依取消政策處理。')) {
        cancelBooking(bookingId);
      }
    } else {
      Alert.alert('取消預約', '確定要取消這筆預約嗎？訂金將依取消政策處理。', [
        { text: '返回', style: 'cancel' },
        { text: '確定取消', style: 'destructive', onPress: () => cancelBooking(bookingId) },
      ]);
    }
  };

  if (state.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>
          我的預約
        </Text>

        {/* Status Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {STATUS_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: activeTab === tab.key ? colors.primary : colors.border,
                marginRight: 8,
              }}
            >
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: activeTab === tab.key ? colors.surface : colors.foreground,
              }}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 30 }}>
        {sortedBookings.length === 0 ? (
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
            <Text style={{ fontSize: 16, color: colors.muted }}>尚無預約紀錄</Text>
            <Text style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
              到「探索」頁面尋找喜歡的店家吧
            </Text>
          </View>
        ) : (
          sortedBookings.map((booking) => {
            const statusColor = getStatusColor(booking.status);
            const hasReview = state.reviews.some((r) => r.bookingId === booking.id);

            return (
              <View
                key={booking.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground }}>
                    {booking.providerName}
                  </Text>
                  <View style={{
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 12,
                    backgroundColor: statusColor + '18',
                  }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: statusColor }}>
                      {BOOKING_STATUS_LABELS[booking.status]}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={{ gap: 6, marginBottom: 12 }}>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 13, color: colors.muted, width: 60 }}>服務</Text>
                    <Text style={{ fontSize: 13, color: colors.foreground }}>{booking.serviceName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 13, color: colors.muted, width: 60 }}>設計師</Text>
                    <Text style={{ fontSize: 13, color: colors.foreground }}>{booking.staffName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 13, color: colors.muted, width: 60 }}>日期</Text>
                    <Text style={{ fontSize: 13, color: colors.foreground }}>
                      {booking.date} {booking.time}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 13, color: colors.muted, width: 60 }}>時長</Text>
                    <Text style={{ fontSize: 13, color: colors.foreground }}>{booking.duration} 分鐘</Text>
                  </View>
                </View>

                {/* Price */}
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}>
                  <View>
                    <Text style={{ fontSize: 13, color: colors.muted }}>
                      訂金 ${booking.depositAmount}
                      {booking.depositPaid ? ' ✓ 已付' : ' 未付'}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 17, fontWeight: '600', color: colors.foreground }}>
                    ${booking.totalPrice}
                  </Text>
                </View>

                {/* Actions */}
                {booking.status === 'confirmed' && (
                  <TouchableOpacity
                    onPress={() => handleCancel(booking.id)}
                    style={{
                      marginTop: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.error,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.error, fontWeight: '500' }}>取消預約</Text>
                  </TouchableOpacity>
                )}

                {booking.status === 'pending' && (
                  <TouchableOpacity
                    onPress={() => handleCancel(booking.id)}
                    style={{
                      marginTop: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.muted, fontWeight: '500' }}>取消預約</Text>
                  </TouchableOpacity>
                )}

                {booking.status === 'completed' && !hasReview && (
                  <TouchableOpacity
                    onPress={() => setReviewingId(booking.id === reviewingId ? null : booking.id)}
                    style={{
                      marginTop: 12,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: colors.primary,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.surface, fontWeight: '500' }}>撰寫評價</Text>
                  </TouchableOpacity>
                )}

                {booking.status === 'completed' && hasReview && (
                  <View style={{ marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: colors.success }}>✓ 已評價</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { useAppStore } from './store';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
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
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={{
          paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8,
          paddingHorizontal: 20,
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 20 }}>
            我的
          </Text>

          {/* Avatar & Info */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 14,
            }}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
                使用者
              </Text>
              <Text style={{ fontSize: 13, color: colors.muted }}>
                {state.userRole === 'provider' ? '業者帳號' : '一般會員'}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{
          flexDirection: 'row',
          marginHorizontal: 20,
          marginBottom: 24,
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 16,
        }}>
          {[
            { label: '已預約', value: totalBookings },
            { label: '已完成', value: completedBookings },
            { label: '已評價', value: totalReviews },
          ].map((stat, i) => (
            <View key={stat.label} style={{
              flex: 1,
              alignItems: 'center',
              borderLeftWidth: i > 0 ? 1 : 0,
              borderLeftColor: colors.border,
            }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground, marginBottom: 2 }}>
                {stat.value}
              </Text>
              <Text style={{ fontSize: 12, color: colors.muted }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
        <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 8 }}>我的紀錄</Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}>
            {menuItems.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 10 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 15, color: colors.foreground }}>{item.label}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, color: colors.muted, marginRight: 6 }}>{item.value}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Settings */}
        <View style={{ marginHorizontal: 20, marginBottom: 24 }}>
          <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 8 }}>設定</Text>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
          }}>
            {settingsItems.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.7}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, marginRight: 10 }}>{item.icon}</Text>
                  <Text style={{ fontSize: 15, color: colors.foreground }}>{item.label}</Text>
                </View>
                <Text style={{ fontSize: 12, color: colors.muted }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Role Switch */}
        <View style={{ marginHorizontal: 20 }}>
          <TouchableOpacity
            onPress={() => dispatch({
              type: 'SET_ROLE',
              payload: state.userRole === 'customer' ? 'provider' : 'customer',
            })}
            style={{
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: colors.muted }}>
              {state.userRole === 'customer' ? '切換為業者模式' : '切換為客戶模式'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Version */}
        <Text style={{ textAlign: 'center', fontSize: 12, color: colors.muted, marginTop: 24 }}>
          BeautyBook v1.0.0
        </Text>
      </ScrollView>
    </View>
  );
}

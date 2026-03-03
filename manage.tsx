import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { useAppStore } from './store';
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, BOOKING_STATUS_LABELS, type ServiceCategory } from './index';

const CATEGORIES: ServiceCategory[] = ['nail', 'hair', 'massage', 'lash', 'spa', 'tattoo'];

type ManageTab = 'overview' | 'services' | 'schedule' | 'orders';

export default function ManageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useAppStore();
  const [activeTab, setActiveTab] = useState<ManageTab>('overview');
  const [isRegistering, setIsRegistering] = useState(false);
  const [form, setForm] = useState({
    name: '',
    category: 'nail' as ServiceCategory,
    address: '',
    city: '台北市',
    district: '',
    phone: '',
    description: '',
  });

  const isProvider = state.userRole === 'provider';
  // Find provider owned by current user (mock: use first provider)
  const myProvider = isProvider ? state.providers[0] : null;
  const myOrders = myProvider
    ? state.bookings.filter((b) => b.providerId === myProvider.id)
    : [];

  const todayOrders = myOrders.filter((b) => {
    const today = new Date().toISOString().split('T')[0];
    return b.date === today && b.status !== 'cancelled';
  });

  const handleRegister = () => {
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
      const msg = '請填寫完整的店家資訊';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('提示', msg);
      return;
    }
    dispatch({ type: 'SET_ROLE', payload: 'provider' });
    dispatch({
      type: 'ADD_PROVIDER',
      payload: {
        id: `p-${Date.now()}`,
        name: form.name,
        category: form.category,
        address: `${form.city}${form.district}${form.address}`,
        city: form.city,
        district: form.district,
        phone: form.phone,
        description: form.description,
        rating: 0,
        reviewCount: 0,
        imageUri: '',
        isVerified: false,
        services: [],
        staffMembers: [],
        businessHours: {
          mon: { open: '10:00', close: '20:00' },
          tue: { open: '10:00', close: '20:00' },
          wed: { open: '10:00', close: '20:00' },
          thu: { open: '10:00', close: '20:00' },
          fri: { open: '10:00', close: '20:00' },
          sat: { open: '10:00', close: '20:00' },
          sun: null,
        },
      },
    });
    setIsRegistering(false);
  };

  // ── Not registered yet ──
  if (!isProvider && !isRegistering) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8, paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 16 }}>
            業者中心
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
          <Text style={{ fontSize: 48, marginBottom: 20 }}>🏪</Text>
          <Text style={{ fontSize: 20, fontWeight: '600', color: colors.foreground, marginBottom: 8, textAlign: 'center' }}>
            成為美容業者
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
            註冊成為業者，上傳你的服務項目與空閒時段，讓客戶直接預約你的服務。
          </Text>
          <TouchableOpacity
            onPress={() => setIsRegistering(true)}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 14,
              paddingHorizontal: 40,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.surface }}>立即註冊</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Registration Form ──
  if (isRegistering) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setIsRegistering(false)} style={{ marginRight: 12 }}>
              <Text style={{ fontSize: 16, color: colors.muted }}>← 返回</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.foreground }}>店家註冊</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
          {/* Shop Name */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>店家名稱 *</Text>
          <TextInput
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v })}
            placeholder="例：Nail Room 指尖藝術"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.foreground,
              marginBottom: 16,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            } as any}
          />

          {/* Category */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>服務類型 *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm({ ...form, category: cat })}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: form.category === cat ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: form.category === cat ? colors.primary : colors.border,
                }}
              >
                <Text style={{ fontSize: 14, color: form.category === cat ? colors.surface : colors.foreground }}>
                  {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* City */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>城市 *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {['台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市'].map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => setForm({ ...form, city })}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: form.city === city ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor: form.city === city ? colors.primary : colors.border,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: form.city === city ? colors.surface : colors.foreground }}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Address */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>詳細地址 *</Text>
          <TextInput
            value={form.address}
            onChangeText={(v) => setForm({ ...form, address: v })}
            placeholder="例：忠孝東路四段155號3樓"
            placeholderTextColor={colors.muted}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.foreground,
              marginBottom: 16,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            } as any}
          />

          {/* Phone */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>聯絡電話 *</Text>
          <TextInput
            value={form.phone}
            onChangeText={(v) => setForm({ ...form, phone: v })}
            placeholder="02-1234-5678"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.foreground,
              marginBottom: 16,
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            } as any}
          />

          {/* Description */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>店家介紹</Text>
          <TextInput
            value={form.description}
            onChangeText={(v) => setForm({ ...form, description: v })}
            placeholder="簡單介紹你的服務特色..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 14,
              paddingVertical: 12,
              fontSize: 15,
              color: colors.foreground,
              marginBottom: 24,
              height: 80,
              textAlignVertical: 'top',
              ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
            } as any}
          />

          {/* Submit */}
          <TouchableOpacity
            onPress={handleRegister}
            style={{
              backgroundColor: colors.primary,
              borderRadius: 10,
              paddingVertical: 16,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.surface }}>完成註冊</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ── Provider Dashboard ──
  const tabs: { key: ManageTab; label: string }[] = [
    { key: 'overview', label: '總覽' },
    { key: 'orders', label: '訂單' },
    { key: 'services', label: '服務' },
    { key: 'schedule', label: '時段' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
          業者中心
        </Text>
        {myProvider && (
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
            {myProvider.name}
          </Text>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {tabs.map((tab) => (
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              {[
                { label: '今日預約', value: String(todayOrders.length), color: colors.primary },
                { label: '總評分', value: myProvider?.rating ? String(myProvider.rating) : '—', color: '#F5A623' },
                { label: '總評價數', value: String(myProvider?.reviewCount || 0), color: colors.secondary },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 16,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24, fontWeight: '700', color: stat.color, marginBottom: 4 }}>
                    {stat.value}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Today's Orders */}
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
              今日預約
            </Text>
            {todayOrders.length === 0 ? (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 24,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 14, color: colors.muted }}>今日暫無預約</Text>
              </View>
            ) : (
              todayOrders.map((order) => (
                <View
                  key={order.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>
                      {order.time} — {order.serviceName}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                      {order.staffName} · {order.duration}分鐘
                    </Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>
                    ${order.totalPrice}
                  </Text>
                </View>
              ))
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <>
            {myOrders.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <Text style={{ fontSize: 14, color: colors.muted }}>尚無訂單</Text>
              </View>
            ) : (
              [...myOrders].reverse().map((order) => (
                <View
                  key={order.id}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                    marginBottom: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>
                      {order.serviceName}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>
                      {BOOKING_STATUS_LABELS[order.status]}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.muted }}>
                    {order.date} {order.time} · {order.staffName} · ${order.totalPrice}
                  </Text>
                </View>
              ))
            )}
          </>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && myProvider && (
          <>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
              {myProvider.services.length} 項服務
            </Text>
            {myProvider.services.map((service) => (
              <View
                key={service.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>
                    {service.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                    {service.duration}分鐘
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                  ${service.price}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && myProvider && (
          <>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
              營業時間設定
            </Text>
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
              const dayLabels: Record<string, string> = {
                mon: '週一', tue: '週二', wed: '週三', thu: '週四',
                fri: '週五', sat: '週六', sun: '週日',
              };
              const hours = myProvider.businessHours[day];
              return (
                <View
                  key={day}
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 14,
                    marginBottom: 8,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>
                    {dayLabels[day]}
                  </Text>
                  <Text style={{ fontSize: 14, color: hours ? colors.foreground : colors.error }}>
                    {hours ? `${hours.open} — ${hours.close}` : '公休'}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

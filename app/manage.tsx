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
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, BOOKING_STATUS_LABELS, CITIES, type ServiceCategory } from './types';

const CATEGORIES: ServiceCategory[] = ['nail', 'hair', 'massage', 'lash', 'spa', 'tattoo'];

type ManageTab = 'overview' | 'services' | 'staff' | 'schedule' | 'orders' | 'photos';

export default function ManageScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { state, dispatch, providerCancelBooking } = useAppStore();
  const [activeTab, setActiveTab] = useState<ManageTab>('overview');
  const [isRegistering, setIsRegistering] = useState(false);

  // Registration form
  const [form, setForm] = useState({
    name: '',
    category: 'nail' as ServiceCategory,
    address: '',
    city: '台北市',
    district: '',
    phone: '',
    description: '',
  });

  // Add service form
  const [showAddService, setShowAddService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', duration: '60', price: '', category: 'nail' as ServiceCategory,
  });

  // Edit service price
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  // Add staff form
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '', title: '', specialties: '',
  });

  const isProvider = state.userRole === 'provider';
  const myProvider = isProvider ? state.providers[0] : null;
  const myOrders = myProvider
    ? state.bookings.filter((b) => b.providerId === myProvider.id)
    : [];

  const todayOrders = myOrders.filter((b) => {
    const today = new Date().toISOString().split('T')[0];
    return b.date === today && b.status !== 'cancelled' && b.status !== 'provider_cancelled';
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
        photos: [],
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

  // Item #2: Add service
  const handleAddService = () => {
    if (!myProvider || !serviceForm.name.trim() || !serviceForm.price.trim()) {
      const msg = '請填寫服務名稱和價格';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('提示', msg);
      return;
    }
    dispatch({
      type: 'ADD_SERVICE',
      payload: {
        providerId: myProvider.id,
        service: {
          id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          providerId: myProvider.id,
          name: serviceForm.name,
          description: serviceForm.description,
          category: myProvider.category,
          duration: parseInt(serviceForm.duration) || 60,
          price: parseInt(serviceForm.price) || 0,
          isAvailable: true,
        },
      },
    });
    setServiceForm({ name: '', description: '', duration: '60', price: '', category: myProvider.category });
    setShowAddService(false);
  };

  // Item #2: Delete service
  const handleDeleteService = (serviceId: string) => {
    if (!myProvider) return;
    const doDelete = () => {
      dispatch({ type: 'DELETE_SERVICE', payload: { providerId: myProvider.id, serviceId } });
    };
    if (Platform.OS === 'web') {
      if (confirm('確定要刪除此服務項目嗎？')) doDelete();
    } else {
      Alert.alert('刪除服務', '確定要刪除此服務項目嗎？', [
        { text: '取消', style: 'cancel' },
        { text: '確定刪除', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // Item #2: Update service price
  const handleUpdatePrice = (serviceId: string) => {
    if (!myProvider || !editPrice.trim()) return;
    dispatch({
      type: 'UPDATE_SERVICE',
      payload: {
        providerId: myProvider.id,
        serviceId,
        updates: { price: parseInt(editPrice) || 0 },
      },
    });
    setEditingServiceId(null);
    setEditPrice('');
  };

  // Item #2: Add staff
  const handleAddStaff = () => {
    if (!myProvider || !staffForm.name.trim() || !staffForm.title.trim()) {
      const msg = '請填寫人員姓名和職稱';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('提示', msg);
      return;
    }
    dispatch({
      type: 'ADD_STAFF',
      payload: {
        providerId: myProvider.id,
        staff: {
          id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          providerId: myProvider.id,
          name: staffForm.name,
          title: staffForm.title,
          photoUri: '',
          specialties: staffForm.specialties.split('、').filter(Boolean),
          rating: 0,
          reviewCount: 0,
        },
      },
    });
    setStaffForm({ name: '', title: '', specialties: '' });
    setShowAddStaff(false);
  };

  // Item #2: Delete staff
  const handleDeleteStaff = (staffId: string) => {
    if (!myProvider) return;
    const doDelete = () => {
      dispatch({ type: 'DELETE_STAFF', payload: { providerId: myProvider.id, staffId } });
    };
    if (Platform.OS === 'web') {
      if (confirm('確定要刪除此人員嗎？')) doDelete();
    } else {
      Alert.alert('刪除人員', '確定要刪除此人員嗎？', [
        { text: '取消', style: 'cancel' },
        { text: '確定刪除', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  // Item #6: Provider cancel booking
  const handleProviderCancel = (bookingId: string) => {
    const doCancel = () => {
      providerCancelBooking(bookingId);
      const msg = '已取消此預約，顧客將獲得一次評價機會。';
      Platform.OS === 'web' ? alert(msg) : Alert.alert('已取消', msg);
    };
    if (Platform.OS === 'web') {
      if (confirm('確定要取消此預約嗎？未提前告知取消，顧客將可評價您的商家。')) doCancel();
    } else {
      Alert.alert('取消預約', '確定要取消此預約嗎？未提前告知取消，顧客將可評價您的商家。', [
        { text: '返回', style: 'cancel' },
        { text: '確定取消', style: 'destructive', onPress: doCancel },
      ]);
    }
  };

  const inputStyle = (extra?: any) => ({
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
    ...extra,
  } as any);

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
          <TextInput value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} placeholder="例：Nail Room 指尖藝術" placeholderTextColor={colors.muted} style={inputStyle()} />

          {/* Category */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>服務類型 *</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setForm({ ...form, category: cat })}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: form.category === cat ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: form.category === cat ? colors.primary : colors.border,
                }}
              >
                <Text style={{ fontSize: 14, color: form.category === cat ? colors.surface : colors.foreground }}>
                  {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* City - Item #5: show all cities */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>城市 *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => setForm({ ...form, city })}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: form.city === city ? colors.primary : colors.surface,
                  borderWidth: 1, borderColor: form.city === city ? colors.primary : colors.border,
                  marginRight: 8,
                }}
              >
                <Text style={{ fontSize: 14, color: form.city === city ? colors.surface : colors.foreground }}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* District */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>區域</Text>
          <TextInput value={form.district} onChangeText={(v) => setForm({ ...form, district: v })} placeholder="例：大安區" placeholderTextColor={colors.muted} style={inputStyle()} />

          {/* Address */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>詳細地址 *</Text>
          <TextInput value={form.address} onChangeText={(v) => setForm({ ...form, address: v })} placeholder="例：忠孝東路四段155號3樓" placeholderTextColor={colors.muted} style={inputStyle()} />

          {/* Phone */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>聯絡電話 *</Text>
          <TextInput value={form.phone} onChangeText={(v) => setForm({ ...form, phone: v })} placeholder="02-1234-5678" placeholderTextColor={colors.muted} keyboardType="phone-pad" style={inputStyle()} />

          {/* Description */}
          <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>店家介紹</Text>
          <TextInput value={form.description} onChangeText={(v) => setForm({ ...form, description: v })} placeholder="簡單介紹你的服務特色..." placeholderTextColor={colors.muted} multiline numberOfLines={3} style={inputStyle({ height: 80, textAlignVertical: 'top' })} />

          {/* Submit */}
          <TouchableOpacity onPress={handleRegister} style={{ backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 16, alignItems: 'center' }}>
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
    { key: 'staff', label: '人員' },
    { key: 'photos', label: '相簿' },
    { key: 'schedule', label: '時段' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: Platform.OS === 'web' ? 20 : insets.top + 8, paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', color: colors.foreground, marginBottom: 4 }}>
          業者中心
        </Text>
        {myProvider && (
          <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>{myProvider.name}</Text>
        )}

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: activeTab === tab.key ? colors.primary : colors.surface,
                borderWidth: 1, borderColor: activeTab === tab.key ? colors.primary : colors.border,
                marginRight: 8,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: activeTab === tab.key ? colors.surface : colors.foreground }}>
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
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              {[
                { label: '今日預約', value: String(todayOrders.length), color: colors.primary },
                { label: '總評分', value: myProvider?.rating ? String(myProvider.rating) : '—', color: '#F5A623' },
                { label: '總評價數', value: String(myProvider?.reviewCount || 0), color: colors.secondary },
              ].map((stat) => (
                <View key={stat.label} style={{
                  flex: 1, backgroundColor: colors.surface, borderRadius: 12,
                  borderWidth: 1, borderColor: colors.border, padding: 16, alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 24, fontWeight: '700', color: stat.color, marginBottom: 4 }}>{stat.value}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>今日預約</Text>
            {todayOrders.length === 0 ? (
              <View style={{ backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: colors.muted }}>今日暫無預約</Text>
              </View>
            ) : (
              todayOrders.map((order) => (
                <View key={order.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
                  padding: 14, marginBottom: 8,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{order.time} — {order.serviceName}</Text>
                      <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{order.staffName} · {order.duration}分鐘</Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground }}>${order.totalPrice}</Text>
                  </View>
                  {/* Item #6: Provider can cancel */}
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <TouchableOpacity
                      onPress={() => handleProviderCancel(order.id)}
                      style={{
                        marginTop: 8, paddingVertical: 8, borderRadius: 8,
                        borderWidth: 1, borderColor: colors.error, alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, color: colors.error }}>商家取消預約</Text>
                    </TouchableOpacity>
                  )}
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
                <View key={order.id} style={{
                  backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
                  borderColor: colors.border, padding: 14, marginBottom: 8,
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{order.serviceName}</Text>
                    <Text style={{ fontSize: 12, color: order.status === 'provider_cancelled' ? colors.error : colors.muted }}>
                      {BOOKING_STATUS_LABELS[order.status]}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 13, color: colors.muted }}>
                    {order.date} {order.time} · {order.staffName} · ${order.totalPrice}
                  </Text>
                  {/* Provider cancel for confirmed/pending orders */}
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <TouchableOpacity
                      onPress={() => handleProviderCancel(order.id)}
                      style={{
                        marginTop: 8, paddingVertical: 8, borderRadius: 8,
                        borderWidth: 1, borderColor: colors.error, alignItems: 'center',
                      }}
                    >
                      <Text style={{ fontSize: 13, color: colors.error }}>商家取消預約</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </>
        )}

        {/* Services Tab - Item #2: CRUD */}
        {activeTab === 'services' && myProvider && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>{myProvider.services.length} 項服務</Text>
              <TouchableOpacity
                onPress={() => setShowAddService(!showAddService)}
                style={{
                  backgroundColor: colors.primary, borderRadius: 8,
                  paddingHorizontal: 14, paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.surface }}>+ 新增服務</Text>
              </TouchableOpacity>
            </View>

            {/* Add Service Form */}
            {showAddService && (
              <View style={{
                backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
                borderColor: colors.primary, padding: 16, marginBottom: 12,
              }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>新增服務項目</Text>
                <TextInput value={serviceForm.name} onChangeText={(v) => setServiceForm({ ...serviceForm, name: v })} placeholder="服務名稱 *" placeholderTextColor={colors.muted} style={inputStyle({ marginBottom: 10 })} />
                <TextInput value={serviceForm.description} onChangeText={(v) => setServiceForm({ ...serviceForm, description: v })} placeholder="服務描述" placeholderTextColor={colors.muted} style={inputStyle({ marginBottom: 10 })} />
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                  <TextInput value={serviceForm.duration} onChangeText={(v) => setServiceForm({ ...serviceForm, duration: v })} placeholder="時長(分鐘)" placeholderTextColor={colors.muted} keyboardType="numeric" style={inputStyle({ flex: 1, marginBottom: 0 })} />
                  <TextInput value={serviceForm.price} onChangeText={(v) => setServiceForm({ ...serviceForm, price: v })} placeholder="價格(NTD) *" placeholderTextColor={colors.muted} keyboardType="numeric" style={inputStyle({ flex: 1, marginBottom: 0 })} />
                </View>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={handleAddService} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.surface }}>確認新增</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowAddService(false)} style={{ flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: colors.muted }}>取消</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {myProvider.services.map((service) => (
              <View key={service.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
                borderColor: colors.border, padding: 14, marginBottom: 8,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{service.name}</Text>
                    <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>{service.description} · {service.duration}分鐘</Text>
                  </View>
                  {editingServiceId === service.id ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TextInput
                        value={editPrice}
                        onChangeText={setEditPrice}
                        keyboardType="numeric"
                        placeholder={String(service.price)}
                        placeholderTextColor={colors.muted}
                        style={{
                          width: 80, borderWidth: 1, borderColor: colors.primary, borderRadius: 6,
                          paddingHorizontal: 8, paddingVertical: 4, fontSize: 14, color: colors.foreground, textAlign: 'right',
                          ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
                        } as any}
                      />
                      <TouchableOpacity onPress={() => handleUpdatePrice(service.id)}>
                        <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>✓</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setEditingServiceId(null); setEditPrice(''); }}>
                        <Text style={{ fontSize: 14, color: colors.muted }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => { setEditingServiceId(service.id); setEditPrice(String(service.price)); }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>${service.price}</Text>
                      <Text style={{ fontSize: 10, color: colors.primary, textAlign: 'right' }}>點擊修改</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteService(service.id)}
                  style={{ marginTop: 8, alignSelf: 'flex-end' }}
                >
                  <Text style={{ fontSize: 12, color: colors.error }}>刪除服務</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Staff Tab - Item #2: CRUD */}
        {activeTab === 'staff' && myProvider && (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 13, color: colors.muted }}>{myProvider.staffMembers.length} 位人員</Text>
              <TouchableOpacity
                onPress={() => setShowAddStaff(!showAddStaff)}
                style={{
                  backgroundColor: colors.primary, borderRadius: 8,
                  paddingHorizontal: 14, paddingVertical: 8,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.surface }}>+ 新增人員</Text>
              </TouchableOpacity>
            </View>

            {/* Add Staff Form */}
            {showAddStaff && (
              <View style={{
                backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
                borderColor: colors.primary, padding: 16, marginBottom: 12,
              }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>新增服務人員</Text>
                <TextInput value={staffForm.name} onChangeText={(v) => setStaffForm({ ...staffForm, name: v })} placeholder="姓名 *" placeholderTextColor={colors.muted} style={inputStyle({ marginBottom: 10 })} />
                <TextInput value={staffForm.title} onChangeText={(v) => setStaffForm({ ...staffForm, title: v })} placeholder="職稱 * (例：設計師、美甲師)" placeholderTextColor={colors.muted} style={inputStyle({ marginBottom: 10 })} />
                <TextInput value={staffForm.specialties} onChangeText={(v) => setStaffForm({ ...staffForm, specialties: v })} placeholder="專長 (用「、」分隔，例：日式美甲、暈染設計)" placeholderTextColor={colors.muted} style={inputStyle({ marginBottom: 10 })} />
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={handleAddStaff} style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.surface }}>確認新增</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowAddStaff(false)} style={{ flex: 1, borderRadius: 8, borderWidth: 1, borderColor: colors.border, paddingVertical: 12, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: colors.muted }}>取消</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {myProvider.staffMembers.map((staff) => (
              <View key={staff.id} style={{
                backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
                borderColor: colors.border, padding: 14, marginBottom: 8,
                flexDirection: 'row', alignItems: 'center',
              }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20, backgroundColor: colors.background,
                  justifyContent: 'center', alignItems: 'center', marginRight: 12,
                }}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{staff.name}</Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>{staff.title}</Text>
                  {staff.specialties.length > 0 && (
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{staff.specialties.join('、')}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteStaff(staff.id)} style={{ padding: 8 }}>
                  <Text style={{ fontSize: 13, color: colors.error }}>刪除</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Photos Tab - Item #9 */}
        {activeTab === 'photos' && myProvider && (
          <>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
              店鋪相簿（最多 6 張）· 目前 {myProvider.photos?.length || 0} 張
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
              {(myProvider.photos || []).slice(0, 6).map((_, index) => (
                <View key={index} style={{
                  width: '47%' as any, aspectRatio: 1, borderRadius: 12, backgroundColor: colors.border,
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 12, color: colors.muted }}>照片 {index + 1}</Text>
                </View>
              ))}
              {(myProvider.photos?.length || 0) < 6 && (
                <TouchableOpacity style={{
                  width: '47%' as any, aspectRatio: 1, borderRadius: 12, borderWidth: 2,
                  borderColor: colors.border, borderStyle: 'dashed',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 28, color: colors.muted }}>+</Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>上傳照片</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && myProvider && (
          <>
            <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>營業時間設定</Text>
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
              const dayLabels: Record<string, string> = {
                mon: '週一', tue: '週二', wed: '週三', thu: '週四',
                fri: '週五', sat: '週六', sun: '週日',
              };
              const hours = myProvider.businessHours[day];
              return (
                <View key={day} style={{
                  backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1,
                  borderColor: colors.border, padding: 14, marginBottom: 8,
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>{dayLabels[day]}</Text>
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

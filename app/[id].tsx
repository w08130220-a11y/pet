import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { useAppStore } from './store';
import { SERVICE_CATEGORY_LABELS, type Service, type StaffMember } from './types';

type Step = 'detail' | 'select-service' | 'select-staff' | 'select-time' | 'confirm';

// Render thumbs-up rating (item #7)
function ThumbsRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <Text style={{ fontSize: size }}>
      {'👍'.repeat(filled)}{'👍🏻'.repeat(0)}
      {filled < 5 && <Text style={{ opacity: 0.25 }}>{'👍'.repeat(5 - filled)}</Text>}
    </Text>
  );
}

export default function ProviderDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProvider, getAvailableSlots, createBooking, state, toggleFavorite, isFavorite } = useAppStore();

  const provider = getProvider(id);

  const [step, setStep] = useState<Step>('detail');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [note, setNote] = useState('');
  const [showDepositDisclaimer, setShowDepositDisclaimer] = useState(false);

  const favorited = isFavorite(id);

  // Generate next 7 days
  const dates = useMemo(() => {
    const result: { date: string; label: string; dayLabel: string }[] = [];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const month = d.getMonth() + 1;
      const day = d.getDate();
      result.push({
        date: dateStr,
        label: `${month}/${day}`,
        dayLabel: i === 0 ? '今天' : i === 1 ? '明天' : `週${dayNames[d.getDay()]}`,
      });
    }
    return result;
  }, []);

  // Available time slots
  const availableSlots = useMemo(() => {
    if (!selectedStaff || !selectedDate) return [];
    return getAvailableSlots(id, selectedStaff.id, selectedDate);
  }, [id, selectedStaff, selectedDate, getAvailableSlots]);

  // Item #4: deposit is now 10%
  const depositAmount = selectedService ? Math.round(selectedService.price * 0.1) : 0;

  // Provider reviews
  const providerReviews = state.reviews.filter((r) => r.providerId === id);

  if (!provider) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ fontSize: 16, color: colors.muted }}>找不到該店家</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 14, color: colors.primary }}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Item #10: open address in Google Maps
  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.address)}`;
    Linking.openURL(url);
  };

  // Item #11: dial phone number
  const callPhone = () => {
    const cleaned = provider.phone.replace(/[^0-9]/g, '');
    Linking.openURL(`tel:${cleaned}`);
  };

  // Item #4: show deposit disclaimer before confirming
  const handleProceedToConfirm = () => {
    setShowDepositDisclaimer(true);
  };

  const handleAcceptDisclaimer = () => {
    setShowDepositDisclaimer(false);
    handleConfirmBooking();
  };

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) return;

    createBooking({
      providerId: provider.id,
      providerName: provider.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      date: selectedDate,
      time: selectedTime,
      duration: selectedService.duration,
      totalPrice: selectedService.price,
      depositAmount,
      depositPaid: true,
      status: 'confirmed',
      note,
    });

    const msg = `預約成功！\n\n${provider.name}\n${selectedService.name}\n${selectedDate} ${selectedTime}\n設計師：${selectedStaff.name}\n\n訂金 $${depositAmount} 已付款`;
    if (Platform.OS === 'web') {
      alert(msg);
    } else {
      Alert.alert('預約成功', msg);
    }

    router.back();
  };

  const goBack = () => {
    if (step === 'detail') {
      router.back();
    } else if (step === 'select-service') {
      setStep('detail');
    } else if (step === 'select-staff') {
      setStep('select-service');
    } else if (step === 'select-time') {
      setStep('select-staff');
    } else if (step === 'confirm') {
      setStep('select-time');
    }
  };

  const stepTitles: Record<Step, string> = {
    detail: provider.name,
    'select-service': '選擇服務',
    'select-staff': '選擇設計師',
    'select-time': '選擇時段',
    confirm: '確認預約',
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        paddingTop: Platform.OS === 'web' ? 16 : insets.top + 4,
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <TouchableOpacity onPress={goBack} style={{ marginRight: 12, padding: 4 }}>
              <Text style={{ fontSize: 16, color: colors.foreground }}>←</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }} numberOfLines={1}>
              {stepTitles[step]}
            </Text>
          </View>
          {/* Item #1: Favorite Button */}
          {step === 'detail' && (
            <TouchableOpacity onPress={() => toggleFavorite(id)} style={{ padding: 4 }}>
              <Text style={{ fontSize: 22 }}>{favorited ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Item #4: Deposit Disclaimer Modal */}
      {showDepositDisclaimer && (
        <View style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          padding: 30,
        }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: 24,
            maxWidth: 340,
            width: '100%',
          }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.foreground, marginBottom: 12, textAlign: 'center' }}>
              訂金告知
            </Text>
            <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 22, marginBottom: 8 }}>
              本次預約將收取服務金額 10% 作為訂金。
            </Text>
            <Text style={{ fontSize: 14, color: colors.error, lineHeight: 22, marginBottom: 8, fontWeight: '500' }}>
              注意事項：
            </Text>
            <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20, marginBottom: 4 }}>
              • 無故未到或取消預約，訂金視同放棄，恕不退還。
            </Text>
            <Text style={{ fontSize: 13, color: colors.foreground, lineHeight: 20, marginBottom: 16 }}>
              • 私底下交易，本平台不承擔任何保障。
            </Text>
            <TouchableOpacity
              onPress={handleAcceptDisclaimer}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingVertical: 14,
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.surface }}>
                我已了解，確認付款 ${depositAmount}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowDepositDisclaimer(false)}
              style={{ paddingVertical: 10, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, color: colors.muted }}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        {/* ── Step: Provider Detail ── */}
        {step === 'detail' && (
          <View style={{ padding: 20 }}>
            {/* Provider Info */}
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ fontSize: 13, color: colors.muted }}>
                  {SERVICE_CATEGORY_LABELS[provider.category]} · {provider.city} {provider.district}
                </Text>
                {provider.isVerified && (
                  <View style={{
                    marginLeft: 8,
                    backgroundColor: colors.primary,
                    borderRadius: 4,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                  }}>
                    <Text style={{ fontSize: 10, color: colors.surface, fontWeight: '600' }}>認證</Text>
                  </View>
                )}
              </View>

              {/* Item #7: thumbs rating */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <ThumbsRating rating={provider.rating} size={14} />
                <Text style={{ fontSize: 15, fontWeight: '600', color: colors.foreground, marginLeft: 6 }}>
                  {provider.rating}
                </Text>
                <Text style={{ fontSize: 13, color: colors.muted, marginLeft: 4 }}>
                  {provider.reviewCount} 則評價
                </Text>
              </View>

              <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 22 }}>
                {provider.description}
              </Text>
            </View>

            {/* Item #9: Photo Gallery (max 6) */}
            {provider.photos && provider.photos.length > 0 && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 10 }}>
                  店鋪相簿
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                  {provider.photos.slice(0, 6).map((photo, index) => (
                    <View
                      key={index}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 10,
                        backgroundColor: colors.border,
                        marginRight: 8,
                        justifyContent: 'center',
                        alignItems: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      <Text style={{ fontSize: 12, color: colors.muted }}>照片 {index + 1}</Text>
                    </View>
                  ))}
                </ScrollView>
              </>
            )}
            {/* Photo gallery placeholder when no photos */}
            {(!provider.photos || provider.photos.length === 0) && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 10 }}>
                  店鋪相簿
                </Text>
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 24,
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                  <Text style={{ fontSize: 30, marginBottom: 6 }}>📷</Text>
                  <Text style={{ fontSize: 13, color: colors.muted }}>商家尚未上傳照片</Text>
                </View>
              </>
            )}

            {/* Contact & Address - Item #10 & #11 */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              marginBottom: 20,
            }}>
              {/* Address → Google Maps */}
              <TouchableOpacity
                onPress={openGoogleMaps}
                style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, color: colors.muted, width: 50 }}>地址</Text>
                <Text style={{ fontSize: 13, color: colors.primary, flex: 1, textDecorationLine: 'underline' }}>
                  {provider.address}
                </Text>
                <Text style={{ fontSize: 12, marginLeft: 4 }}>📍</Text>
              </TouchableOpacity>
              {/* Phone → dial */}
              <TouchableOpacity
                onPress={callPhone}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 13, color: colors.muted, width: 50 }}>電話</Text>
                <Text style={{ fontSize: 13, color: colors.primary, textDecorationLine: 'underline' }}>
                  {provider.phone}
                </Text>
                <Text style={{ fontSize: 12, marginLeft: 4 }}>📞</Text>
              </TouchableOpacity>
            </View>

            {/* Services Preview */}
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 10 }}>
              服務項目
            </Text>
            {provider.services.map((service) => (
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
                    {service.description} · {service.duration}分鐘
                  </Text>
                </View>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                  ${service.price}
                </Text>
              </View>
            ))}

            {/* Staff */}
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginTop: 16, marginBottom: 10 }}>
              服務人員
            </Text>
            {provider.staffMembers.map((staff) => (
              <View
                key={staff.id}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.background,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                }}>
                  <Text style={{ fontSize: 16 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '500', color: colors.foreground }}>
                    {staff.name}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted }}>
                    {staff.title} · <ThumbsRating rating={staff.rating} size={11} /> ({staff.reviewCount})
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    {staff.specialties.join('、')}
                  </Text>
                </View>
              </View>
            ))}

            {/* Reviews with thumbs rating (#7) */}
            {providerReviews.length > 0 && (
              <>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginTop: 16, marginBottom: 10 }}>
                  評價
                </Text>
                {providerReviews.map((review) => (
                  <View
                    key={review.id}
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
                      <Text style={{ fontSize: 13, color: colors.muted }}>
                        {review.serviceName} · {review.staffName}
                      </Text>
                      <ThumbsRating rating={review.rating} size={13} />
                    </View>
                    <Text style={{ fontSize: 14, color: colors.foreground, lineHeight: 20 }}>
                      {review.comment}
                    </Text>
                  </View>
                ))}
              </>
            )}

            {/* Business Hours */}
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginTop: 16, marginBottom: 10 }}>
              營業時間
            </Text>
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
            }}>
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                const labels: Record<string, string> = {
                  mon: '週一', tue: '週二', wed: '週三', thu: '週四',
                  fri: '週五', sat: '週六', sun: '週日',
                };
                const hours = provider.businessHours[day];
                return (
                  <View key={day} style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    paddingVertical: 4,
                  }}>
                    <Text style={{ fontSize: 13, color: colors.foreground }}>{labels[day]}</Text>
                    <Text style={{ fontSize: 13, color: hours ? colors.foreground : colors.error }}>
                      {hours ? `${hours.open} - ${hours.close}` : '公休'}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Book Button */}
            <TouchableOpacity
              onPress={() => setStep('select-service')}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: 24,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.surface }}>立即預約</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Step: Select Service ── */}
        {step === 'select-service' && (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
              選擇你想要的服務
            </Text>
            {provider.services.filter((s) => s.isAvailable).map((service) => (
              <TouchableOpacity
                key={service.id}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedService(service);
                  setStep('select-staff');
                }}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selectedService?.id === service.id ? colors.primary : colors.border,
                  padding: 16,
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                      {service.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
                      {service.description}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      ⏱ {service.duration} 分鐘
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
                      ${service.price}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                      訂金 ${Math.round(service.price * 0.1)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Step: Select Staff ── */}
        {step === 'select-staff' && (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
              選擇服務人員
            </Text>
            {provider.staffMembers.map((staff) => (
              <TouchableOpacity
                key={staff.id}
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedStaff(staff);
                  setSelectedDate(dates[0].date);
                  setStep('select-time');
                }}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: selectedStaff?.id === staff.id ? colors.primary : colors.border,
                  padding: 16,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: colors.background,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 14,
                }}>
                  <Text style={{ fontSize: 20 }}>👤</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '500', color: colors.foreground }}>
                    {staff.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.muted, marginTop: 2 }}>
                    {staff.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
                    {staff.specialties.join('、')}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThumbsRating rating={staff.rating} size={12} />
                  <Text style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                    {staff.reviewCount} 則評價
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Step: Select Time ── */}
        {step === 'select-time' && (
          <View style={{ padding: 20 }}>
            {/* Date Selection */}
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 12 }}>
              選擇日期
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {dates.map((d) => (
                <TouchableOpacity
                  key={d.date}
                  onPress={() => { setSelectedDate(d.date); setSelectedTime(''); }}
                  style={{
                    width: 64,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: selectedDate === d.date ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: selectedDate === d.date ? colors.primary : colors.border,
                    marginRight: 8,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    color: selectedDate === d.date ? colors.surface : colors.muted,
                    marginBottom: 2,
                  }}>
                    {d.dayLabel}
                  </Text>
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: selectedDate === d.date ? colors.surface : colors.foreground,
                  }}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time Selection - Item #3: only show available slots */}
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 12 }}>
              選擇時段
            </Text>
            {availableSlots.length === 0 ? (
              <View style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 24,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 14, color: colors.muted }}>此日期無可預約時段</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={!slot.isAvailable}
                    onPress={() => setSelectedTime(slot.time)}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 8,
                      backgroundColor: !slot.isAvailable
                        ? colors.border
                        : selectedTime === slot.time
                          ? colors.primary
                          : colors.surface,
                      borderWidth: 1,
                      borderColor: !slot.isAvailable
                        ? colors.border
                        : selectedTime === slot.time
                          ? colors.primary
                          : colors.border,
                      opacity: slot.isAvailable ? 1 : 0.4,
                    }}
                  >
                    <Text style={{
                      fontSize: 14,
                      fontWeight: '500',
                      color: !slot.isAvailable
                        ? colors.muted
                        : selectedTime === slot.time
                          ? colors.surface
                          : colors.foreground,
                    }}>
                      {slot.time}
                    </Text>
                    {!slot.isAvailable && (
                      <Text style={{ fontSize: 9, color: colors.muted, textAlign: 'center' }}>已預約</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Next */}
            {selectedTime && (
              <TouchableOpacity
                onPress={() => setStep('confirm')}
                style={{
                  backgroundColor: colors.primary,
                  borderRadius: 10,
                  paddingVertical: 16,
                  alignItems: 'center',
                  marginTop: 24,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.surface }}>
                  下一步
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── Step: Confirm ── */}
        {step === 'confirm' && selectedService && selectedStaff && (
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 14, color: colors.muted, marginBottom: 16 }}>
              請確認以下預約資訊
            </Text>

            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
              marginBottom: 16,
            }}>
              {[
                { label: '店家', value: provider.name },
                { label: '服務', value: selectedService.name },
                { label: '設計師', value: selectedStaff.name },
                { label: '日期', value: selectedDate },
                { label: '時間', value: selectedTime },
                { label: '時長', value: `${selectedService.duration} 分鐘` },
              ].map((row) => (
                <View key={row.label} style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 8,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}>
                  <Text style={{ fontSize: 14, color: colors.muted }}>{row.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground }}>{row.value}</Text>
                </View>
              ))}
            </View>

            {/* Note */}
            <Text style={{ fontSize: 14, fontWeight: '500', color: colors.foreground, marginBottom: 6 }}>
              備註（選填）
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="例如：想要自然風格的造型"
              placeholderTextColor={colors.muted}
              multiline
              style={{
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 14,
                paddingVertical: 12,
                fontSize: 14,
                color: colors.foreground,
                height: 70,
                textAlignVertical: 'top',
                marginBottom: 20,
                ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
              } as any}
            />

            {/* Price Summary - Item #4: 10% deposit */}
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 16,
              marginBottom: 20,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>服務金額</Text>
                <Text style={{ fontSize: 14, color: colors.foreground }}>${selectedService.price}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 14, color: colors.foreground }}>訂金（10%）</Text>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.primary }}>${depositAmount}</Text>
              </View>
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 8,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}>
                <Text style={{ fontSize: 14, color: colors.muted }}>到店再付</Text>
                <Text style={{ fontSize: 14, color: colors.muted }}>${selectedService.price - depositAmount}</Text>
              </View>
            </View>

            {/* Payment Note - Item #4 */}
            <View style={{
              backgroundColor: '#FFF3E0',
              borderRadius: 8,
              padding: 12,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#FFB74D',
            }}>
              <Text style={{ fontSize: 13, color: '#E65100', lineHeight: 20, fontWeight: '500' }}>
                ⚠ 重要提醒
              </Text>
              <Text style={{ fontSize: 12, color: '#BF360C', lineHeight: 18, marginTop: 4 }}>
                • 預約成功後將收取服務金額 10% 作為訂金。{'\n'}
                • 無故未到或取消預約，訂金視同放棄，恕不退還。{'\n'}
                • 私底下交易，本平台不承擔任何保障。
              </Text>
            </View>

            {/* Confirm Button - triggers disclaimer popup */}
            <TouchableOpacity
              onPress={handleProceedToConfirm}
              style={{
                backgroundColor: colors.primary,
                borderRadius: 10,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.surface }}>
                確認預約並付訂金 ${depositAmount}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

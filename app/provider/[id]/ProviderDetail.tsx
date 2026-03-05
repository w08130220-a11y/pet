'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { SERVICE_CATEGORY_LABELS, type Service, type StaffMember } from '@/lib/types';

type ReportTarget = { itemId: string; title: string } | null;

type Step = 'detail' | 'select-service' | 'select-staff' | 'select-time' | 'confirm';

function ThumbsRating({ rating, size = 14 }: { rating: number; size?: number }) {
  const filled = Math.round(rating);
  return (
    <span style={{ fontSize: size }}>
      {'👍'.repeat(filled)}
      {filled < 5 && <span className="opacity-25">{'👍'.repeat(5 - filled)}</span>}
    </span>
  );
}

export default function ProviderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { getProvider, getAvailableSlots, createBooking, state, toggleFavorite, isFavorite, getOrCreateChatRoom, reportPortfolio } = useAppStore();

  const provider = getProvider(id);

  const [step, setStep] = useState<Step>('detail');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [note, setNote] = useState('');
  const [showDepositDisclaimer, setShowDepositDisclaimer] = useState(false);
  const [reportTarget, setReportTarget] = useState<ReportTarget>(null);
  const [reportReason, setReportReason] = useState('');

  const favorited = isFavorite(id);
  const portfolioItems = state.portfolioItems.filter((p) => p.providerId === id);

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

  const availableSlots = useMemo(() => {
    if (!selectedStaff || !selectedDate) return [];
    return getAvailableSlots(id, selectedStaff.id, selectedDate);
  }, [id, selectedStaff, selectedDate, getAvailableSlots]);

  const depositAmount = selectedService ? Math.round(selectedService.price * 0.1) : 0;
  const providerReviews = state.reviews.filter((r) => r.providerId === id);

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#f0f4ed' }}>
        <p style={{ fontSize: 16, color: '#8a8a80' }}>找不到該店家</p>
        <button onClick={() => router.back()} className="mt-4 text-sm" style={{ color: '#4a6741' }}>返回</button>
      </div>
    );
  }

  const handleConfirmBooking = () => {
    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) return;
    createBooking({
      providerId: provider.id, providerName: provider.name,
      serviceId: selectedService.id, serviceName: selectedService.name,
      staffId: selectedStaff.id, staffName: selectedStaff.name,
      date: selectedDate, time: selectedTime,
      duration: selectedService.duration, totalPrice: selectedService.price,
      depositAmount, depositPaid: true, status: 'confirmed', note,
    });
    alert(`預約成功！\n\n${provider.name}\n${selectedService.name}\n${selectedDate} ${selectedTime}\n設計師：${selectedStaff.name}\n\n訂金 $${depositAmount} 已付款`);
    router.push('/bookings');
  };

  const goBack = () => {
    if (step === 'detail') router.back();
    else if (step === 'select-service') setStep('detail');
    else if (step === 'select-staff') setStep('select-service');
    else if (step === 'select-time') setStep('select-staff');
    else if (step === 'confirm') setStep('select-time');
  };

  const stepTitles: Record<Step, string> = {
    detail: provider.name,
    'select-service': '選擇服務',
    'select-staff': '選擇設計師',
    'select-time': '選擇時段',
    confirm: '確認預約',
  };

  return (
    <div className="min-h-screen pb-0" style={{ background: '#f0f4ed' }}>
      {/* Header */}
      <div className="sticky top-0 z-40 px-5 pt-4 pb-3" style={{ background: 'rgba(240,244,237,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <button onClick={goBack} className="mr-3 p-1 text-base" style={{ color: '#1a1a18' }}>←</button>
            <span className="text-lg font-semibold truncate" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>{stepTitles[step]}</span>
          </div>
          {step === 'detail' && (
            <button onClick={() => toggleFavorite(id)} className="p-1 text-[22px]">
              {favorited ? '❤️' : '🤍'}
            </button>
          )}
        </div>
      </div>

      {/* Deposit Disclaimer Modal */}
      {showDepositDisclaimer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
          <div className="rounded-2xl p-6 max-w-[340px] w-full" style={{ background: '#fff' }}>
            <h3 className="text-lg font-bold mb-3 text-center" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>訂金告知</h3>
            <p className="text-sm leading-[22px] mb-2" style={{ color: '#1a1a18' }}>本次預約將收取服務金額 10% 作為訂金。</p>
            <p className="text-sm leading-[22px] mb-2 font-medium" style={{ color: '#a85a4a' }}>注意事項：</p>
            <p className="leading-5 mb-1" style={{ fontSize: 13, color: '#1a1a18' }}>• 無故未到或取消預約，訂金視同放棄，恕不退還。</p>
            <p className="leading-5 mb-4" style={{ fontSize: 13, color: '#1a1a18' }}>• 私底下交易，本平台不承擔任何保障。</p>
            <button
              onClick={() => { setShowDepositDisclaimer(false); handleConfirmBooking(); }}
              className="w-full rounded-full py-3.5 text-[15px] font-semibold mb-2"
              style={{ background: '#4a6741', color: '#fff' }}
            >
              我已了解，確認付款 ${depositAmount}
            </button>
            <button onClick={() => setShowDepositDisclaimer(false)} className="w-full py-2.5 text-sm text-center" style={{ color: '#8a8a80' }}>
              取消
            </button>
          </div>
        </div>
      )}

      <div className="overflow-y-auto">
        {/* ── Detail ── */}
        {step === 'detail' && (
          <div className="p-5">
            {/* Provider Info */}
            <div className="mb-5">
              <div className="flex items-center mb-1.5">
                <span style={{ fontSize: 13, color: '#8a8a80' }}>
                  {SERVICE_CATEGORY_LABELS[provider.category]} · {provider.city} {provider.district}
                </span>
                {provider.isVerified && (
                  <span className="ml-2 text-[10px] font-semibold rounded px-1.5 py-0.5" style={{ background: '#4a6741', color: '#fff' }}>認證</span>
                )}
              </div>
              <div className="flex items-center mb-2.5">
                <ThumbsRating rating={provider.rating} />
                <span className="text-[15px] font-semibold ml-1.5" style={{ color: '#1a1a18' }}>{provider.rating}</span>
                <span className="ml-1" style={{ fontSize: 13, color: '#8a8a80' }}>{provider.reviewCount} 則評價</span>
              </div>
              <p className="text-sm leading-[22px]" style={{ color: '#1a1a18' }}>{provider.description}</p>
            </div>

            {/* Photos */}
            <h3 className="text-base font-semibold mb-2.5" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>店鋪相簿</h3>
            {provider.photos && provider.photos.length > 0 ? (
              <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-5">
                {provider.photos.slice(0, 6).map((_, index) => (
                  <div key={index} className="w-[120px] h-[120px] shrink-0 rounded-[10px] flex items-center justify-center" style={{ background: '#e8ede6' }}>
                    <span style={{ fontSize: 12, color: '#8a8a80' }}>照片 {index + 1}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="area-card p-6 text-center mb-5">
                <div className="text-[30px] mb-1.5">📷</div>
                <p style={{ fontSize: 13, color: '#8a8a80' }}>商家尚未上傳照片</p>
              </div>
            )}

            {/* Contact */}
            <div className="area-card p-3.5 mb-5">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(provider.address)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center mb-2"
              >
                <span style={{ fontSize: 13, color: '#8a8a80', width: 50 }}>地址</span>
                <span className="flex-1 underline" style={{ fontSize: 13, color: '#4a6741' }}>{provider.address}</span>
                <span className="text-xs ml-1">📍</span>
              </a>
              <a href={`tel:${provider.phone.replace(/[^0-9]/g, '')}`} className="flex items-center">
                <span style={{ fontSize: 13, color: '#8a8a80', width: 50 }}>電話</span>
                <span className="underline" style={{ fontSize: 13, color: '#4a6741' }}>{provider.phone}</span>
                <span className="text-xs ml-1">📞</span>
              </a>
            </div>

            {/* Services */}
            <h3 className="text-base font-semibold mb-2.5" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>服務項目</h3>
            {provider.services.map((service) => (
              <div key={service.id} className="area-card p-3.5 mb-2 flex justify-between items-center">
                <div className="flex-1">
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>{service.name}</p>
                  <p style={{ fontSize: 13, color: '#8a8a80', marginTop: 2 }}>{service.description} · {service.duration}分鐘</p>
                </div>
                <span className="text-base font-semibold" style={{ color: '#1a1a18' }}>${service.price}</span>
              </div>
            ))}

            {/* Staff */}
            <h3 className="text-base font-semibold mt-4 mb-2.5" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>服務人員</h3>
            {provider.staffMembers.map((staff) => (
              <div key={staff.id} className="area-card p-3.5 mb-2 flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ background: '#f0f4ed' }}>
                  <span className="text-base">👤</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>{staff.name}</p>
                  <p style={{ fontSize: 12, color: '#8a8a80' }}>
                    {staff.title} · <ThumbsRating rating={staff.rating} size={11} /> ({staff.reviewCount})
                  </p>
                  <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 2 }}>{staff.specialties.join('、')}</p>
                </div>
              </div>
            ))}

            {/* Reviews */}
            {providerReviews.length > 0 && (
              <>
                <h3 className="text-base font-semibold mt-4 mb-2.5" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>評價</h3>
                {providerReviews.map((review) => (
                  <div key={review.id} className="area-card p-3.5 mb-2">
                    <div className="flex justify-between mb-1.5">
                      <span style={{ fontSize: 13, color: '#8a8a80' }}>{review.serviceName} · {review.staffName}</span>
                      <ThumbsRating rating={review.rating} size={13} />
                    </div>
                    <p className="text-sm leading-5" style={{ color: '#1a1a18' }}>{review.comment}</p>
                  </div>
                ))}
              </>
            )}

            {/* Portfolio */}
            {portfolioItems.length > 0 && (
              <>
                <h3 className="text-base font-semibold mt-4 mb-2.5" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>作品集</h3>
                <div className="flex overflow-x-auto hide-scrollbar gap-2.5 mb-2">
                  {portfolioItems.map((item) => (
                    <div key={item.id} className="shrink-0 w-[160px] area-card overflow-hidden" style={{ padding: 0 }}>
                      <div className="w-full h-[120px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,216,194,0.3), rgba(74,103,65,0.15))' }}>
                        <span className="text-3xl">🎨</span>
                      </div>
                      <div className="p-2.5">
                        <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{item.title}</p>
                        <p className="truncate" style={{ fontSize: 11, color: '#8a8a80' }}>{item.staffName}</p>
                        <p className="truncate" style={{ fontSize: 11, color: '#8a8a80', marginTop: 2 }}>{item.description}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setReportTarget({ itemId: item.id, title: item.title }); }}
                          style={{ fontSize: 11, color: '#a85a4a', marginTop: 4 }}
                        >
                          檢舉作品
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Chat Button */}
            <button
              onClick={() => {
                const roomId = getOrCreateChatRoom(provider.id, provider.name);
                router.push(`/chat/${roomId}`);
              }}
              className="w-full rounded-xl py-3.5 mt-4 text-[15px] font-semibold flex items-center justify-center gap-2"
              style={{ border: '2px solid #4a6741', color: '#4a6741' }}
            >
              💬 與店家聊天
            </button>

            {/* Report Modal */}
            {reportTarget && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
                <div className="rounded-2xl p-6 max-w-[340px] w-full" style={{ background: '#fff' }}>
                  <h3 className="text-lg font-bold mb-2" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>檢舉作品</h3>
                  <p className="text-sm mb-3" style={{ color: '#8a8a80' }}>檢舉「{reportTarget.title}」</p>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full rounded-lg px-3.5 py-3 text-sm mb-3"
                    style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }}
                  >
                    <option value="">選擇檢舉原因</option>
                    <option value="盜用他人作品">盜用他人作品</option>
                    <option value="與實際不符">照片與實際服務不符</option>
                    <option value="不當內容">不當內容</option>
                    <option value="其他">其他</option>
                  </select>
                  <button
                    onClick={() => {
                      if (!reportReason) { alert('請選擇檢舉原因'); return; }
                      reportPortfolio(reportTarget.itemId, reportReason);
                      alert('檢舉已送出，我們會盡速審查。若確認竊取作品，該商家將立即被列入黑名單。');
                      setReportTarget(null);
                      setReportReason('');
                    }}
                    className="w-full rounded-full py-3 text-[15px] font-semibold mb-2"
                    style={{ background: '#a85a4a', color: '#fff' }}
                  >
                    送出檢舉
                  </button>
                  <button
                    onClick={() => { setReportTarget(null); setReportReason(''); }}
                    className="w-full py-2.5 text-sm text-center"
                    style={{ color: '#8a8a80' }}
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            {/* Business Hours */}
            <h3 className="text-base font-semibold mt-4 mb-2.5" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>營業時間</h3>
            <div className="area-card p-3.5">
              {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
                const labels: Record<string, string> = {
                  mon: '週一', tue: '週二', wed: '週三', thu: '週四',
                  fri: '週五', sat: '週六', sun: '週日',
                };
                const hours = provider.businessHours[day];
                return (
                  <div key={day} className="flex justify-between py-1">
                    <span style={{ fontSize: 13, color: '#1a1a18' }}>{labels[day]}</span>
                    <span style={{ fontSize: 13, color: hours ? '#1a1a18' : '#a85a4a' }}>
                      {hours ? `${hours.open} - ${hours.close}` : '公休'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Book Button */}
            <button
              onClick={() => setStep('select-service')}
              className="w-full rounded-full py-4 mt-6 text-base font-semibold"
              style={{ background: '#4a6741', color: '#fff' }}
            >
              立即預約
            </button>
          </div>
        )}

        {/* ── Select Service ── */}
        {step === 'select-service' && (
          <div className="p-5">
            <p className="text-sm mb-4" style={{ color: '#8a8a80' }}>選擇你想要的服務</p>
            {provider.services.filter((s) => s.isAvailable).map((service) => (
              <button
                key={service.id}
                onClick={() => { setSelectedService(service); setStep('select-staff'); }}
                className="w-full text-left rounded-xl p-4 mb-2.5"
                style={{
                  background: '#fff',
                  border: selectedService?.id === service.id ? '2px solid #4a6741' : '1px solid #e8ede6',
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-base font-medium" style={{ color: '#1a1a18' }}>{service.name}</p>
                    <p style={{ fontSize: 13, color: '#8a8a80', marginTop: 4 }}>{service.description}</p>
                    <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 4 }}>⏱ {service.duration} 分鐘</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold" style={{ color: '#1a1a18' }}>${service.price}</p>
                    <p style={{ fontSize: 11, color: '#8a8a80', marginTop: 2 }}>訂金 ${Math.round(service.price * 0.1)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Select Staff ── */}
        {step === 'select-staff' && (
          <div className="p-5">
            <p className="text-sm mb-4" style={{ color: '#8a8a80' }}>選擇服務人員</p>
            {provider.staffMembers.map((staff) => (
              <button
                key={staff.id}
                onClick={() => { setSelectedStaff(staff); setSelectedDate(dates[0].date); setStep('select-time'); }}
                className="w-full text-left rounded-xl p-4 mb-2.5 flex items-center"
                style={{
                  background: '#fff',
                  border: selectedStaff?.id === staff.id ? '2px solid #4a6741' : '1px solid #e8ede6',
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3.5" style={{ background: '#f0f4ed' }}>
                  <span className="text-xl">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium" style={{ color: '#1a1a18' }}>{staff.name}</p>
                  <p style={{ fontSize: 13, color: '#8a8a80', marginTop: 2 }}>{staff.title}</p>
                  <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 2 }}>{staff.specialties.join('、')}</p>
                </div>
                <div className="text-right">
                  <ThumbsRating rating={staff.rating} size={12} />
                  <p style={{ fontSize: 11, color: '#8a8a80', marginTop: 2 }}>{staff.reviewCount} 則評價</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ── Select Time ── */}
        {step === 'select-time' && (
          <div className="p-5">
            <p className="text-sm mb-3" style={{ color: '#8a8a80' }}>選擇日期</p>
            <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-5">
              {dates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => { setSelectedDate(d.date); setSelectedTime(''); }}
                  className="shrink-0 w-16 py-2.5 rounded-[10px] text-center"
                  style={{
                    background: selectedDate === d.date ? '#4a6741' : '#fff',
                    border: selectedDate === d.date ? '1px solid #4a6741' : '1px solid #e8ede6',
                  }}
                >
                  <p style={{ fontSize: 12, color: selectedDate === d.date ? '#fff' : '#8a8a80', marginBottom: 2 }}>
                    {d.dayLabel}
                  </p>
                  <p className="text-base font-semibold" style={{ color: selectedDate === d.date ? '#fff' : '#1a1a18' }}>
                    {d.label}
                  </p>
                </button>
              ))}
            </div>

            <p className="text-sm mb-3" style={{ color: '#8a8a80' }}>選擇時段</p>
            {availableSlots.length === 0 ? (
              <div className="area-card p-6 text-center">
                <p style={{ fontSize: 14, color: '#8a8a80' }}>此日期無可預約時段</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    disabled={!slot.isAvailable}
                    onClick={() => setSelectedTime(slot.time)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium"
                    style={
                      !slot.isAvailable
                        ? { background: '#e8ede6', border: '1px solid #e8ede6', color: '#8a8a80', opacity: 0.4, cursor: 'not-allowed' }
                        : selectedTime === slot.time
                          ? { background: '#4a6741', border: '1px solid #4a6741', color: '#fff' }
                          : { background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }
                    }
                  >
                    {slot.time}
                    {!slot.isAvailable && (
                      <span className="block text-center" style={{ fontSize: 9, color: '#8a8a80' }}>已預約</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedTime && (
              <button
                onClick={() => setStep('confirm')}
                className="w-full rounded-full py-4 mt-6 text-base font-semibold"
                style={{ background: '#4a6741', color: '#fff' }}
              >
                下一步
              </button>
            )}
          </div>
        )}

        {/* ── Confirm ── */}
        {step === 'confirm' && selectedService && selectedStaff && (
          <div className="p-5">
            <p className="text-sm mb-4" style={{ color: '#8a8a80' }}>請確認以下預約資訊</p>

            <div className="area-card p-4 mb-4">
              {[
                { label: '店家', value: provider.name },
                { label: '服務', value: selectedService.name },
                { label: '設計師', value: selectedStaff.name },
                { label: '日期', value: selectedDate },
                { label: '時間', value: selectedTime },
                { label: '時長', value: `${selectedService.duration} 分鐘` },
              ].map((row, i, arr) => (
                <div key={row.label} className="flex justify-between py-2" style={i < arr.length - 1 ? { borderBottom: '1px solid #e8ede6' } : undefined}>
                  <span style={{ fontSize: 14, color: '#8a8a80' }}>{row.label}</span>
                  <span className="text-sm font-medium" style={{ color: '#1a1a18' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Note */}
            <p className="text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>備註（選填）</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：想要自然風格的造型"
              className="w-full rounded-lg px-3.5 py-3 text-sm h-[70px] resize-none mb-5"
              style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }}
            />

            {/* Price Summary */}
            <div className="area-card p-4 mb-5">
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: 14, color: '#1a1a18' }}>服務金額</span>
                <span style={{ fontSize: 14, color: '#1a1a18' }}>${selectedService.price}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ fontSize: 14, color: '#1a1a18' }}>訂金（10%）</span>
                <span className="text-sm font-semibold" style={{ color: '#4a6741' }}>${depositAmount}</span>
              </div>
              <div className="flex justify-between pt-2" style={{ borderTop: '1px solid #e8ede6' }}>
                <span style={{ fontSize: 14, color: '#8a8a80' }}>到店再付</span>
                <span style={{ fontSize: 14, color: '#8a8a80' }}>${selectedService.price - depositAmount}</span>
              </div>
            </div>

            {/* Warning */}
            <div className="rounded-lg p-3 mb-5" style={{ background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.3)' }}>
              <p className="leading-5 font-medium" style={{ fontSize: 13, color: '#1a1a18' }}>⚠ 重要提醒</p>
              <p className="leading-[18px] mt-1" style={{ fontSize: 12, color: '#8a8a80' }}>
                • 預約成功後將收取服務金額 10% 作為訂金。<br />
                • 無故未到或取消預約，訂金視同放棄，恕不退還。<br />
                • 私底下交易，本平台不承擔任何保障。
              </p>
            </div>

            {/* Confirm Button */}
            <button
              onClick={() => setShowDepositDisclaimer(true)}
              className="w-full rounded-full py-4 text-base font-semibold"
              style={{ background: '#4a6741', color: '#fff' }}
            >
              確認預約並付訂金 ${depositAmount}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

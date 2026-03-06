'use client';

import { useState } from 'react';
import { useAppStore, serviceCategories } from '@/lib/store';

const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export default function BookingPage() {
  const { stylists, services } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStylist, setSelectedStylist] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(s => s.category === selectedCategory);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: d.toISOString().split('T')[0],
      day: ['日', '一', '二', '三', '四', '五', '六'][d.getDay()],
      date: d.getDate(),
    };
  });

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-[32px] font-bold font-heading tracking-tight" style={{ color: 'var(--color-black)' }}>
          預約
        </h1>
        <p className="text-body mt-1">選擇美容師與服務，輕鬆預約</p>
      </div>

      {/* Step 1: Choose Stylist */}
      <div className="px-5 mb-5">
        <p className="text-ui mb-3">1. 選擇美容師</p>
        <div className="flex flex-col gap-2">
          {stylists.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedStylist(s.id)}
              className={`card p-4 flex items-center gap-3 text-left transition-all ${
                selectedStylist === s.id ? 'ring-2' : ''
              }`}
              style={selectedStylist === s.id ? { borderColor: 'var(--color-olive-dark)' } : undefined}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0"
                style={{ background: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
              >
                {s.name.split(' ')[0][0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-ui text-[14px]">{s.name}</p>
                <p className="text-label text-[12px]">{s.salon} · {s.distance}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[11px]">⭐ {s.rating}</span>
                  <span className="text-label text-[10px]">({s.reviewCount} 評價)</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {s.specialties.slice(0, 2).map(sp => (
                  <span key={sp} className="chip text-[10px] py-0.5 px-2">{sp}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Choose Service */}
      {selectedStylist && (
        <div className="px-5 mb-5">
          <p className="text-ui mb-3">2. 選擇服務</p>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-3">
            {serviceCategories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`chip whitespace-nowrap ${selectedCategory === cat.key ? 'chip-active' : ''}`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {filteredServices.map(sv => (
              <button
                key={sv.id}
                onClick={() => setSelectedService(sv.id)}
                className={`card p-4 flex items-center justify-between text-left ${
                  selectedService === sv.id ? 'ring-2' : ''
                }`}
                style={selectedService === sv.id ? { borderColor: 'var(--color-olive-dark)' } : undefined}
              >
                <div>
                  <p className="text-ui text-[14px]">{sv.name}</p>
                  <p className="text-label text-[12px]">{sv.description}</p>
                  <p className="text-label text-[11px] mt-0.5">{sv.duration} 分鐘</p>
                </div>
                <p className="text-keypoint text-[16px] font-bold shrink-0" style={{ color: 'var(--color-olive-dark)' }}>
                  ${sv.price}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Choose Date & Time */}
      {selectedService && (
        <div className="px-5 mb-5">
          <p className="text-ui mb-3">3. 選擇日期與時段</p>
          {/* Date picker */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-4">
            {dates.map(d => (
              <button
                key={d.value}
                onClick={() => setSelectedDate(d.value)}
                className={`flex flex-col items-center gap-1 py-2 px-3 rounded-xl border transition-colors ${
                  selectedDate === d.value ? 'border-olive-dark' : ''
                }`}
                style={{
                  borderColor: selectedDate === d.value ? 'var(--color-olive-dark)' : 'var(--color-border)',
                  background: selectedDate === d.value ? 'var(--color-olive-light)' : 'var(--color-surface-white)',
                }}
              >
                <span className="text-label text-[11px]">週{d.day}</span>
                <span className="text-ui text-[16px]">{d.date}</span>
              </button>
            ))}
          </div>
          {/* Time slots */}
          {selectedDate && (
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map(t => (
                <button
                  key={t}
                  onClick={() => setSelectedTime(t)}
                  className={`py-2 rounded-xl text-center text-[13px] font-medium border transition-colors ${
                    selectedTime === t ? '' : ''
                  }`}
                  style={{
                    borderColor: selectedTime === t ? 'var(--color-olive-dark)' : 'var(--color-border)',
                    background: selectedTime === t ? 'var(--color-olive-light)' : 'var(--color-surface-white)',
                    color: selectedTime === t ? 'var(--color-olive-dark)' : 'var(--color-gray)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm */}
      {selectedTime && (
        <div className="px-5">
          <button className="btn-filled w-full text-center justify-center text-[15px] py-3.5">
            確認預約
          </button>
        </div>
      )}
    </div>
  );
}

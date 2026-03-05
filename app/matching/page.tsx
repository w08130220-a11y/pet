'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import {
  SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, CITIES, MATCHING_STATUS_LABELS,
  type ServiceCategory, type MatchingRequest,
} from '@/lib/types';

const CATEGORIES: ServiceCategory[] = ['nail', 'hair', 'massage', 'lash', 'spa', 'tattoo'];

function RequestCard({ request, onAccept, onChat }: {
  request: MatchingRequest;
  onAccept: (requestId: string, providerId: string, providerName: string) => void;
  onChat: (providerId: string, providerName: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColors: Record<string, { bg: string; color: string }> = {
    open: { bg: 'rgba(200,216,194,0.4)', color: '#4a6741' },
    matched: { bg: 'rgba(74,103,65,0.1)', color: '#2d6a2d' },
    expired: { bg: 'rgba(138,138,128,0.1)', color: '#8a8a80' },
    cancelled: { bg: 'rgba(168,90,74,0.1)', color: '#a85a4a' },
  };

  const sc = statusColors[request.status] || statusColors.open;

  return (
    <div className="area-card p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>
            {SERVICE_CATEGORY_ICONS[request.category]} {SERVICE_CATEGORY_LABELS[request.category]}
          </span>
          <p style={{ fontSize: 13, color: '#8a8a80', marginTop: 2 }}>
            {request.city} · {request.preferredDate} {request.preferredTime}
          </p>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: sc.bg, color: sc.color }}
        >
          {MATCHING_STATUS_LABELS[request.status]}
        </span>
      </div>
      <p style={{ fontSize: 14, color: '#1a1a18', marginBottom: 4 }}>{request.description}</p>
      <p style={{ fontSize: 13, color: '#8a8a80' }}>預算：{request.budget}</p>

      {request.responses.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm font-medium"
          style={{ color: '#4a6741' }}
        >
          {expanded ? '收起' : `查看 ${request.responses.length} 位設計師回覆 ▼`}
        </button>
      )}

      {expanded && request.responses.map((resp) => (
        <div key={resp.id} className="mt-2 rounded-lg p-3" style={{ background: '#f0f4ed', border: '1px solid #e8ede6' }}>
          <div className="flex justify-between items-center mb-1">
            <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>{resp.providerName}</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#4a6741' }}>${resp.price}</span>
          </div>
          <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 4 }}>設計師：{resp.staffName}</p>
          <p style={{ fontSize: 14, color: '#1a1a18', marginBottom: 8 }}>{resp.message}</p>
          <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 8 }}>
            可預約：{resp.availableDate} {resp.availableTime}
          </p>
          <div className="flex gap-2">
            {request.status === 'open' && (
              <button
                onClick={() => onAccept(request.id, resp.providerId, resp.providerName)}
                className="flex-1 rounded-full py-2 text-sm font-semibold"
                style={{ background: '#4a6741', color: '#fff' }}
              >
                選擇此設計師
              </button>
            )}
            <button
              onClick={() => onChat(resp.providerId, resp.providerName)}
              className="flex-1 rounded-full py-2 text-sm font-semibold"
              style={{ border: '1.5px solid #4a6741', color: '#4a6741', background: 'transparent' }}
            >
              聊天溝通
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MatchingPage() {
  const router = useRouter();
  const { state, createMatchingRequest, acceptMatching, getOrCreateChatRoom, createBooking } = useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    category: 'hair' as ServiceCategory,
    city: '台北市',
    district: '',
    budget: '',
    description: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: '14:00',
  });

  const myRequests = state.matchingRequests;

  const handleSubmit = () => {
    if (!form.description.trim()) {
      alert('請描述您的需求');
      return;
    }
    createMatchingRequest({
      customerId: 'user',
      category: form.category,
      city: form.city,
      district: form.district,
      budget: form.budget || '不限',
      description: form.description,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
    });
    setShowForm(false);
    setForm({ ...form, description: '', budget: '', district: '' });
    alert('需求已送出！設計師將會回覆您。');
  };

  const handleAccept = (requestId: string, providerId: string, providerName: string) => {
    acceptMatching(requestId);
    const req = state.matchingRequests.find((r) => r.id === requestId);
    const resp = req?.responses.find((r) => r.providerId === providerId);
    if (resp) {
      createBooking({
        providerId,
        providerName,
        serviceId: 'matched',
        serviceName: `媒合預約 - ${SERVICE_CATEGORY_LABELS[req!.category]}`,
        staffId: resp.staffId,
        staffName: resp.staffName,
        date: resp.availableDate,
        time: resp.availableTime,
        duration: 60,
        totalPrice: resp.price,
        depositAmount: Math.round(resp.price * 0.1),
        depositPaid: true,
        status: 'confirmed',
        note: req!.description,
      });
    }
    alert(`已選定 ${providerName}！預約已建立。`);
  };

  const handleChat = (providerId: string, providerName: string) => {
    const roomId = getOrCreateChatRoom(providerId, providerName);
    router.push(`/chat/${roomId}`);
  };

  const inputCls = 'w-full rounded-xl px-3.5 py-3 text-[15px] mb-3';

  return (
    <div className="min-h-screen pb-20" style={{ background: '#f0f4ed' }}>
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
          智能媒合
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'rgba(240,244,237,0.6)',
          position: 'relative',
          zIndex: 1,
        }}>
          描述你的需求，讓設計師主動來找你
        </p>
      </div>

      <div className="px-5 pt-5">
        {/* Toggle: Self-book vs Matching */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => router.push('/')}
            className="flex-1 rounded-xl py-3 text-center"
            style={{ border: '1px solid #e8ede6', background: '#fff' }}
          >
            <span className="text-lg block mb-1">🔍</span>
            <span className="text-sm font-medium" style={{ color: '#1a1a18' }}>自己選擇</span>
            <p style={{ fontSize: 11, color: '#8a8a80', marginTop: 2 }}>瀏覽店家自助預約</p>
          </button>
          <button
            className="flex-1 rounded-xl py-3 text-center"
            style={{ border: '2px solid #4a6741', background: 'rgba(200,216,194,0.3)' }}
          >
            <span className="text-lg block mb-1">🤖</span>
            <span className="text-sm font-semibold" style={{ color: '#4a6741' }}>智能媒合</span>
            <p style={{ fontSize: 11, color: '#8a8a80', marginTop: 2 }}>描述需求自動配對</p>
          </button>
        </div>

        {/* New Request Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full rounded-full py-4 text-base font-semibold mb-5 transition-all hover:opacity-90"
            style={{ background: '#4a6741', color: '#fff' }}
          >
            + 發佈新需求
          </button>
        )}

        {/* Request Form */}
        {showForm && (
          <div className="area-card p-4 mb-5" style={{ borderWidth: 2, borderColor: '#4a6741' }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1a1a18', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>填寫您的需求</h3>

            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>服務類型</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    form.category === cat ? 'area-chip area-chip-active' : 'area-chip'
                  }`}
                >
                  {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>地區</label>
            <div className="flex overflow-x-auto hide-scrollbar mb-3 gap-2">
              {CITIES.slice(0, 6).map((city) => (
                <button
                  key={city}
                  onClick={() => setForm({ ...form, city })}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-sm transition-all ${
                    form.city === city ? 'area-chip area-chip-active' : 'area-chip'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>需求描述 *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="例如：想要韓系自然風格的剪燙，頭髮比較塌想要蓬鬆感..."
              rows={3}
              className={`${inputCls} resize-none`}
              style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }}
            />

            <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>預算</label>
            <input
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="例如：2000 左右"
              className={inputCls}
              style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }}
            />

            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>日期</label>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className={inputCls}
                  style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>時間</label>
                <input
                  type="time"
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                  className={inputCls}
                  style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 rounded-full py-3.5 text-[15px] font-semibold"
                style={{ background: '#4a6741', color: '#fff' }}
              >
                送出需求
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-full py-3.5 text-[15px]"
                style={{ border: '1px solid #e8ede6', color: '#8a8a80' }}
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* My Requests */}
        <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a18', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>我的需求</h2>
        {myRequests.length === 0 ? (
          <div className="area-card p-8 text-center">
            <div className="text-[40px] mb-2">🤖</div>
            <p style={{ fontSize: 14, color: '#8a8a80' }}>還沒有發佈需求</p>
            <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 4 }}>發佈需求讓設計師來找你！</p>
          </div>
        ) : (
          [...myRequests].reverse().map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onAccept={handleAccept}
              onChat={handleChat}
            />
          ))
        )}
      </div>
    </div>
  );
}

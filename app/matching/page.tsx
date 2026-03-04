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

  const statusColors: Record<string, string> = {
    open: 'bg-blue-100 text-blue-800',
    matched: 'bg-green-100 text-green-800',
    expired: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-4 mb-3">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="text-[15px] font-medium text-foreground">
            {SERVICE_CATEGORY_ICONS[request.category]} {SERVICE_CATEGORY_LABELS[request.category]}
          </span>
          <p className="text-[13px] text-muted mt-0.5">
            {request.city} · {request.preferredDate} {request.preferredTime}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[request.status]}`}>
          {MATCHING_STATUS_LABELS[request.status]}
        </span>
      </div>
      <p className="text-sm text-foreground mb-1">{request.description}</p>
      <p className="text-[13px] text-muted">預算：{request.budget}</p>

      {request.responses.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-sm text-primary font-medium"
        >
          {expanded ? '收起' : `查看 ${request.responses.length} 位設計師回覆 ▼`}
        </button>
      )}

      {expanded && request.responses.map((resp) => (
        <div key={resp.id} className="mt-2 bg-background rounded-lg p-3 border border-border">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[15px] font-medium text-foreground">{resp.providerName}</span>
            <span className="text-[15px] font-semibold text-primary">${resp.price}</span>
          </div>
          <p className="text-[13px] text-muted mb-1">設計師：{resp.staffName}</p>
          <p className="text-sm text-foreground mb-2">{resp.message}</p>
          <p className="text-[13px] text-muted mb-2">
            可預約：{resp.availableDate} {resp.availableTime}
          </p>
          <div className="flex gap-2">
            {request.status === 'open' && (
              <button
                onClick={() => onAccept(request.id, resp.providerId, resp.providerName)}
                className="flex-1 bg-primary rounded-lg py-2 text-sm font-semibold text-surface"
              >
                選擇此設計師
              </button>
            )}
            <button
              onClick={() => onChat(resp.providerId, resp.providerName)}
              className="flex-1 rounded-lg border border-primary py-2 text-sm font-semibold text-primary"
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

  const inputCls = 'w-full bg-surface border border-border rounded-lg px-3.5 py-3 text-[15px] text-foreground placeholder:text-muted mb-3';

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-5 px-5">
        <h1 className="text-[28px] font-bold text-foreground mb-1">智能媒合</h1>
        <p className="text-sm text-muted mb-4">描述你的需求，讓設計師主動來找你</p>

        {/* Toggle: Self-book vs Matching */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => router.push('/')}
            className="flex-1 rounded-xl border border-border py-3 text-center"
          >
            <span className="text-lg block mb-1">🔍</span>
            <span className="text-sm text-foreground font-medium">自己選擇</span>
            <p className="text-[11px] text-muted mt-0.5">瀏覽店家自助預約</p>
          </button>
          <button className="flex-1 rounded-xl border-2 border-primary bg-primary/5 py-3 text-center">
            <span className="text-lg block mb-1">🤖</span>
            <span className="text-sm text-primary font-semibold">智能媒合</span>
            <p className="text-[11px] text-muted mt-0.5">描述需求自動配對</p>
          </button>
        </div>

        {/* New Request Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-primary rounded-xl py-4 text-base font-semibold text-surface mb-5"
          >
            + 發佈新需求
          </button>
        )}

        {/* Request Form */}
        {showForm && (
          <div className="bg-surface rounded-xl border-2 border-primary p-4 mb-5">
            <h3 className="text-lg font-semibold text-foreground mb-3">填寫您的需求</h3>

            <label className="block text-sm font-medium text-foreground mb-1.5">服務類型</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setForm({ ...form, category: cat })}
                  className={`px-3 py-1.5 rounded-full border text-sm ${
                    form.category === cat
                      ? 'bg-primary text-surface border-primary'
                      : 'bg-surface text-foreground border-border'
                  }`}
                >
                  {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-foreground mb-1.5">地區</label>
            <div className="flex overflow-x-auto hide-scrollbar mb-3 gap-2">
              {CITIES.slice(0, 6).map((city) => (
                <button
                  key={city}
                  onClick={() => setForm({ ...form, city })}
                  className={`shrink-0 px-3 py-1.5 rounded-full border text-sm ${
                    form.city === city
                      ? 'bg-primary text-surface border-primary'
                      : 'bg-surface text-foreground border-border'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>

            <label className="block text-sm font-medium text-foreground mb-1.5">需求描述 *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="例如：想要韓系自然風格的剪燙，頭髮比較塌想要蓬鬆感..."
              rows={3}
              className={`${inputCls} resize-none`}
            />

            <label className="block text-sm font-medium text-foreground mb-1.5">預算</label>
            <input
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              placeholder="例如：2000 左右"
              className={inputCls}
            />

            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1.5">日期</label>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-1.5">時間</label>
                <input
                  type="time"
                  value={form.preferredTime}
                  onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-primary rounded-lg py-3.5 text-[15px] font-semibold text-surface"
              >
                送出需求
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-border py-3.5 text-[15px] text-muted"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* My Requests */}
        <h2 className="text-base font-semibold text-foreground mb-3">我的需求</h2>
        {myRequests.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <div className="text-[40px] mb-2">🤖</div>
            <p className="text-sm text-muted">還沒有發佈需求</p>
            <p className="text-xs text-muted mt-1">發佈需求讓設計師來找你！</p>
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

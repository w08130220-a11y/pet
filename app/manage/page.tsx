'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, BOOKING_STATUS_LABELS, CITIES, type ServiceCategory } from '@/lib/types';

const CATEGORIES: ServiceCategory[] = ['nail', 'hair', 'massage', 'lash', 'spa', 'tattoo'];
type ManageTab = 'overview' | 'services' | 'staff' | 'schedule' | 'orders' | 'photos' | 'portfolio' | 'chat';

export default function ManagePage() {
  const { state, dispatch, providerCancelBooking, addPortfolioItem, deletePortfolioItem } = useAppStore();
  const [activeTab, setActiveTab] = useState<ManageTab>('overview');
  const [isRegistering, setIsRegistering] = useState(false);

  const [form, setForm] = useState({
    name: '', category: 'nail' as ServiceCategory, address: '',
    city: '台北市', district: '', phone: '', description: '',
  });

  const [showAddService, setShowAddService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '', description: '', duration: '60', price: '', category: 'nail' as ServiceCategory,
  });

  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');

  const [showAddStaff, setShowAddStaff] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: '', title: '', specialties: '' });

  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ title: '', description: '', staffId: '' });

  const isProvider = state.userRole === 'provider';
  const myProvider = isProvider ? state.providers[0] : null;
  const myOrders = myProvider ? state.bookings.filter((b) => b.providerId === myProvider.id) : [];
  const todayOrders = myOrders.filter((b) => {
    const today = new Date().toISOString().split('T')[0];
    return b.date === today && b.status !== 'cancelled' && b.status !== 'provider_cancelled';
  });

  const handleRegister = () => {
    if (!form.name.trim() || !form.address.trim() || !form.phone.trim()) {
      alert('請填寫完整的店家資訊');
      return;
    }
    dispatch({ type: 'SET_ROLE', payload: 'provider' });
    dispatch({
      type: 'ADD_PROVIDER',
      payload: {
        id: `p-${Date.now()}`, name: form.name, category: form.category,
        address: `${form.city}${form.district}${form.address}`, city: form.city,
        district: form.district, phone: form.phone, description: form.description,
        rating: 0, reviewCount: 0, imageUri: '', isVerified: false,
        services: [], staffMembers: [], photos: [],
        businessHours: {
          mon: { open: '10:00', close: '20:00' }, tue: { open: '10:00', close: '20:00' },
          wed: { open: '10:00', close: '20:00' }, thu: { open: '10:00', close: '20:00' },
          fri: { open: '10:00', close: '20:00' }, sat: { open: '10:00', close: '20:00' },
          sun: null,
        },
      },
    });
    setIsRegistering(false);
  };

  const handleAddService = () => {
    if (!myProvider || !serviceForm.name.trim() || !serviceForm.price.trim()) {
      alert('請填寫服務名稱和價格'); return;
    }
    dispatch({
      type: 'ADD_SERVICE',
      payload: {
        providerId: myProvider.id,
        service: {
          id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          providerId: myProvider.id, name: serviceForm.name,
          description: serviceForm.description, category: myProvider.category,
          duration: parseInt(serviceForm.duration) || 60,
          price: parseInt(serviceForm.price) || 0, isAvailable: true,
        },
      },
    });
    setServiceForm({ name: '', description: '', duration: '60', price: '', category: myProvider.category });
    setShowAddService(false);
  };

  const handleDeleteService = (serviceId: string) => {
    if (!myProvider) return;
    if (confirm('確定要刪除此服務項目嗎？')) {
      dispatch({ type: 'DELETE_SERVICE', payload: { providerId: myProvider.id, serviceId } });
    }
  };

  const handleUpdatePrice = (serviceId: string) => {
    if (!myProvider || !editPrice.trim()) return;
    dispatch({
      type: 'UPDATE_SERVICE',
      payload: { providerId: myProvider.id, serviceId, updates: { price: parseInt(editPrice) || 0 } },
    });
    setEditingServiceId(null);
    setEditPrice('');
  };

  const handleAddStaff = () => {
    if (!myProvider || !staffForm.name.trim() || !staffForm.title.trim()) {
      alert('請填寫人員姓名和職稱'); return;
    }
    dispatch({
      type: 'ADD_STAFF',
      payload: {
        providerId: myProvider.id,
        staff: {
          id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          providerId: myProvider.id, name: staffForm.name, title: staffForm.title,
          photoUri: '', specialties: staffForm.specialties.split('、').filter(Boolean),
          rating: 0, reviewCount: 0,
        },
      },
    });
    setStaffForm({ name: '', title: '', specialties: '' });
    setShowAddStaff(false);
  };

  const handleDeleteStaff = (staffId: string) => {
    if (!myProvider) return;
    if (confirm('確定要刪除此人員嗎？')) {
      dispatch({ type: 'DELETE_STAFF', payload: { providerId: myProvider.id, staffId } });
    }
  };

  const handleProviderCancel = (bookingId: string) => {
    if (confirm('確定要取消此預約嗎？未提前告知取消，顧客將可評價您的商家。')) {
      providerCancelBooking(bookingId);
      alert('已取消此預約，顧客將獲得一次評價機會。');
    }
  };

  const inputCls = 'w-full bg-surface border border-border rounded-lg px-3.5 py-3 text-[15px] text-foreground placeholder:text-muted mb-4';

  // ── Not registered ──
  if (!isProvider && !isRegistering) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-5 px-5">
          <h1 className="text-[28px] font-bold text-foreground mb-4 font-heading tracking-tight">業者中心</h1>
        </div>
        <div className="flex flex-col items-center justify-center px-10 pt-20">
          <div className="text-5xl mb-5">🏪</div>
          <h2 className="text-xl font-semibold text-foreground mb-2 text-center">成為美容業者</h2>
          <p className="text-sm text-muted text-center mb-6 leading-5">
            註冊成為業者，上傳你的服務項目與空閒時段，讓客戶直接預約你的服務。
          </p>
          <button
            onClick={() => setIsRegistering(true)}
            className="bg-secondary rounded-full py-3.5 px-10 text-base font-semibold text-white"
          >
            立即註冊
          </button>
        </div>
      </div>
    );
  }

  // ── Registration Form ──
  if (isRegistering) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-5 px-5">
          <div className="flex items-center mb-4">
            <button onClick={() => setIsRegistering(false)} className="mr-3 text-base text-muted">← 返回</button>
            <h1 className="text-[22px] font-bold text-foreground font-heading">店家註冊</h1>
          </div>
        </div>
        <div className="px-5 pb-10">
          <label className="block text-sm font-medium text-foreground mb-1.5">店家名稱 *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：Nail Room 指尖藝術" className={inputCls} />

          <label className="block text-sm font-medium text-foreground mb-1.5">服務類型 *</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                className={`px-3.5 py-2 rounded-full border text-sm ${form.category === cat ? 'bg-secondary text-white border-secondary' : 'bg-surface text-foreground border-border'}`}>
                {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-foreground mb-1.5">城市 *</label>
          <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2">
            {CITIES.map((city) => (
              <button key={city} onClick={() => setForm({ ...form, city })}
                className={`shrink-0 px-3.5 py-2 rounded-full border text-sm ${form.city === city ? 'bg-secondary text-white border-secondary' : 'bg-surface text-foreground border-border'}`}>
                {city}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium text-foreground mb-1.5">區域</label>
          <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="例：大安區" className={inputCls} />

          <label className="block text-sm font-medium text-foreground mb-1.5">詳細地址 *</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="例：忠孝東路四段155號3樓" className={inputCls} />

          <label className="block text-sm font-medium text-foreground mb-1.5">聯絡電話 *</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="02-1234-5678" type="tel" className={inputCls} />

          <label className="block text-sm font-medium text-foreground mb-1.5">店家介紹</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="簡單介紹你的服務特色..." rows={3} className={`${inputCls} resize-none`} />

          <button onClick={handleRegister} className="w-full bg-secondary rounded-full py-4 text-base font-semibold text-white">
            完成註冊
          </button>
        </div>
      </div>
    );
  }

  // ── Provider Dashboard ──
  const myPortfolio = myProvider ? state.portfolioItems.filter((p) => p.providerId === myProvider.id) : [];
  const myReports = myProvider ? state.portfolioReports.filter((r) => {
    const item = state.portfolioItems.find((p) => p.id === r.portfolioItemId);
    return item?.providerId === myProvider.id;
  }) : [];
  const myChatRooms = myProvider
    ? state.chatRooms.filter((r) => r.providerId === myProvider.id)
    : [];

  const handleAddPortfolio = () => {
    if (!myProvider || !portfolioForm.title.trim()) {
      alert('請填寫作品標題'); return;
    }
    const staff = myProvider.staffMembers.find((s) => s.id === portfolioForm.staffId) || myProvider.staffMembers[0];
    addPortfolioItem({
      providerId: myProvider.id,
      staffId: staff?.id || '',
      staffName: staff?.name || '',
      title: portfolioForm.title,
      description: portfolioForm.description,
      imageUrl: '',
      category: myProvider.category,
    });
    setPortfolioForm({ title: '', description: '', staffId: '' });
    setShowAddPortfolio(false);
  };

  const tabs: { key: ManageTab; label: string }[] = [
    { key: 'overview', label: '總覽' }, { key: 'orders', label: '訂單' },
    { key: 'services', label: '服務' }, { key: 'staff', label: '人員' },
    { key: 'portfolio', label: '作品集' }, { key: 'photos', label: '相簿' },
    { key: 'chat', label: '訊息' }, { key: 'schedule', label: '時段' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-5 px-5">
        <h1 className="text-[28px] font-bold text-foreground mb-1 font-heading tracking-tight">業者中心</h1>
        {myProvider && <p className="text-sm text-muted mb-4">{myProvider.name}</p>}
        <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium ${activeTab === tab.key ? 'bg-secondary text-white border-secondary' : 'bg-surface text-foreground border-border'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-8">
        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="flex gap-3 mb-5">
              {[
                { label: '今日預約', value: String(todayOrders.length), color: 'var(--color-primary)' },
                { label: '總評分', value: myProvider?.rating ? String(myProvider.rating) : '—', color: '#F5A623' },
                { label: '總評價數', value: String(myProvider?.reviewCount || 0), color: 'var(--color-secondary)' },
              ].map((stat) => (
                <div key={stat.label} className="flex-1 bg-surface rounded-xl border border-border p-4 text-center">
                  <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </div>
              ))}
            </div>

            <h2 className="text-base font-semibold text-foreground mb-3">今日預約</h2>
            {todayOrders.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-6 text-center">
                <p className="text-sm text-muted">今日暫無預約</p>
              </div>
            ) : (
              todayOrders.map((order) => (
                <div key={order.id} className="bg-surface rounded-xl border border-border p-3.5 mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[15px] font-medium text-foreground">{order.time} — {order.serviceName}</p>
                      <p className="text-[13px] text-muted mt-0.5">{order.staffName} · {order.duration}分鐘</p>
                    </div>
                    <span className="text-[15px] font-semibold text-foreground">${order.totalPrice}</span>
                  </div>
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <button onClick={() => handleProviderCancel(order.id)}
                      className="mt-2 w-full py-2 rounded-lg border border-error text-[13px] text-error">
                      商家取消預約
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <>
            {myOrders.length === 0 ? (
              <div className="text-center pt-16"><p className="text-sm text-muted">尚無訂單</p></div>
            ) : (
              [...myOrders].reverse().map((order) => (
                <div key={order.id} className="bg-surface rounded-xl border border-border p-3.5 mb-2">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[15px] font-medium text-foreground">{order.serviceName}</span>
                    <span className={`text-xs ${order.status === 'provider_cancelled' ? 'text-error' : 'text-muted'}`}>
                      {BOOKING_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p className="text-[13px] text-muted">
                    {order.date} {order.time} · {order.staffName} · ${order.totalPrice}
                  </p>
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <button onClick={() => handleProviderCancel(order.id)}
                      className="mt-2 w-full py-2 rounded-lg border border-error text-[13px] text-error">
                      商家取消預約
                    </button>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {/* Services */}
        {activeTab === 'services' && myProvider && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] text-muted">{myProvider.services.length} 項服務</span>
              <button onClick={() => setShowAddService(!showAddService)}
                className="bg-secondary rounded-full px-3.5 py-2 text-[13px] font-semibold text-white">
                + 新增服務
              </button>
            </div>

            {showAddService && (
              <div className="bg-surface rounded-xl border-2 border-secondary p-4 mb-3">
                <h3 className="text-[15px] font-semibold text-foreground mb-3">新增服務項目</h3>
                <input value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="服務名稱 *" className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted mb-2.5" />
                <input value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="服務描述" className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted mb-2.5" />
                <div className="flex gap-2.5 mb-2.5">
                  <input value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} placeholder="時長(分鐘)" type="number" className="flex-1 bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted" />
                  <input value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} placeholder="價格(NTD) *" type="number" className="flex-1 bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddService} className="flex-1 bg-secondary rounded-full py-3 text-sm font-semibold text-white">確認新增</button>
                  <button onClick={() => setShowAddService(false)} className="flex-1 rounded-lg border border-border py-3 text-sm text-muted">取消</button>
                </div>
              </div>
            )}

            {myProvider.services.map((service) => (
              <div key={service.id} className="bg-surface rounded-xl border border-border p-3.5 mb-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-[15px] font-medium text-foreground">{service.name}</p>
                    <p className="text-[13px] text-muted mt-0.5">{service.description} · {service.duration}分鐘</p>
                  </div>
                  {editingServiceId === service.id ? (
                    <div className="flex items-center gap-1.5">
                      <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} type="number"
                        placeholder={String(service.price)}
                        className="w-20 border border-secondary rounded-md px-2 py-1 text-sm text-foreground text-right" />
                      <button onClick={() => handleUpdatePrice(service.id)} className="text-sm text-secondary font-semibold">✓</button>
                      <button onClick={() => { setEditingServiceId(null); setEditPrice(''); }} className="text-sm text-muted">✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingServiceId(service.id); setEditPrice(String(service.price)); }}
                      className="text-right">
                      <p className="text-base font-semibold text-foreground">${service.price}</p>
                      <p className="text-[10px] text-secondary">點擊修改</p>
                    </button>
                  )}
                </div>
                <div className="mt-2 text-right">
                  <button onClick={() => handleDeleteService(service.id)} className="text-xs text-error">刪除服務</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Staff */}
        {activeTab === 'staff' && myProvider && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] text-muted">{myProvider.staffMembers.length} 位人員</span>
              <button onClick={() => setShowAddStaff(!showAddStaff)}
                className="bg-secondary rounded-full px-3.5 py-2 text-[13px] font-semibold text-white">
                + 新增人員
              </button>
            </div>

            {showAddStaff && (
              <div className="bg-surface rounded-xl border-2 border-secondary p-4 mb-3">
                <h3 className="text-[15px] font-semibold text-foreground mb-3">新增服務人員</h3>
                <input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} placeholder="姓名 *" className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted mb-2.5" />
                <input value={staffForm.title} onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })} placeholder="職稱 * (例：設計師、美甲師)" className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted mb-2.5" />
                <input value={staffForm.specialties} onChange={(e) => setStaffForm({ ...staffForm, specialties: e.target.value })} placeholder="專長 (用「、」分隔)" className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted mb-2.5" />
                <div className="flex gap-2">
                  <button onClick={handleAddStaff} className="flex-1 bg-secondary rounded-full py-3 text-sm font-semibold text-white">確認新增</button>
                  <button onClick={() => setShowAddStaff(false)} className="flex-1 rounded-lg border border-border py-3 text-sm text-muted">取消</button>
                </div>
              </div>
            )}

            {myProvider.staffMembers.map((staff) => (
              <div key={staff.id} className="bg-surface rounded-xl border border-border p-3.5 mb-2 flex items-center">
                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center mr-3">
                  <span className="text-base">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-medium text-foreground">{staff.name}</p>
                  <p className="text-xs text-muted">{staff.title}</p>
                  {staff.specialties.length > 0 && (
                    <p className="text-xs text-muted mt-0.5">{staff.specialties.join('、')}</p>
                  )}
                </div>
                <button onClick={() => handleDeleteStaff(staff.id)} className="p-2 text-[13px] text-error">
                  刪除
                </button>
              </div>
            ))}
          </>
        )}

        {/* Photos */}
        {activeTab === 'photos' && myProvider && (
          <>
            <p className="text-[13px] text-muted mb-3">
              店鋪相簿（最多 6 張）· 目前 {myProvider.photos?.length || 0} 張
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {(myProvider.photos || []).slice(0, 6).map((_, index) => (
                <div key={index} className="aspect-square rounded-xl bg-border flex items-center justify-center">
                  <span className="text-xs text-muted">照片 {index + 1}</span>
                </div>
              ))}
              {(myProvider.photos?.length || 0) < 6 && (
                <div className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer">
                  <span className="text-[28px] text-muted">+</span>
                  <span className="text-xs text-muted mt-1">上傳照片</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Portfolio */}
        {activeTab === 'portfolio' && myProvider && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] text-muted">{myPortfolio.length} 件作品</span>
              <button onClick={() => setShowAddPortfolio(!showAddPortfolio)}
                className="bg-secondary rounded-full px-3.5 py-2 text-[13px] font-semibold text-white">
                + 上傳作品
              </button>
            </div>

            {myReports.length > 0 && (
              <div className="bg-orange-50 border border-orange-300 rounded-xl p-3 mb-3">
                <p className="text-[13px] text-orange-900 font-medium">⚠ 有 {myReports.length} 件作品被檢舉</p>
                <p className="text-xs text-orange-800 mt-0.5">
                  請確認作品為原創，竊取他人作品將導致帳號被列入黑名單。
                </p>
              </div>
            )}

            {showAddPortfolio && (
              <div className="bg-surface rounded-xl border-2 border-secondary p-4 mb-3">
                <h3 className="text-[15px] font-semibold text-foreground mb-3">上傳作品</h3>
                <input
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="作品標題 *"
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted mb-2.5"
                />
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  placeholder="作品描述"
                  rows={2}
                  className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted mb-2.5 resize-none"
                />
                {myProvider.staffMembers.length > 0 && (
                  <select
                    value={portfolioForm.staffId}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, staffId: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm text-foreground mb-2.5"
                  >
                    <option value="">選擇設計師</option>
                    {myProvider.staffMembers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} - {s.title}</option>
                    ))}
                  </select>
                )}
                <div className="w-full h-[120px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center mb-2.5 cursor-pointer bg-background">
                  <span className="text-[28px] text-muted">📷</span>
                  <span className="text-xs text-muted mt-1">點擊上傳作品照片</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPortfolio} className="flex-1 bg-secondary rounded-full py-3 text-sm font-semibold text-white">確認上傳</button>
                  <button onClick={() => setShowAddPortfolio(false)} className="flex-1 rounded-lg border border-border py-3 text-sm text-muted">取消</button>
                </div>
              </div>
            )}

            {myPortfolio.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-8 text-center">
                <div className="text-[40px] mb-2">🎨</div>
                <p className="text-sm text-muted">還沒有上傳作品</p>
                <p className="text-xs text-muted mt-1">上傳作品展示您的專業技術</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {myPortfolio.map((item) => (
                  <div key={item.id} className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="w-full h-[100px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div className="p-2.5">
                      <p className="text-[13px] font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-[11px] text-muted truncate">{item.staffName}</p>
                      <button
                        onClick={() => {
                          if (confirm('確定要刪除此作品嗎？')) deletePortfolioItem(item.id);
                        }}
                        className="text-[11px] text-error mt-1"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Chat (Provider view) */}
        {activeTab === 'chat' && myProvider && (
          <>
            <p className="text-[13px] text-muted mb-3">{myChatRooms.length} 則對話</p>
            {myChatRooms.length === 0 ? (
              <div className="bg-surface rounded-xl border border-border p-8 text-center">
                <div className="text-[40px] mb-2">💬</div>
                <p className="text-sm text-muted">還沒有客戶訊息</p>
              </div>
            ) : (
              myChatRooms.map((room) => {
                const unread = room.unreadCount > 0;
                return (
                  <div key={room.id} className="bg-surface rounded-xl border border-border p-3.5 mb-2 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-accent/40 flex items-center justify-center mr-3">
                      <span className="text-base">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-foreground">顧客</p>
                      <p className="text-[13px] text-muted truncate">{room.lastMessage || '新對話'}</p>
                    </div>
                    {unread && (
                      <span className="bg-primary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {room.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </>
        )}

        {/* Schedule */}
        {activeTab === 'schedule' && myProvider && (
          <>
            <p className="text-[13px] text-muted mb-3">營業時間設定</p>
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
              const dayLabels: Record<string, string> = {
                mon: '週一', tue: '週二', wed: '週三', thu: '週四',
                fri: '週五', sat: '週六', sun: '週日',
              };
              const hours = myProvider.businessHours[day];
              return (
                <div key={day} className="bg-surface rounded-xl border border-border p-3.5 mb-2 flex justify-between items-center">
                  <span className="text-[15px] font-medium text-foreground">{dayLabels[day]}</span>
                  <span className={`text-sm ${hours ? 'text-foreground' : 'text-error'}`}>
                    {hours ? `${hours.open} — ${hours.close}` : '公休'}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

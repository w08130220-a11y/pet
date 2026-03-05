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

  const inputCls = 'w-full rounded-lg px-3.5 py-3 text-[15px] mb-4';

  // ── Not registered ──
  if (!isProvider && !isRegistering) {
    return (
      <div className="min-h-screen" style={{ background: '#f0f4ed' }}>
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
            業者中心
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'rgba(240,244,237,0.6)',
            position: 'relative',
            zIndex: 1,
          }}>
            管理你的店家與服務
          </p>
        </div>
        <div className="flex flex-col items-center justify-center px-10 pt-20">
          <div className="text-5xl mb-5">🏪</div>
          <h2 className="text-xl font-semibold mb-2 text-center" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>成為美容業者</h2>
          <p className="text-sm text-center mb-6 leading-5" style={{ color: '#8a8a80' }}>
            註冊成為業者，上傳你的服務項目與空閒時段，讓客戶直接預約你的服務。
          </p>
          <button
            onClick={() => setIsRegistering(true)}
            className="rounded-full py-3.5 px-10 text-base font-semibold"
            style={{ background: '#4a6741', color: '#fff' }}
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
      <div className="min-h-screen" style={{ background: '#f0f4ed' }}>
        {/* Area Hero Header */}
        <div className="area-hero px-6 pt-12 pb-6">
          <div className="flex items-center" style={{ position: 'relative', zIndex: 1 }}>
            <button onClick={() => setIsRegistering(false)} className="mr-3 text-base" style={{ color: 'rgba(240,244,237,0.6)' }}>← 返回</button>
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 700,
            color: '#f0f4ed',
            letterSpacing: '-0.03em',
            position: 'relative',
            zIndex: 1,
            marginBottom: 4,
            marginTop: 8,
          }}>
            店家註冊
          </h1>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: 'rgba(240,244,237,0.6)',
            position: 'relative',
            zIndex: 1,
          }}>
            填寫你的店家資訊
          </p>
        </div>
        <div className="px-5 pt-4 pb-10">
          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>店家名稱 *</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="例：Nail Room 指尖藝術" className={inputCls} style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }} />

          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>服務類型 *</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setForm({ ...form, category: cat })}
                className={`px-3.5 py-2 rounded-full text-sm ${form.category === cat ? 'area-chip area-chip-active' : 'area-chip'}`}>
                {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>城市 *</label>
          <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2">
            {CITIES.map((city) => (
              <button key={city} onClick={() => setForm({ ...form, city })}
                className={`shrink-0 px-3.5 py-2 rounded-full text-sm ${form.city === city ? 'area-chip area-chip-active' : 'area-chip'}`}>
                {city}
              </button>
            ))}
          </div>

          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>區域</label>
          <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="例：大安區" className={inputCls} style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }} />

          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>詳細地址 *</label>
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="例：忠孝東路四段155號3樓" className={inputCls} style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }} />

          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>聯絡電話 *</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="02-1234-5678" type="tel" className={inputCls} style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }} />

          <label className="block text-sm font-medium mb-1.5" style={{ color: '#1a1a18' }}>店家介紹</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="簡單介紹你的服務特色..." rows={3} className={`${inputCls} resize-none`} style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }} />

          <button onClick={handleRegister} className="w-full rounded-full py-4 text-base font-semibold" style={{ background: '#4a6741', color: '#fff' }}>
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
    <div className="min-h-screen" style={{ background: '#f0f4ed' }}>
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
          業者中心
        </h1>
        {myProvider && <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'rgba(240,244,237,0.6)',
          position: 'relative',
          zIndex: 1,
        }}>
          {myProvider.name}
        </p>}
      </div>

      <div className="px-5 pt-4">
        <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === tab.key ? 'area-chip area-chip-active' : 'area-chip'}`}>
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
                { label: '今日預約', value: String(todayOrders.length), color: '#4a6741' },
                { label: '總評分', value: myProvider?.rating ? String(myProvider.rating) : '—', color: '#F5A623' },
                { label: '總評價數', value: String(myProvider?.reviewCount || 0), color: '#4a6741' },
              ].map((stat) => (
                <div key={stat.label} className="area-card flex-1 p-4 text-center">
                  <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</p>
                  <p style={{ fontSize: 12, color: '#8a8a80' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <h2 className="text-base font-semibold mb-3" style={{ color: '#1a1a18', fontFamily: "'Playfair Display', serif" }}>今日預約</h2>
            {todayOrders.length === 0 ? (
              <div className="area-card p-6 text-center">
                <p style={{ fontSize: 14, color: '#8a8a80' }}>今日暫無預約</p>
              </div>
            ) : (
              todayOrders.map((order) => (
                <div key={order.id} className="area-card p-3.5 mb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>{order.time} — {order.serviceName}</p>
                      <p style={{ fontSize: 13, color: '#8a8a80', marginTop: 2 }}>{order.staffName} · {order.duration}分鐘</p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18' }}>${order.totalPrice}</span>
                  </div>
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <button onClick={() => handleProviderCancel(order.id)}
                      className="mt-2 w-full py-2 rounded-lg text-[13px]"
                      style={{ border: '1px solid #a85a4a', color: '#a85a4a' }}>
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
              <div className="text-center pt-16"><p style={{ fontSize: 14, color: '#8a8a80' }}>尚無訂單</p></div>
            ) : (
              [...myOrders].reverse().map((order) => (
                <div key={order.id} className="area-card p-3.5 mb-2">
                  <div className="flex justify-between mb-1.5">
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>{order.serviceName}</span>
                    <span style={{ fontSize: 12, color: order.status === 'provider_cancelled' ? '#a85a4a' : '#8a8a80' }}>
                      {BOOKING_STATUS_LABELS[order.status]}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: '#8a8a80' }}>
                    {order.date} {order.time} · {order.staffName} · ${order.totalPrice}
                  </p>
                  {(order.status === 'confirmed' || order.status === 'pending') && (
                    <button onClick={() => handleProviderCancel(order.id)}
                      className="mt-2 w-full py-2 rounded-lg text-[13px]"
                      style={{ border: '1px solid #a85a4a', color: '#a85a4a' }}>
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
              <span style={{ fontSize: 13, color: '#8a8a80' }}>{myProvider.services.length} 項服務</span>
              <button onClick={() => setShowAddService(!showAddService)}
                className="rounded-full px-3.5 py-2 text-[13px] font-semibold"
                style={{ background: '#4a6741', color: '#fff' }}>
                + 新增服務
              </button>
            </div>

            {showAddService && (
              <div className="area-card p-4 mb-3" style={{ borderWidth: 2, borderColor: '#4a6741' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>新增服務項目</h3>
                <input value={serviceForm.name} onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} placeholder="服務名稱 *" className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5" style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }} />
                <input value={serviceForm.description} onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="服務描述" className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5" style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }} />
                <div className="flex gap-2.5 mb-2.5">
                  <input value={serviceForm.duration} onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })} placeholder="時長(分鐘)" type="number" className="flex-1 rounded-lg px-3.5 py-2.5 text-sm" style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }} />
                  <input value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} placeholder="價格(NTD) *" type="number" className="flex-1 rounded-lg px-3.5 py-2.5 text-sm" style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }} />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddService} className="flex-1 rounded-full py-3 text-sm font-semibold" style={{ background: '#4a6741', color: '#fff' }}>確認新增</button>
                  <button onClick={() => setShowAddService(false)} className="flex-1 rounded-lg py-3 text-sm" style={{ border: '1px solid #e8ede6', color: '#8a8a80' }}>取消</button>
                </div>
              </div>
            )}

            {myProvider.services.map((service) => (
              <div key={service.id} className="area-card p-3.5 mb-2">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>{service.name}</p>
                    <p style={{ fontSize: 13, color: '#8a8a80', marginTop: 2 }}>{service.description} · {service.duration}分鐘</p>
                  </div>
                  {editingServiceId === service.id ? (
                    <div className="flex items-center gap-1.5">
                      <input value={editPrice} onChange={(e) => setEditPrice(e.target.value)} type="number"
                        placeholder={String(service.price)}
                        className="w-20 rounded-md px-2 py-1 text-sm text-right" style={{ border: '1px solid #4a6741', color: '#1a1a18' }} />
                      <button onClick={() => handleUpdatePrice(service.id)} className="text-sm font-semibold" style={{ color: '#4a6741' }}>✓</button>
                      <button onClick={() => { setEditingServiceId(null); setEditPrice(''); }} className="text-sm" style={{ color: '#8a8a80' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingServiceId(service.id); setEditPrice(String(service.price)); }}
                      className="text-right">
                      <p className="text-base font-semibold" style={{ color: '#1a1a18' }}>${service.price}</p>
                      <p style={{ fontSize: 10, color: '#4a6741' }}>點擊修改</p>
                    </button>
                  )}
                </div>
                <div className="mt-2 text-right">
                  <button onClick={() => handleDeleteService(service.id)} style={{ fontSize: 12, color: '#a85a4a' }}>刪除服務</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Staff */}
        {activeTab === 'staff' && myProvider && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: 13, color: '#8a8a80' }}>{myProvider.staffMembers.length} 位人員</span>
              <button onClick={() => setShowAddStaff(!showAddStaff)}
                className="rounded-full px-3.5 py-2 text-[13px] font-semibold"
                style={{ background: '#4a6741', color: '#fff' }}>
                + 新增人員
              </button>
            </div>

            {showAddStaff && (
              <div className="area-card p-4 mb-3" style={{ borderWidth: 2, borderColor: '#4a6741' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>新增服務人員</h3>
                <input value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} placeholder="姓名 *" className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5" style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }} />
                <input value={staffForm.title} onChange={(e) => setStaffForm({ ...staffForm, title: e.target.value })} placeholder="職稱 * (例：設計師、美甲師)" className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5" style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }} />
                <input value={staffForm.specialties} onChange={(e) => setStaffForm({ ...staffForm, specialties: e.target.value })} placeholder="專長 (用「、」分隔)" className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5" style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }} />
                <div className="flex gap-2">
                  <button onClick={handleAddStaff} className="flex-1 rounded-full py-3 text-sm font-semibold" style={{ background: '#4a6741', color: '#fff' }}>確認新增</button>
                  <button onClick={() => setShowAddStaff(false)} className="flex-1 rounded-lg py-3 text-sm" style={{ border: '1px solid #e8ede6', color: '#8a8a80' }}>取消</button>
                </div>
              </div>
            )}

            {myProvider.staffMembers.map((staff) => (
              <div key={staff.id} className="area-card p-3.5 mb-2 flex items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ background: '#f0f4ed' }}>
                  <span className="text-base">👤</span>
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>{staff.name}</p>
                  <p style={{ fontSize: 12, color: '#8a8a80' }}>{staff.title}</p>
                  {staff.specialties.length > 0 && (
                    <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 2 }}>{staff.specialties.join('、')}</p>
                  )}
                </div>
                <button onClick={() => handleDeleteStaff(staff.id)} className="p-2" style={{ fontSize: 13, color: '#a85a4a' }}>
                  刪除
                </button>
              </div>
            ))}
          </>
        )}

        {/* Photos */}
        {activeTab === 'photos' && myProvider && (
          <>
            <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 12 }}>
              店鋪相簿（最多 6 張）· 目前 {myProvider.photos?.length || 0} 張
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {(myProvider.photos || []).slice(0, 6).map((_, index) => (
                <div key={index} className="aspect-square rounded-xl flex items-center justify-center" style={{ background: '#e8ede6' }}>
                  <span style={{ fontSize: 12, color: '#8a8a80' }}>照片 {index + 1}</span>
                </div>
              ))}
              {(myProvider.photos?.length || 0) < 6 && (
                <div className="aspect-square rounded-xl flex flex-col items-center justify-center cursor-pointer" style={{ border: '2px dashed #e8ede6' }}>
                  <span style={{ fontSize: 28, color: '#8a8a80' }}>+</span>
                  <span style={{ fontSize: 12, color: '#8a8a80', marginTop: 4 }}>上傳照片</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Portfolio */}
        {activeTab === 'portfolio' && myProvider && (
          <>
            <div className="flex justify-between items-center mb-3">
              <span style={{ fontSize: 13, color: '#8a8a80' }}>{myPortfolio.length} 件作品</span>
              <button onClick={() => setShowAddPortfolio(!showAddPortfolio)}
                className="rounded-full px-3.5 py-2 text-[13px] font-semibold"
                style={{ background: '#4a6741', color: '#fff' }}>
                + 上傳作品
              </button>
            </div>

            {myReports.length > 0 && (
              <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(196,149,106,0.1)', border: '1px solid rgba(196,149,106,0.3)' }}>
                <p style={{ fontSize: 13, color: '#1a1a18', fontWeight: 500 }}>⚠ 有 {myReports.length} 件作品被檢舉</p>
                <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 2 }}>
                  請確認作品為原創，竊取他人作品將導致帳號被列入黑名單。
                </p>
              </div>
            )}

            {showAddPortfolio && (
              <div className="area-card p-4 mb-3" style={{ borderWidth: 2, borderColor: '#4a6741' }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1a1a18', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>上傳作品</h3>
                <input
                  value={portfolioForm.title}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                  placeholder="作品標題 *"
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5"
                  style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }}
                />
                <textarea
                  value={portfolioForm.description}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, description: e.target.value })}
                  placeholder="作品描述"
                  rows={2}
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5 resize-none"
                  style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }}
                />
                {myProvider.staffMembers.length > 0 && (
                  <select
                    value={portfolioForm.staffId}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, staffId: e.target.value })}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm mb-2.5"
                    style={{ background: '#f0f4ed', border: '1px solid #e8ede6', color: '#1a1a18' }}
                  >
                    <option value="">選擇設計師</option>
                    {myProvider.staffMembers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} - {s.title}</option>
                    ))}
                  </select>
                )}
                <div className="w-full h-[120px] rounded-lg flex flex-col items-center justify-center mb-2.5 cursor-pointer" style={{ border: '2px dashed #e8ede6', background: '#f0f4ed' }}>
                  <span style={{ fontSize: 28, color: '#8a8a80' }}>📷</span>
                  <span style={{ fontSize: 12, color: '#8a8a80', marginTop: 4 }}>點擊上傳作品照片</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddPortfolio} className="flex-1 rounded-full py-3 text-sm font-semibold" style={{ background: '#4a6741', color: '#fff' }}>確認上傳</button>
                  <button onClick={() => setShowAddPortfolio(false)} className="flex-1 rounded-lg py-3 text-sm" style={{ border: '1px solid #e8ede6', color: '#8a8a80' }}>取消</button>
                </div>
              </div>
            )}

            {myPortfolio.length === 0 ? (
              <div className="area-card p-8 text-center">
                <div className="text-[40px] mb-2">🎨</div>
                <p style={{ fontSize: 14, color: '#8a8a80' }}>還沒有上傳作品</p>
                <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 4 }}>上傳作品展示您的專業技術</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                {myPortfolio.map((item) => (
                  <div key={item.id} className="area-card overflow-hidden" style={{ padding: 0 }}>
                    <div className="w-full h-[100px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(200,216,194,0.3), rgba(74,103,65,0.15))' }}>
                      <span className="text-2xl">🎨</span>
                    </div>
                    <div className="p-2.5">
                      <p className="truncate" style={{ fontSize: 13, fontWeight: 500, color: '#1a1a18' }}>{item.title}</p>
                      <p className="truncate" style={{ fontSize: 11, color: '#8a8a80' }}>{item.staffName}</p>
                      <button
                        onClick={() => {
                          if (confirm('確定要刪除此作品嗎？')) deletePortfolioItem(item.id);
                        }}
                        style={{ fontSize: 11, color: '#a85a4a', marginTop: 4 }}
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
            <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 12 }}>{myChatRooms.length} 則對話</p>
            {myChatRooms.length === 0 ? (
              <div className="area-card p-8 text-center">
                <div className="text-[40px] mb-2">💬</div>
                <p style={{ fontSize: 14, color: '#8a8a80' }}>還沒有客戶訊息</p>
              </div>
            ) : (
              myChatRooms.map((room) => {
                const unread = room.unreadCount > 0;
                return (
                  <div key={room.id} className="area-card p-3.5 mb-2 flex items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ background: 'rgba(200,216,194,0.4)' }}>
                      <span className="text-base">👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>顧客</p>
                      <p className="truncate" style={{ fontSize: 13, color: '#8a8a80' }}>{room.lastMessage || '新對話'}</p>
                    </div>
                    {unread && (
                      <span className="rounded-full w-5 h-5 flex items-center justify-center" style={{ background: '#4a6741', color: '#fff', fontSize: 11, fontWeight: 700 }}>
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
            <p style={{ fontSize: 13, color: '#8a8a80', marginBottom: 12 }}>營業時間設定</p>
            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => {
              const dayLabels: Record<string, string> = {
                mon: '週一', tue: '週二', wed: '週三', thu: '週四',
                fri: '週五', sat: '週六', sun: '週日',
              };
              const hours = myProvider.businessHours[day];
              return (
                <div key={day} className="area-card p-3.5 mb-2 flex justify-between items-center">
                  <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }}>{dayLabels[day]}</span>
                  <span style={{ fontSize: 14, color: hours ? '#1a1a18' : '#a85a4a' }}>
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

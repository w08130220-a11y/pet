'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { SERVICE_CATEGORY_LABELS, SERVICE_CATEGORY_ICONS, CITIES, type ServiceCategory, type Provider } from '@/lib/types';

const CATEGORIES: ServiceCategory[] = ['nail', 'hair', 'massage', 'lash', 'spa', 'tattoo'];

function ProviderCard({ provider, onPress, isFavorite, onToggleFavorite }: {
  provider: Provider;
  onPress: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  const categoryLabel = SERVICE_CATEGORY_LABELS[provider.category];
  const priceRange = provider.services.length > 0
    ? `$${Math.min(...provider.services.map((s) => s.price))} - $${Math.max(...provider.services.map((s) => s.price))}`
    : '';
  const filledThumbs = Math.round(provider.rating);

  return (
    <div
      onClick={onPress}
      className="area-card p-5 mb-4 cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: '#1a1a18', letterSpacing: '-0.02em' }}>
              {provider.name}
            </span>
            {provider.isVerified && (
              <span className="area-badge">認證</span>
            )}
          </div>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#8a8a80', marginBottom: 8 }}>
            {categoryLabel} · {provider.district}
          </p>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#6a6a62', lineHeight: 1.6 }} className="line-clamp-2">
            {provider.description}
          </p>
        </div>

        <div className="flex flex-col items-end">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="text-lg mb-2 hover:scale-110 transition-transform"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          <div className="flex items-center mb-1">
            <span className="text-xs">{'👍'.repeat(filledThumbs)}</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 700, color: '#1a1a18' }}>
            {provider.rating}
            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#8a8a80', fontWeight: 400 }}> ({provider.reviewCount})</span>
          </span>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#4a6741', fontWeight: 600, marginTop: 2 }}>{priceRange}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {provider.services.slice(0, 3).map((service) => (
          <span key={service.id} className="area-chip">
            {service.name}
          </span>
        ))}
        {provider.services.length > 3 && (
          <span className="area-chip">
            +{provider.services.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { state, dispatch, getFilteredProviders, toggleFavorite, isFavorite } = useAppStore();
  const [showCityFilter, setShowCityFilter] = useState(false);

  const filteredProviders = getFilteredProviders();

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#f0f4ed' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#4a6741', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f0f4ed' }}>
      {/* Area-style Hero Header */}
      <div className="area-hero px-6 pt-12 pb-8">
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 36,
          fontWeight: 700,
          color: '#f0f4ed',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 8,
          position: 'relative',
          zIndex: 1,
        }}>
          BeautyBook
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'rgba(240,244,237,0.6)',
          lineHeight: 1.7,
          position: 'relative',
          zIndex: 1,
          marginBottom: 20,
        }}>
          找到你附近最好的美容服務
        </p>

        {/* Booking Mode Toggle */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, position: 'relative', zIndex: 1 }}>
          <button style={{
            flex: 1,
            background: 'rgba(255,255,255,0.12)',
            border: '1.5px solid rgba(255,255,255,0.25)',
            borderRadius: 24,
            padding: '10px 0',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: '#fff',
            fontWeight: 600,
          }}>
            🔍 自己選擇
          </button>
          <button
            onClick={() => router.push('/matching')}
            style={{
              flex: 1,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 24,
              padding: '10px 0',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
            }}
          >
            🤖 智能媒合
          </button>
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 24,
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '0 16px',
          height: 44,
          position: 'relative',
          zIndex: 1,
        }}>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginRight: 8 }}>🔍</span>
          <input
            type="text"
            placeholder="搜尋店家、服務、設計師..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: 14,
              fontFamily: "'DM Sans', sans-serif",
              outline: 'none',
            }}
          />
          {state.searchQuery.length > 0 && (
            <button onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="px-5 pt-5">
        {/* City Filter */}
        <button
          onClick={() => setShowCityFilter(!showCityFilter)}
          style={{ display: 'flex', alignItems: 'center', marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontSize: 13, color: '#8a8a80', marginRight: 4 }}>📍</span>
          <span style={{ fontSize: 13, fontWeight: 500, color: state.selectedCity ? '#4a6741' : '#8a8a80', fontFamily: "'DM Sans', sans-serif" }}>
            {state.selectedCity || '全部地區'}
          </span>
          <span style={{ fontSize: 10, color: '#8a8a80', marginLeft: 4 }}>▼</span>
        </button>

        {showCityFilter && (
          <div className="flex overflow-x-auto hide-scrollbar mb-3 gap-2">
            <button
              onClick={() => { dispatch({ type: 'SET_CITY', payload: null }); setShowCityFilter(false); }}
              className={!state.selectedCity ? 'area-chip area-chip-active' : 'area-chip'}
            >
              全部
            </button>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => { dispatch({ type: 'SET_CITY', payload: city }); setShowCityFilter(false); }}
                className={state.selectedCity === city ? 'area-chip area-chip-active' : 'area-chip'}
                style={{ whiteSpace: 'nowrap' }}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex overflow-x-auto hide-scrollbar mb-4 gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_CATEGORY', payload: null })}
            className={!state.selectedCategory ? 'area-chip area-chip-active' : 'area-chip'}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch({ type: 'SET_CATEGORY', payload: state.selectedCategory === cat ? null : cat })}
              className={state.selectedCategory === cat ? 'area-chip area-chip-active' : 'area-chip'}
              style={{ whiteSpace: 'nowrap' }}
            >
              {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <hr className="area-divider" style={{ marginBottom: 16 }} />
      </div>

      {/* Results */}
      <div className="px-5 pb-8">
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: '#8a8a80', marginBottom: 16, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {filteredProviders.length} 間店家
        </p>
        {filteredProviders.length === 0 ? (
          <div className="text-center pt-16">
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#1a1a18', marginBottom: 4 }}>沒有找到符合條件的店家</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#8a8a80' }}>試試其他搜尋條件</p>
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              isFavorite={isFavorite(provider.id)}
              onToggleFavorite={() => toggleFavorite(provider.id)}
              onPress={() => router.push(`/provider/${provider.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
}

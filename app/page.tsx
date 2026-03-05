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
      className="bg-surface rounded-xl border border-border p-4 mb-3 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 mr-3">
          <div className="flex items-center mb-1">
            <span className="text-[17px] font-semibold text-foreground font-heading">{provider.name}</span>
            {provider.isVerified && (
              <span className="ml-1.5 bg-secondary text-white text-[10px] font-semibold rounded-full px-2 py-0.5">
                認證
              </span>
            )}
          </div>
          <p className="text-[13px] text-muted mb-1.5">{categoryLabel} · {provider.district}</p>
          <p className="text-[13px] text-muted line-clamp-2">{provider.description}</p>
        </div>

        <div className="flex flex-col items-end">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="text-lg mb-1.5 hover:scale-110 transition-transform"
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
          <div className="flex items-center mb-1">
            <span className="text-xs">{'👍'.repeat(filledThumbs)}</span>
          </div>
          <span className="text-sm font-semibold text-foreground">
            {provider.rating}
            <span className="text-xs text-muted font-normal"> ({provider.reviewCount})</span>
          </span>
          <span className="text-[13px] text-secondary font-medium mt-0.5">{priceRange}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {provider.services.slice(0, 3).map((service) => (
          <span key={service.id} className="bg-accent/40 rounded-full px-2.5 py-1 text-xs text-secondary font-medium">
            {service.name}
          </span>
        ))}
        {provider.services.length > 3 && (
          <span className="bg-accent/40 rounded-full px-2.5 py-1 text-xs text-secondary font-medium">
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="pt-5 px-5">
        <h1 className="text-[28px] font-bold text-foreground mb-1 font-heading tracking-tight">BeautyBook</h1>
        <p className="text-sm text-muted mb-3">找到你附近最好的美容服務</p>

        {/* Booking Mode Toggle */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 rounded-full border-2 border-secondary bg-accent/30 py-2.5 text-center">
            <span className="text-sm text-secondary font-semibold">🔍 自己選擇</span>
          </button>
          <button
            onClick={() => router.push('/matching')}
            className="flex-1 rounded-full border border-border py-2.5 text-center"
          >
            <span className="text-sm text-foreground font-medium">🤖 智能媒合</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center bg-surface rounded-full border border-border px-4 h-11 mb-4">
          <span className="text-base text-muted mr-2">🔍</span>
          <input
            type="text"
            placeholder="搜尋店家、服務、設計師..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            className="flex-1 text-[15px] text-foreground bg-transparent placeholder:text-muted"
          />
          {state.searchQuery.length > 0 && (
            <button onClick={() => dispatch({ type: 'SET_SEARCH', payload: '' })} className="text-base text-muted">
              ✕
            </button>
          )}
        </div>

        {/* City Filter */}
        <button
          onClick={() => setShowCityFilter(!showCityFilter)}
          className="flex items-center mb-3"
        >
          <span className="text-[13px] text-muted mr-1">📍</span>
          <span className={`text-[13px] font-medium ${state.selectedCity ? 'text-secondary' : 'text-muted'}`}>
            {state.selectedCity || '全部地區'}
          </span>
          <span className="text-[10px] text-muted ml-1">▼</span>
        </button>

        {showCityFilter && (
          <div className="flex overflow-x-auto hide-scrollbar mb-3 gap-2">
            <button
              onClick={() => { dispatch({ type: 'SET_CITY', payload: null }); setShowCityFilter(false); }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full border text-[13px] transition-all ${
                !state.selectedCity
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-surface text-foreground border-border'
              }`}
            >
              全部
            </button>
            {CITIES.map((city) => (
              <button
                key={city}
                onClick={() => { dispatch({ type: 'SET_CITY', payload: city }); setShowCityFilter(false); }}
                className={`shrink-0 px-3.5 py-1.5 rounded-full border text-[13px] transition-all ${
                  state.selectedCity === city
                    ? 'bg-secondary text-white border-secondary'
                    : 'bg-surface text-foreground border-border'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        )}

        {/* Category Filter */}
        <div className="flex overflow-x-auto hide-scrollbar mb-2 gap-2">
          <button
            onClick={() => dispatch({ type: 'SET_CATEGORY', payload: null })}
            className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
              !state.selectedCategory
                ? 'bg-secondary text-white border-secondary'
                : 'bg-surface text-foreground border-border'
            }`}
          >
            全部
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => dispatch({ type: 'SET_CATEGORY', payload: state.selectedCategory === cat ? null : cat })}
              className={`shrink-0 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                state.selectedCategory === cat
                  ? 'bg-secondary text-white border-secondary'
                  : 'bg-surface text-foreground border-border'
              }`}
            >
              {SERVICE_CATEGORY_ICONS[cat]} {SERVICE_CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="px-5 pt-3 pb-5">
        <p className="text-[13px] text-muted mb-3">{filteredProviders.length} 間店家</p>
        {filteredProviders.length === 0 ? (
          <div className="text-center pt-16">
            <div className="text-[40px] mb-3">🔍</div>
            <p className="text-base text-muted">沒有找到符合條件的店家</p>
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

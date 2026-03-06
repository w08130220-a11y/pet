'use client';

import { useState } from 'react';
import { useAppStore, serviceCategories } from '@/lib/store';

export default function Explore() {
  const { portfolio, stylists, togglePortfolioLike } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? portfolio
    : portfolio.filter(p => p.category === serviceCategories.find(c => c.key === activeCategory)?.label);

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-[32px] font-bold font-heading tracking-tight" style={{ color: 'var(--color-black)' }}>
          BeautyBook
        </h1>
        <p className="text-body mt-1">探索最新美容趨勢與優質美容師</p>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: 'var(--color-cream)', border: '1px solid var(--color-border)' }}
        >
          <span>🔍</span>
          <input
            type="text"
            placeholder="搜尋美容師、服務..."
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-muted"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-5 mb-5 flex gap-2 overflow-x-auto hide-scrollbar">
        {serviceCategories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`chip whitespace-nowrap ${activeCategory === cat.key ? 'chip-active' : ''}`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      {/* Recommended Stylists */}
      <div className="px-5 mb-5">
        <p className="text-ui mb-3">推薦美容師</p>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {stylists.map(s => (
            <div key={s.id} className="card p-3 min-w-[140px] flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ background: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
              >
                {s.name.split(' ')[0][0]}
              </div>
              <p className="text-ui text-[13px] text-center">{s.name}</p>
              <p className="text-label text-[11px]">{s.salon}</p>
              <div className="flex items-center gap-1">
                <span className="text-[12px]">⭐</span>
                <span className="text-[12px] font-medium" style={{ color: 'var(--color-olive-dark)' }}>{s.rating}</span>
                <span className="text-label text-[10px]">({s.reviewCount})</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="divider mx-5 mb-4" />

      {/* Portfolio Grid */}
      <div className="px-5">
        <p className="text-ui mb-3">精選作品</p>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="card overflow-hidden">
              {/* Image placeholder */}
              <div
                className="w-full aspect-square flex items-center justify-center text-3xl"
                style={{ background: 'var(--color-cream)' }}
              >
                {item.category === '染髮' ? '🎨' : item.category === '美甲' ? '💅' : item.category === '美睫' ? '👁️' : item.category === '護髮' ? '💆' : '✂️'}
              </div>
              <div className="p-3">
                <p className="text-[12px] font-medium leading-tight" style={{ color: 'var(--color-black)' }}>
                  {item.caption}
                </p>
                <p className="text-label text-[11px] mt-1">{item.stylistName}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="chip text-[10px] py-0.5 px-2">{item.category}</span>
                  <button
                    onClick={() => togglePortfolioLike(item.id)}
                    className="text-[12px]"
                  >
                    {item.liked ? '❤️' : '🤍'} {item.likes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

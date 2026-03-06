'use client';

import { useAppStore } from '@/lib/store';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} 分鐘前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小時前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export default function Home() {
  const { posts, toggleLike } = useAppStore();

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <h1 className="text-[32px] font-bold font-heading tracking-tight" style={{ color: 'var(--color-black)' }}>
          PetLife
        </h1>
        <button className="btn-filled text-[13px] py-2 px-5">
          + 發布
        </button>
      </div>

      <hr className="divider mx-5 mb-4" />

      {/* Posts Feed */}
      <div className="flex flex-col gap-4 px-5">
        {posts.map(post => (
          <article key={post.id} className="card p-4">
            {/* User info */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: 'var(--color-olive-light)', color: 'var(--color-olive-dark)' }}
              >
                {post.userName[0]}
              </div>
              <div className="flex-1">
                <p className="text-ui">{post.userName}</p>
                <p className="text-label text-[12px]">{post.petName} · {timeAgo(post.createdAt)}</p>
              </div>
            </div>

            {/* Image placeholder */}
            <div
              className="w-full aspect-[4/3] rounded-xl mb-3 flex items-center justify-center text-4xl"
              style={{ background: 'var(--color-cream)' }}
            >
              {post.petName === 'Mochi' ? '🐕' : post.petName === 'Luna' ? '🐱' : '🐶'}
            </div>

            {/* Caption */}
            <p className="text-body mb-3" style={{ color: 'var(--color-black)' }}>
              {post.caption}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => toggleLike(post.id)}
                className={`flex items-center gap-1.5 text-[13px] font-medium transition-colors ${
                  post.liked ? 'text-red-500' : ''
                }`}
                style={!post.liked ? { color: 'var(--color-gray)' } : undefined}
              >
                {post.liked ? '❤️' : '🤍'} {post.likes}
              </button>
              <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: 'var(--color-gray)' }}>
                💬 {post.comments}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

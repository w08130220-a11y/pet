'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function ChatListPage() {
  const router = useRouter();
  const { state } = useAppStore();

  const sortedRooms = [...state.chatRooms].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

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
          訊息
        </h1>
        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 14,
          color: 'rgba(240,244,237,0.6)',
          position: 'relative',
          zIndex: 1,
        }}>
          與設計師直接溝通
        </p>
      </div>

      <div className="px-5 pt-4">
        {sortedRooms.length === 0 ? (
          <div className="area-card p-10 text-center mt-4">
            <div className="text-[40px] mb-2">💬</div>
            <p style={{ fontSize: 14, color: '#8a8a80' }}>還沒有對話</p>
            <p style={{ fontSize: 12, color: '#8a8a80', marginTop: 4 }}>透過媒合或店家頁面開始聊天</p>
          </div>
        ) : (
          sortedRooms.map((room) => {
            const timeStr = room.lastMessageAt
              ? new Date(room.lastMessageAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
              : '';
            return (
              <button
                key={room.id}
                onClick={() => router.push(`/chat/${room.id}`)}
                className="w-full text-left area-card p-4 mb-2 flex items-center"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mr-3 shrink-0" style={{ background: 'rgba(200,216,194,0.4)' }}>
                  <span className="text-xl">🏪</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#1a1a18' }} className="truncate">{room.providerName}</span>
                    <span style={{ fontSize: 11, color: '#8a8a80' }} className="shrink-0 ml-2">{timeStr}</span>
                  </div>
                  <p style={{ fontSize: 13, color: '#8a8a80' }} className="truncate">{room.lastMessage || '開始對話...'}</p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="ml-2 text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0" style={{ background: '#4a6741', color: '#fff' }}>
                    {room.unreadCount}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

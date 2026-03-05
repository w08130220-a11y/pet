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
    <div className="min-h-screen bg-background pb-20">
      <div className="pt-5 px-5">
        <h1 className="text-[28px] font-bold text-foreground mb-1 font-heading tracking-tight">訊息</h1>
        <p className="text-sm text-muted mb-4">與設計師直接溝通</p>

        {sortedRooms.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-10 text-center mt-8">
            <div className="text-[40px] mb-2">💬</div>
            <p className="text-sm text-muted">還沒有對話</p>
            <p className="text-xs text-muted mt-1">透過媒合或店家頁面開始聊天</p>
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
                className="w-full text-left bg-surface rounded-xl border border-border p-4 mb-2 flex items-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent/40 flex items-center justify-center mr-3 shrink-0">
                  <span className="text-xl">🏪</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[15px] font-medium text-foreground truncate">{room.providerName}</span>
                    <span className="text-[11px] text-muted shrink-0 ml-2">{timeStr}</span>
                  </div>
                  <p className="text-[13px] text-muted truncate">{room.lastMessage || '開始對話...'}</p>
                </div>
                {room.unreadCount > 0 && (
                  <span className="ml-2 bg-secondary text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
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

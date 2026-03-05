'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function ChatRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { state, sendChatMessage, dispatch } = useAppStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const room = state.chatRooms.find((r) => r.id === roomId);
  const messages = state.chatMessages.filter((m) => m.roomId === roomId);

  // Mark as read on mount
  useEffect(() => {
    if (room && room.unreadCount > 0) {
      dispatch({ type: 'UPDATE_CHAT_ROOM', payload: { id: roomId, updates: { unreadCount: 0 } } });
    }
  }, [roomId, room, dispatch]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const role = state.userRole === 'provider' ? 'provider' : 'customer';
    sendChatMessage(roomId, input.trim(), role);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-base text-muted">找不到聊天室</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-primary">返回</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b px-5 pt-4 pb-3 flex items-center" style={{ background: 'rgba(240,244,237,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,0,0,0.06)' }}>
        <button onClick={() => router.back()} className="mr-3 p-1 text-base text-foreground">←</button>
        <div className="w-8 h-8 rounded-full bg-accent/40 flex items-center justify-center mr-2">
          <span className="text-sm">🏪</span>
        </div>
        <span className="text-lg font-semibold text-foreground font-heading">{room.providerName}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center pt-10">
            <p className="text-sm text-muted">開始與 {room.providerName} 對話</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderRole === (state.userRole === 'provider' ? 'provider' : 'customer');
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMe
                    ? 'bg-secondary text-white rounded-br-md'
                    : 'bg-surface border border-border text-foreground rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-5 whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-muted'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Replies */}
      <div className="px-4 pt-2 flex overflow-x-auto hide-scrollbar gap-2">
        {['你好，想了解服務', '請問還有空檔嗎？', '費用大概多少？', '可以看作品嗎？'].map((text) => (
          <button
            key={text}
            onClick={() => setInput(text)}
            className="shrink-0 px-3 py-1.5 rounded-full border border-border text-xs text-muted bg-surface"
          >
            {text}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(240,244,237,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,0,0,0.06)' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入訊息..."
          className="flex-1 bg-surface border border-border rounded-full px-4 py-2.5 text-sm text-foreground placeholder:text-muted"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            input.trim() ? 'bg-secondary' : 'bg-border'
          }`}
        >
          <span className="text-white text-sm">➤</span>
        </button>
      </div>
    </div>
  );
}

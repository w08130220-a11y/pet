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
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ background: '#f0f4ed' }}>
        <p style={{ fontSize: 16, color: '#8a8a80' }}>找不到聊天室</p>
        <button onClick={() => router.back()} className="mt-4 text-sm" style={{ color: '#4a6741' }}>返回</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#f0f4ed' }}>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 flex items-center" style={{ background: 'linear-gradient(170deg, #1a2e1a 0%, #2d4a2d 60%, #3a5a3a 100%)' }}>
        <button onClick={() => router.back()} className="mr-3 p-1 text-base" style={{ color: 'rgba(240,244,237,0.6)' }}>←</button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ background: 'rgba(200,216,194,0.3)' }}>
          <span className="text-sm">🏪</span>
        </div>
        <span className="text-lg font-semibold" style={{ color: '#f0f4ed', fontFamily: "'Playfair Display', serif" }}>{room.providerName}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center pt-10">
            <p style={{ fontSize: 14, color: '#8a8a80' }}>開始與 {room.providerName} 對話</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderRole === (state.userRole === 'provider' ? 'provider' : 'customer');
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[75%] rounded-2xl px-4 py-2.5"
                style={
                  isMe
                    ? { background: '#4a6741', color: '#fff', borderBottomRightRadius: 6 }
                    : { background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18', borderBottomLeftRadius: 6 }
                }
              >
                <p className="text-sm leading-5 whitespace-pre-wrap">{msg.content}</p>
                <p style={{ fontSize: 10, color: isMe ? 'rgba(255,255,255,0.6)' : '#8a8a80', marginTop: 4 }}>
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
            className="shrink-0 px-3 py-1.5 rounded-full text-xs"
            style={{ border: '1px solid #e8ede6', color: '#8a8a80', background: '#fff' }}
          >
            {text}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'rgba(240,244,237,0.92)', backdropFilter: 'blur(12px)', borderTop: '1px solid #e8ede6' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入訊息..."
          className="flex-1 rounded-full px-4 py-2.5 text-sm"
          style={{ background: '#fff', border: '1px solid #e8ede6', color: '#1a1a18' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: input.trim() ? '#4a6741' : '#e8ede6' }}
        >
          <span style={{ color: '#fff', fontSize: 14 }}>➤</span>
        </button>
      </div>
    </div>
  );
}

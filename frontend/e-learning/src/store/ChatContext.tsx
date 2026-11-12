import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { chatService } from '@/services/chatService';
import { storage } from '@/storage';
import { useAppStore } from '@/store/AppContext';
import type { ChatMessage } from '@/types/chat';

/**
 * Giữ phiên trò chuyện với trợ lý AI ở cấp ứng dụng (không nằm trong màn hình Chat nữa) nên:
 *  - thoát ra / vào lại trang trợ lý vẫn còn đoạn chat;
 *  - tắt hẳn app rồi mở lại vẫn còn (lưu theo từng người dùng, đồng bộ lại với server);
 *  - bong bóng nổi và màn hình Chat dùng chung một trạng thái.
 */
const MAX_PERSISTED = 60;
const keyOf = (userId: string) => `chat_session_${userId}`;

interface Persisted {
  conversationId?: string;
  messages: ChatMessage[];
}

export interface ChatContextType {
  messages: ChatMessage[];
  conversationId?: string;
  sending: boolean;
  hydrating: boolean;
  /** Có câu trả lời mới mà người dùng chưa xem (hiện chấm đỏ trên bong bóng). */
  unread: boolean;
  markRead: () => void;
  send: (text: string, ctx?: { courseId?: string; lessonId?: string; retry?: boolean }) => Promise<void>;
  newChat: () => void;
  openConversation: (id: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

let localId = 0;
const nextLocalId = () => `local-${Date.now()}-${localId++}`;

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  const userId = user?.id ? String(user.id) : undefined;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [hydrating, setHydrating] = useState(false);
  const [unread, setUnread] = useState(false);
  const markRead = useCallback(() => setUnread(false), []);

  const stateRef = useRef({ conversationId, sending });
  stateRef.current = { conversationId, sending };
  const hydratedFor = useRef<string | undefined>(undefined);

  // Nạp phiên đã lưu khi người dùng đăng nhập / đổi tài khoản; xóa khi đăng xuất.
  useEffect(() => {
    if (!userId) {
      hydratedFor.current = undefined;
      setMessages([]);
      setConversationId(undefined);
      setUnread(false);
      return;
    }
    if (hydratedFor.current === userId) return;
    hydratedFor.current = userId;
    let alive = true;
    setHydrating(true);
    (async () => {
      const saved = await storage.getItem<Persisted>(keyOf(userId));
      if (!alive) return;
      if (saved?.messages?.length) {
        setMessages(saved.messages);
        setConversationId(saved.conversationId);
      }
      setHydrating(false);
      // Đồng bộ lại từ server (nguồn sự thật) khi có conversationId.
      if (saved?.conversationId) {
        try {
          const fresh = await chatService.messages(saved.conversationId);
          if (alive && fresh.length) setMessages(fresh);
        } catch {
          // offline / hội thoại đã bị xóa: giữ bản đã lưu
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId]);

  // Lưu mỗi khi đổi (bỏ tin nhắn lỗi tạm thời).
  useEffect(() => {
    if (!userId || hydratedFor.current !== userId || hydrating) return;
    const persistable = messages.filter((m) => !m.error).slice(-MAX_PERSISTED);
    if (persistable.length === 0 && !conversationId) {
      storage.removeItem(keyOf(userId));
      return;
    }
    storage.setItem(keyOf(userId), { conversationId, messages: persistable } satisfies Persisted);
  }, [messages, conversationId, userId, hydrating]);

  const send = useCallback<ChatContextType['send']>(async (raw, ctx) => {
    const text = raw.trim();
    if (!text || stateRef.current.sending) return;
    setSending(true);
    setMessages((prev) => {
      if (ctx?.retry) return prev.filter((m) => !m.error);
      return [...prev, { id: nextLocalId(), role: 'USER', content: text, courses: [], createdAt: new Date().toISOString() }];
    });
    try {
      const res = await chatService.send({
        message: text,
        conversationId: stateRef.current.conversationId,
        courseId: ctx?.courseId,
        lessonId: ctx?.lessonId,
      });
      setConversationId(res.conversationId);
      setMessages((prev) => [...prev, res.reply]);
      setUnread(true);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: nextLocalId(),
          role: 'ASSISTANT',
          content: e?.message || 'Không gửi được tin nhắn. Vui lòng thử lại.',
          courses: [],
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }, []);

  const newChat = useCallback(() => {
    if (stateRef.current.sending) return;
    setMessages([]);
    setConversationId(undefined);
  }, []);

  const openConversation = useCallback(async (id: string) => {
    setHydrating(true);
    try {
      const list = await chatService.messages(id);
      setMessages(list);
      setConversationId(id);
    } finally {
      setHydrating(false);
    }
  }, []);

  const value = useMemo(
    () => ({ messages, conversationId, sending, hydrating, unread, markRead, send, newChat, openConversation }),
    [messages, conversationId, sending, hydrating, unread, markRead, send, newChat, openConversation],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat phải nằm trong <ChatProvider>');
  return ctx;
}

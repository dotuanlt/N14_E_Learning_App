import { apiClient, ENDPOINTS } from '@/api';
import type { ChatConversation, ChatCourseCard, ChatMessage, ChatReply } from '@/types/chat';

function mapCourse(c: any): ChatCourseCard {
  const sale = Number(c?.salePrice ?? c?.originalPrice ?? 0);
  const original = Number(c?.originalPrice ?? sale);
  return {
    id: String(c.id),
    title: String(c.title ?? ''),
    instructor: c?.instructor?.fullName ?? c?.instructor?.name,
    price: sale,
    originalPrice: original > sale ? original : undefined,
    rating: Number(c?.avgRating ?? 0),
    reviewCount: Number(c?.reviewCount ?? 0),
    thumbnailUrl: c?.thumbnailUrl ?? undefined,
    owned: Boolean(c?.owned),
  };
}

function mapMessage(m: any): ChatMessage {
  return {
    id: String(m.id),
    role: m.role === 'USER' ? 'USER' : 'ASSISTANT',
    content: String(m.content ?? ''),
    courses: Array.isArray(m.courses) ? m.courses.map(mapCourse) : [],
    createdAt: m.createdAt,
  };
}

export interface SendChatParams {
  message: string;
  conversationId?: string;
  courseId?: string;
  lessonId?: string;
}

export const chatService = {
  async send(params: SendChatParams): Promise<ChatReply> {
    const data = await apiClient.post<any>(ENDPOINTS.CHAT.SEND, params);
    return {
      conversationId: String(data.conversationId),
      title: String(data.title ?? ''),
      reply: mapMessage(data.reply),
    };
  },

  async conversations(): Promise<ChatConversation[]> {
    const data = await apiClient.get<any[]>(ENDPOINTS.CHAT.CONVERSATIONS);
    return Array.isArray(data)
      ? data.map((c) => ({
          id: String(c.id),
          title: String(c.title ?? ''),
          courseId: c.courseId ?? undefined,
          messageCount: Number(c.messageCount ?? 0),
          updatedAt: c.updatedAt,
        }))
      : [];
  },

  async messages(conversationId: string): Promise<ChatMessage[]> {
    const data = await apiClient.get<any[]>(ENDPOINTS.CHAT.MESSAGES(conversationId));
    return Array.isArray(data) ? data.map(mapMessage) : [];
  },

  async remove(conversationId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.CHAT.DELETE(conversationId));
  },
};

/** Thẻ khóa học trợ lý AI nhắc tới (rút gọn từ CourseSummaryResponse của backend). */
export interface ChatCourseCard {
  id: string;
  title: string;
  instructor?: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  thumbnailUrl?: string;
  owned?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  courses: ChatCourseCard[];
  createdAt?: string;
  /** Tin nhắn lỗi cục bộ (không lưu trên máy chủ), cho phép bấm "Thử lại". */
  error?: boolean;
}

export interface ChatReply {
  conversationId: string;
  title: string;
  reply: ChatMessage;
}

export interface ChatConversation {
  id: string;
  title: string;
  courseId?: string;
  messageCount: number;
  updatedAt?: string;
}

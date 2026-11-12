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

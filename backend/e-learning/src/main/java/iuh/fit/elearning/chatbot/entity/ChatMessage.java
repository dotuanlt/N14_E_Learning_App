package iuh.fit.elearning.chatbot.entity;

import iuh.fit.elearning.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/** Một tin nhắn trong cuộc trò chuyện. course_ids: danh sách id khóa học bot đã nhắc tới (cách nhau bằng dấu phẩy). */
@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ChatMessage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id", nullable = false)
    private ChatConversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private ChatRole role;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "course_ids", columnDefinition = "TEXT")
    private String courseIds;
}

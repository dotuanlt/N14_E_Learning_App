package iuh.fit.elearning.chatbot.entity;

import iuh.fit.elearning.common.entity.AuditableEntity;
import iuh.fit.elearning.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

/** Cuộc trò chuyện giữa một người dùng và trợ lý AI (có thể gắn với một khóa học). */
@Entity
@Table(name = "chat_conversations")
@Getter
@Setter
@NoArgsConstructor
@SuperBuilder
public class ChatConversation extends AuditableEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Khóa học đang xem khi bắt đầu trò chuyện (không bắt buộc). */
    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "title", nullable = false)
    private String title;

    @Builder.Default
    @Column(name = "message_count", nullable = false)
    private Integer messageCount = 0;
}

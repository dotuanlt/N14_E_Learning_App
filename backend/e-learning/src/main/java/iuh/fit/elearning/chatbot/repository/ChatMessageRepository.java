package iuh.fit.elearning.chatbot.repository;

import iuh.fit.elearning.chatbot.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    /** Các tin nhắn mới nhất (giảm dần theo thời gian) - đảo lại khi dùng. */
    List<ChatMessage> findByConversationIdOrderByCreatedAtDesc(UUID conversationId, Pageable pageable);

    @Modifying
    @Query("delete from ChatMessage m where m.conversation.id = :conversationId")
    int deleteByConversationId(@Param("conversationId") UUID conversationId);
}

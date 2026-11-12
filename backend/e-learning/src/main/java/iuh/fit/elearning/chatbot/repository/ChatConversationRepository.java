package iuh.fit.elearning.chatbot.repository;

import iuh.fit.elearning.chatbot.entity.ChatConversation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {

    Optional<ChatConversation> findByIdAndUserId(UUID id, UUID userId);

    List<ChatConversation> findByUserIdOrderByUpdatedAtDesc(UUID userId, Pageable pageable);
}

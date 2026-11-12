package iuh.fit.elearning.chatbot.dto;

import java.time.Instant;
import java.util.UUID;

public record ConversationResponse(
        UUID id,
        String title,
        UUID courseId,
        int messageCount,
        Instant updatedAt
) {
}

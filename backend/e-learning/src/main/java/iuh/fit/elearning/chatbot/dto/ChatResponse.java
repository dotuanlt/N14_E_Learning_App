package iuh.fit.elearning.chatbot.dto;

import java.util.UUID;

public record ChatResponse(
        UUID conversationId,
        String title,
        ChatMessageResponse reply
) {
}

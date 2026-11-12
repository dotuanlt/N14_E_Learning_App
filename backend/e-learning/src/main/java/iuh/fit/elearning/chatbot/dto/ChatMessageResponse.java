package iuh.fit.elearning.chatbot.dto;

import iuh.fit.elearning.course.dto.response.CourseSummaryResponse;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** role = USER | ASSISTANT; courses: thẻ khóa học bot nhắc tới (rỗng nếu không có). */
public record ChatMessageResponse(
        UUID id,
        String role,
        String content,
        List<CourseSummaryResponse> courses,
        Instant createdAt
) {
}

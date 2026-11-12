package iuh.fit.elearning.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

/**
 * conversationId: null = bắt đầu cuộc trò chuyện mới.
 * courseId / lessonId: ngữ cảnh khi người dùng mở trợ lý từ trang khóa học hoặc màn hình học (không bắt buộc).
 */
public record ChatRequest(
        @NotBlank(message = "Vui lòng nhập nội dung") @Size(max = 2000, message = "Nội dung quá dài") String message,
        UUID conversationId,
        UUID courseId,
        UUID lessonId
) {
}

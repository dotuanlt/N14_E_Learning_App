package iuh.fit.elearning.chatbot.llm;

import java.util.Map;

/**
 * Yêu cầu gọi hàm do mô hình sinh ra.
 *
 * @param id        mã gọi hàm (OpenAI cấp; Gemini không có nên tự sinh)
 * @param args      tham số đã parse
 * @param signature dữ liệu riêng của nhà cung cấp cần gửi lại nguyên vẹn (Gemini: thoughtSignature), có thể null
 */
public record LlmToolCall(String id, String name, Map<String, Object> args, String signature) {

    public LlmToolCall(String id, String name, Map<String, Object> args) {
        this(id, name, args, null);
    }
}

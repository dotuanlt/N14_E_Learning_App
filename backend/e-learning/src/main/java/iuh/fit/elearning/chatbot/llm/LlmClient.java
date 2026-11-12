package iuh.fit.elearning.chatbot.llm;

/**
 * Cổng gọi mô hình ngôn ngữ (cùng kiểu với OtpStore, PaymentGateway...): đổi nhà cung cấp chỉ cần đổi cấu hình
 * app.chat.provider, không sửa ChatService.
 */
public interface LlmClient {

    /** Tên nhà cung cấp, dùng để ghi log. */
    String name();

    /** Gọi mô hình một lượt; ném {@link LlmException} khi lỗi. */
    LlmResponse generate(LlmRequest request);
}

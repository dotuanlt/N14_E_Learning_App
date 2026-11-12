package iuh.fit.elearning.chatbot.llm;

/**
 * Lỗi khi gọi nhà cung cấp mô hình AI (hết hạn mức, sai khóa, quá thời gian, phản hồi sai định dạng...).
 * Thông điệp không bao giờ chứa khóa API.
 */
public class LlmException extends RuntimeException {

    public enum Kind {
        RATE_LIMITED, AUTH, UNAVAILABLE, BAD_REQUEST, BAD_RESPONSE
    }

    private final Kind kind;
    private final int httpStatus;

    public LlmException(Kind kind, int httpStatus, String message) {
        super(message);
        this.kind = kind;
        this.httpStatus = httpStatus;
    }

    public LlmException(Kind kind, String message, Throwable cause) {
        super(message, cause);
        this.kind = kind;
        this.httpStatus = 0;
    }

    public Kind getKind() {
        return kind;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}

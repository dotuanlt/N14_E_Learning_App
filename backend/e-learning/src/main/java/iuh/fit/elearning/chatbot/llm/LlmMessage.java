package iuh.fit.elearning.chatbot.llm;

import java.util.List;

/** Một lượt hội thoại, độc lập với định dạng của từng nhà cung cấp. */
public record LlmMessage(Role role, String text, List<LlmToolCall> toolCalls, String toolCallId, String toolName) {

    public enum Role {
        USER, ASSISTANT, TOOL
    }

    public static LlmMessage user(String text) {
        return new LlmMessage(Role.USER, text, List.of(), null, null);
    }

    public static LlmMessage assistant(String text) {
        return new LlmMessage(Role.ASSISTANT, text, List.of(), null, null);
    }

    public static LlmMessage assistant(String text, List<LlmToolCall> toolCalls) {
        return new LlmMessage(Role.ASSISTANT, text, toolCalls == null ? List.of() : toolCalls, null, null);
    }

    /** Kết quả của một lần gọi hàm; text là JSON dạng chuỗi. */
    public static LlmMessage tool(String toolCallId, String toolName, String text) {
        return new LlmMessage(Role.TOOL, text, List.of(), toolCallId, toolName);
    }
}

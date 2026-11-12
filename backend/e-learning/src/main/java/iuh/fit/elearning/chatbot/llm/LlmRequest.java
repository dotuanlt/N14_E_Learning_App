package iuh.fit.elearning.chatbot.llm;

import java.util.List;

public record LlmRequest(String systemPrompt, List<LlmMessage> messages, List<LlmToolSpec> tools) {
}

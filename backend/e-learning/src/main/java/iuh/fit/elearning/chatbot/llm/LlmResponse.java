package iuh.fit.elearning.chatbot.llm;

import java.util.List;

public record LlmResponse(String text, List<LlmToolCall> toolCalls) {

    public LlmResponse {
        text = text == null ? "" : text;
        toolCalls = toolCalls == null ? List.of() : toolCalls;
    }

    public boolean hasToolCalls() {
        return !toolCalls.isEmpty();
    }
}

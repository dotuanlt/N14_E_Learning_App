package iuh.fit.elearning.chatbot.llm;

import java.util.Map;

/** Khai báo một hàm cho mô hình; parameters là JSON Schema (type = object). */
public record LlmToolSpec(String name, String description, Map<String, Object> parameters) {
}

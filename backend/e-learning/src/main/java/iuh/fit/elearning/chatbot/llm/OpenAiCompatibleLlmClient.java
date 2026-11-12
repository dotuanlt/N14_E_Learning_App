package iuh.fit.elearning.chatbot.llm;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * API chuẩn OpenAI Chat Completions: dùng được cho Groq (miễn phí), OpenRouter, OpenAI, Ollama...
 * chỉ cần đổi base-url, model và khóa.
 */
public class OpenAiCompatibleLlmClient implements LlmClient {

    private final String baseUrl;
    private final String apiKey;
    private final String model;
    private final double temperature;
    private final int maxOutputTokens;
    private final LlmHttp http;

    public OpenAiCompatibleLlmClient(String baseUrl, String apiKey, String model, double temperature,
                                     int maxOutputTokens, Duration timeout) {
        this.baseUrl = baseUrl != null && baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
        this.maxOutputTokens = maxOutputTokens;
        this.http = new LlmHttp(timeout);
    }

    @Override
    public String name() {
        return "openai-compatible:" + model;
    }

    @Override
    public LlmResponse generate(LlmRequest request) {
        String raw = http.postJson(baseUrl + "/chat/completions",
                Map.of("Authorization", "Bearer " + apiKey), MiniJson.write(buildBody(request)));
        return parse(raw);
    }

    Map<String, Object> buildBody(LlmRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", model);
        List<Object> messages = new ArrayList<>();
        if (request.systemPrompt() != null && !request.systemPrompt().isBlank()) {
            messages.add(Map.of("role", "system", "content", request.systemPrompt()));
        }
        for (LlmMessage m : request.messages()) {
            switch (m.role()) {
                case USER -> messages.add(Map.of("role", "user", "content", m.text()));
                case TOOL -> {
                    Map<String, Object> t = new LinkedHashMap<>();
                    t.put("role", "tool");
                    t.put("tool_call_id", m.toolCallId());
                    t.put("content", m.text());
                    messages.add(t);
                }
                case ASSISTANT -> {
                    Map<String, Object> a = new LinkedHashMap<>();
                    a.put("role", "assistant");
                    a.put("content", m.text() == null || m.text().isBlank() ? null : m.text());
                    if (!m.toolCalls().isEmpty()) {
                        List<Object> calls = new ArrayList<>();
                        for (LlmToolCall c : m.toolCalls()) {
                            calls.add(Map.of("id", c.id(), "type", "function",
                                    "function", Map.of("name", c.name(), "arguments", MiniJson.write(c.args()))));
                        }
                        a.put("tool_calls", calls);
                    }
                    messages.add(a);
                }
            }
        }
        body.put("messages", messages);
        if (request.tools() != null && !request.tools().isEmpty()) {
            List<Object> tools = new ArrayList<>();
            for (LlmToolSpec t : request.tools()) {
                Map<String, Object> params = t.parameters() != null ? t.parameters()
                        : Map.of("type", "object", "properties", Map.of());
                tools.add(Map.of("type", "function", "function",
                        Map.of("name", t.name(), "description", t.description(), "parameters", params)));
            }
            body.put("tools", tools);
            body.put("tool_choice", "auto");
        }
        body.put("temperature", temperature);
        body.put("max_tokens", maxOutputTokens);
        return body;
    }

    LlmResponse parse(String raw) {
        Map<String, Object> root;
        try {
            root = MiniJson.asMap(MiniJson.parse(raw));
        } catch (IllegalArgumentException e) {
            throw new LlmException(LlmException.Kind.BAD_RESPONSE, "Phản hồi AI không phải JSON hợp lệ", e);
        }
        List<Object> choices = MiniJson.asList(root.get("choices"));
        if (choices.isEmpty()) {
            return new LlmResponse("", List.of());
        }
        Map<String, Object> message = MiniJson.asMap(MiniJson.asMap(choices.get(0)).get("message"));
        String text = MiniJson.asString(message.get("content"));
        List<LlmToolCall> calls = new ArrayList<>();
        for (Object o : MiniJson.asList(message.get("tool_calls"))) {
            Map<String, Object> call = MiniJson.asMap(o);
            Map<String, Object> fn = MiniJson.asMap(call.get("function"));
            String name = MiniJson.asString(fn.get("name"));
            if (name == null) {
                continue;
            }
            String id = MiniJson.asString(call.get("id"));
            Object args = fn.get("arguments");
            Map<String, Object> parsedArgs = args instanceof String s ? MiniJson.parseObjectOrEmpty(s)
                    : MiniJson.asMap(args);
            calls.add(new LlmToolCall(id != null ? id : "call_" + UUID.randomUUID(), name, parsedArgs));
        }
        return new LlmResponse(text == null ? "" : text.trim(), calls);
    }
}

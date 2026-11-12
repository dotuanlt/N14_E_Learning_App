package iuh.fit.elearning.chatbot.llm;

import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Google Gemini (REST generateContent, có gói miễn phí). Khóa API gửi qua header x-goog-api-key, không đưa vào URL.
 */
public class GeminiLlmClient implements LlmClient {

    private final String baseUrl;
    private final String apiKey;
    private final String model;
    private final double temperature;
    private final int maxOutputTokens;
    private final LlmHttp http;

    public GeminiLlmClient(String baseUrl, String apiKey, String model, double temperature, int maxOutputTokens,
                           Duration timeout) {
        this.baseUrl = trimSlash(baseUrl);
        this.apiKey = apiKey;
        this.model = model;
        this.temperature = temperature;
        this.maxOutputTokens = maxOutputTokens;
        this.http = new LlmHttp(timeout);
    }

    @Override
    public String name() {
        return "gemini:" + model;
    }

    @Override
    public LlmResponse generate(LlmRequest request) {
        String url = baseUrl + "/models/" + model + ":generateContent";
        String body = MiniJson.write(buildBody(request));
        String raw = http.postJson(url, Map.of("x-goog-api-key", apiKey), body);
        return parse(raw);
    }

    // ------------------------------------------------------------------ build

    Map<String, Object> buildBody(LlmRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        if (request.systemPrompt() != null && !request.systemPrompt().isBlank()) {
            body.put("systemInstruction", Map.of("parts", List.of(Map.of("text", request.systemPrompt()))));
        }
        body.put("contents", buildContents(request.messages()));
        if (request.tools() != null && !request.tools().isEmpty()) {
            List<Object> declarations = new ArrayList<>();
            for (LlmToolSpec t : request.tools()) {
                Map<String, Object> d = new LinkedHashMap<>();
                d.put("name", t.name());
                d.put("description", t.description());
                Map<String, Object> params = t.parameters();
                if (params != null && !MiniJson.asMap(params.get("properties")).isEmpty()) {
                    d.put("parameters", toGeminiSchema(params));
                }
                declarations.add(d);
            }
            body.put("tools", List.of(Map.of("functionDeclarations", declarations)));
        }
        Map<String, Object> generation = new LinkedHashMap<>();
        generation.put("temperature", temperature);
        generation.put("maxOutputTokens", maxOutputTokens);
        body.put("generationConfig", generation);
        return body;
    }

    private List<Object> buildContents(List<LlmMessage> messages) {
        List<Object> contents = new ArrayList<>();
        List<Object> pendingToolParts = null;
        for (LlmMessage m : messages) {
            if (m.role() == LlmMessage.Role.TOOL) {
                if (pendingToolParts == null) {
                    pendingToolParts = new ArrayList<>();
                }
                Map<String, Object> response = new LinkedHashMap<>();
                Object parsed;
                try {
                    parsed = MiniJson.parse(m.text());
                } catch (IllegalArgumentException e) {
                    parsed = m.text();
                }
                if (parsed instanceof Map<?, ?>) {
                    response.putAll(MiniJson.asMap(parsed));
                } else {
                    response.put("result", parsed);
                }
                Map<String, Object> fr = new LinkedHashMap<>();
                fr.put("name", m.toolName());
                fr.put("response", response);
                pendingToolParts.add(Map.of("functionResponse", fr));
                continue;
            }
            if (pendingToolParts != null) {
                contents.add(Map.of("role", "user", "parts", pendingToolParts));
                pendingToolParts = null;
            }
            if (m.role() == LlmMessage.Role.USER) {
                contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", m.text()))));
            } else {
                List<Object> parts = new ArrayList<>();
                if (m.text() != null && !m.text().isBlank()) {
                    parts.add(Map.of("text", m.text()));
                }
                for (LlmToolCall c : m.toolCalls()) {
                    Map<String, Object> part = new LinkedHashMap<>();
                    part.put("functionCall", Map.of("name", c.name(), "args", c.args()));
                    if (c.signature() != null) {
                        part.put("thoughtSignature", c.signature());
                    }
                    parts.add(part);
                }
                if (!parts.isEmpty()) {
                    contents.add(Map.of("role", "model", "parts", parts));
                }
            }
        }
        if (pendingToolParts != null) {
            contents.add(Map.of("role", "user", "parts", pendingToolParts));
        }
        return contents;
    }

    /** Gemini dùng kiểu viết hoa (STRING, OBJECT, ...). */
    static Map<String, Object> toGeminiSchema(Map<String, Object> schema) {
        Map<String, Object> out = new LinkedHashMap<>();
        for (Map.Entry<String, Object> e : schema.entrySet()) {
            String k = e.getKey();
            Object v = e.getValue();
            if ("type".equals(k) && v instanceof String s) {
                out.put(k, s.toUpperCase());
            } else if ("properties".equals(k) && v instanceof Map<?, ?>) {
                Map<String, Object> props = new LinkedHashMap<>();
                for (Map.Entry<String, Object> p : MiniJson.asMap(v).entrySet()) {
                    props.put(p.getKey(), toGeminiSchema(MiniJson.asMap(p.getValue())));
                }
                out.put(k, props);
            } else if ("items".equals(k) && v instanceof Map<?, ?>) {
                out.put(k, toGeminiSchema(MiniJson.asMap(v)));
            } else if (!"additionalProperties".equals(k)) {
                out.put(k, v);
            }
        }
        return out;
    }

    // ------------------------------------------------------------------ parse

    LlmResponse parse(String raw) {
        Map<String, Object> root;
        try {
            root = MiniJson.asMap(MiniJson.parse(raw));
        } catch (IllegalArgumentException e) {
            throw new LlmException(LlmException.Kind.BAD_RESPONSE, "Phản hồi Gemini không phải JSON hợp lệ", e);
        }
        List<Object> candidates = MiniJson.asList(root.get("candidates"));
        if (candidates.isEmpty()) {
            return new LlmResponse("", List.of()); // bị chặn bởi bộ lọc an toàn hoặc không có kết quả
        }
        Map<String, Object> content = MiniJson.asMap(MiniJson.asMap(candidates.get(0)).get("content"));
        StringBuilder text = new StringBuilder();
        List<LlmToolCall> calls = new ArrayList<>();
        for (Object o : MiniJson.asList(content.get("parts"))) {
            Map<String, Object> part = MiniJson.asMap(o);
            if (Boolean.TRUE.equals(part.get("thought"))) {
                continue; // phần "suy nghĩ" của mô hình, không hiển thị
            }
            if (part.get("text") instanceof String t) {
                text.append(t);
            }
            if (part.get("functionCall") instanceof Map<?, ?> fc) {
                Map<String, Object> f = MiniJson.asMap(fc);
                String name = MiniJson.asString(f.get("name"));
                if (name != null) {
                    calls.add(new LlmToolCall("call_" + UUID.randomUUID(), name, MiniJson.asMap(f.get("args")),
                            MiniJson.asString(part.get("thoughtSignature"))));
                }
            }
        }
        return new LlmResponse(text.toString().trim(), calls);
    }

    private static String trimSlash(String s) {
        return s != null && s.endsWith("/") ? s.substring(0, s.length() - 1) : s;
    }
}

package iuh.fit.elearning.chatbot.llm;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Bản giả lập không cần khóa API (dùng khi dev / chạy test): đoán ý định bằng từ khóa, gọi đúng hàm rồi trả
 * lại kết quả thô. Không phải AI thật; app.chat.provider=gemini hoặc openai để dùng mô hình thật.
 */
public class MockLlmClient implements LlmClient {

    private static final Set<String> STOP = Set.of("toi", "muon", "hoc", "khoa", "ban", "co", "nao", "cho", "tim",
            "giup", "minh", "la", "gi", "the", "ve", "va", "cac", "mot", "nhung", "can", "xin", "hay", "duoc", "khong");

    @Override
    public String name() {
        return "mock";
    }

    @Override
    public LlmResponse generate(LlmRequest request) {
        List<LlmMessage> messages = request.messages();
        LlmMessage last = messages.get(messages.size() - 1);
        if (last.role() == LlmMessage.Role.TOOL) {
            String result = last.text() == null ? "" : last.text();
            if (result.length() > 700) {
                result = result.substring(0, 700) + "...";
            }
            return new LlmResponse("[Chế độ giả lập - chưa kết nối mô hình AI] Kết quả tra cứu: " + result, List.of());
        }
        String text = last.text() == null ? "" : last.text();
        String plain = strip(text);
        if (plain.contains("hoan tien") || plain.contains("chinh sach") || plain.contains("chung chi")) {
            return call("get_policies", Map.of("topic", plain.contains("chung chi") ? "certificate" : "refund"));
        }
        if (plain.contains("don hang") || plain.contains("thanh toan")) {
            return call("get_my_orders", Map.of());
        }
        if (plain.contains("tien do") || plain.contains("dang hoc") || plain.contains("lo trinh")) {
            return call("get_my_learning", Map.of());
        }
        String keyword = java.util.Arrays.stream(plain.split("[^a-z0-9+#.]+"))
                .filter(w -> w.length() > 1 && !STOP.contains(w)).limit(3).collect(Collectors.joining(" "));
        return call("search_courses", keyword.isBlank() ? Map.of() : Map.of("keyword", keyword));
    }

    private static LlmResponse call(String name, Map<String, Object> args) {
        return new LlmResponse("", List.of(new LlmToolCall("mock_" + UUID.randomUUID(), name, args)));
    }

    private static String strip(String s) {
        String n = Normalizer.normalize(s.toLowerCase(Locale.ROOT), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").replace('đ', 'd');
        return n.trim();
    }
}

package iuh.fit.elearning.chatbot.llm;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Thử nhà cung cấp chính; nếu lỗi (hết hạn mức, quá tải...) thì chuyển sang nhà cung cấp dự phòng. */
public class FallbackLlmClient implements LlmClient {

    private static final Logger log = LoggerFactory.getLogger(FallbackLlmClient.class);

    private final LlmClient primary;
    private final LlmClient fallback;

    public FallbackLlmClient(LlmClient primary, LlmClient fallback) {
        this.primary = primary;
        this.fallback = fallback;
    }

    @Override
    public String name() {
        return primary.name() + " -> " + fallback.name();
    }

    @Override
    public LlmResponse generate(LlmRequest request) {
        try {
            return primary.generate(request);
        } catch (LlmException e) {
            log.warn("Nhà cung cấp AI chính {} lỗi ({}), chuyển sang {}", primary.name(), e.getKind(), fallback.name());
            return fallback.generate(request);
        }
    }
}

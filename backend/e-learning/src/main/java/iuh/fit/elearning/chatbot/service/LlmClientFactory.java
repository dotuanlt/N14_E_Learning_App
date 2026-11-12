package iuh.fit.elearning.chatbot.service;

import iuh.fit.elearning.chatbot.llm.FallbackLlmClient;
import iuh.fit.elearning.chatbot.llm.GeminiLlmClient;
import iuh.fit.elearning.chatbot.llm.LlmClient;
import iuh.fit.elearning.chatbot.llm.MockLlmClient;
import iuh.fit.elearning.chatbot.llm.OpenAiCompatibleLlmClient;
import iuh.fit.elearning.config.ChatProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Locale;

/**
 * Chọn nhà cung cấp AI theo app.chat.provider (giống cách chọn OtpStore / PaymentGateway).
 * Thiếu khóa API thì tự dùng bản giả lập để ứng dụng vẫn khởi động được.
 */
@Configuration
public class LlmClientFactory {

    private static final Logger log = LoggerFactory.getLogger(LlmClientFactory.class);

    @Bean
    public LlmClient llmClient(ChatProperties props) {
        LlmClient primary = create(props.provider(), props);
        String fb = props.fallbackProvider();
        if (fb != null && !fb.isBlank() && !fb.equalsIgnoreCase(props.provider())) {
            LlmClient fallback = create(fb, props);
            if (!(fallback instanceof MockLlmClient)) {
                log.info("Trợ lý AI: {} (dự phòng: {})", primary.name(), fallback.name());
                return new FallbackLlmClient(primary, fallback);
            }
        }
        log.info("Trợ lý AI: {}", primary.name());
        return primary;
    }

    private LlmClient create(String provider, ChatProperties props) {
        String p = provider == null ? "mock" : provider.trim().toLowerCase(Locale.ROOT);
        switch (p) {
            case "gemini": {
                ChatProperties.Provider g = props.gemini();
                if (g == null || !g.hasKey()) {
                    log.warn("app.chat.provider=gemini nhưng chưa có GEMINI_API_KEY -> dùng bản giả lập");
                    return new MockLlmClient();
                }
                return new GeminiLlmClient(g.baseUrl(), g.apiKey(), g.model(), props.temperature(),
                        props.maxOutputTokens(), props.timeout());
            }
            case "openai": {
                ChatProperties.Provider o = props.openai();
                if (o == null || !o.hasKey()) {
                    log.warn("app.chat.provider=openai nhưng chưa có khóa API (GROQ_API_KEY) -> dùng bản giả lập");
                    return new MockLlmClient();
                }
                return new OpenAiCompatibleLlmClient(o.baseUrl(), o.apiKey(), o.model(), props.temperature(),
                        props.maxOutputTokens(), props.timeout());
            }
            default:
                return new MockLlmClient();
        }
    }
}

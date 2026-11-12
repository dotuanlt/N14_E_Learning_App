package iuh.fit.elearning.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

/**
 * app.chat.*: cấu hình trợ lý AI.
 * provider / fallbackProvider: mock | gemini | openai (openai = mọi API chuẩn OpenAI như Groq, OpenRouter).
 */
@ConfigurationProperties(prefix = "app.chat")
public record ChatProperties(
        String provider,
        String fallbackProvider,
        int maxMessageLength,
        int historyMessages,
        int maxToolRounds,
        int rateLimitPerHour,
        int maxOutputTokens,
        double temperature,
        Duration timeout,
        Provider gemini,
        Provider openai
) {

    public record Provider(String apiKey, String model, String baseUrl) {
        public boolean hasKey() {
            return apiKey != null && !apiKey.isBlank();
        }
    }
}

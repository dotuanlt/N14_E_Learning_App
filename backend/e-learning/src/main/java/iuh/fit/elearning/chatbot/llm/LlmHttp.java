package iuh.fit.elearning.chatbot.llm;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpTimeoutException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/** Gọi HTTP POST JSON bằng HttpClient của JDK và quy đổi mã lỗi thành {@link LlmException}. */
final class LlmHttp {

    private final HttpClient client;
    private final Duration timeout;

    LlmHttp(Duration timeout) {
        this.timeout = timeout;
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    String postJson(String url, Map<String, String> headers, String body) {
        HttpRequest.Builder builder = HttpRequest.newBuilder(URI.create(url))
                .timeout(timeout)
                .header("Content-Type", "application/json; charset=utf-8")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8));
        headers.forEach(builder::header);
        try {
            HttpResponse<String> response = client.send(builder.build(),
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            int status = response.statusCode();
            if (status >= 200 && status < 300) {
                return response.body();
            }
            throw fromStatus(status, response.body());
        } catch (HttpTimeoutException e) {
            throw new LlmException(LlmException.Kind.UNAVAILABLE, "Nhà cung cấp AI phản hồi quá chậm", e);
        } catch (IOException e) {
            throw new LlmException(LlmException.Kind.UNAVAILABLE, "Không kết nối được nhà cung cấp AI", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new LlmException(LlmException.Kind.UNAVAILABLE, "Yêu cầu AI bị gián đoạn", e);
        }
    }

    private static LlmException fromStatus(int status, String body) {
        LlmException.Kind kind;
        if (status == 429) {
            kind = LlmException.Kind.RATE_LIMITED;
        } else if (status == 401 || status == 403) {
            kind = LlmException.Kind.AUTH;
        } else if (status >= 500) {
            kind = LlmException.Kind.UNAVAILABLE;
        } else {
            kind = LlmException.Kind.BAD_REQUEST;
        }
        String snippet = body == null ? "" : body.replaceAll("\\s+", " ");
        if (snippet.length() > 300) {
            snippet = snippet.substring(0, 300) + "...";
        }
        return new LlmException(kind, status, "Nhà cung cấp AI trả về HTTP " + status + ": " + snippet);
    }
}

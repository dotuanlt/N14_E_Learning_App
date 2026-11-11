package iuh.fit.elearning.auth.service;

import iuh.fit.elearning.auth.dto.request.GoogleExchangeRequest;
import iuh.fit.elearning.auth.dto.response.AuthResponse;
import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * Hỗ trợ đăng nhập / đăng ký bằng Google OAuth 2.0:
 * - Khi đã cấu hình GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET: chuyển hướng tới Google OAuth thật.
 * - Khi chưa cấu hình (môi trường dev LAN / Expo Go): hiển thị trang chọn tài khoản Google mô phỏng.
 */
@Slf4j
@Service
public class GoogleAuthService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final long STATE_TTL_SECONDS = 300;
    private static final long CODE_TTL_SECONDS = 120;

    private record PendingState(String redirectUri, Instant expiresAt) {
        boolean expired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    private record PendingExchange(UUID userId, Instant expiresAt) {
        boolean expired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    public record StartResult(String redirectUrl, String html) {
        public boolean isRedirect() {
            return redirectUrl != null;
        }
    }

    private final AuthService authService;
    private final String clientId;
    private final String clientSecret;
    private final String googleRedirectUri;
    private final RestClient restClient = RestClient.create();

    private final Map<String, PendingState> pendingStates = new ConcurrentHashMap<>();
    private final Map<String, PendingExchange> pendingCodes = new ConcurrentHashMap<>();

    public GoogleAuthService(AuthService authService,
                             @Value("${app.google.client-id:}") String clientId,
                             @Value("${app.google.client-secret:}") String clientSecret,
                             @Value("${app.google.redirect-uri:}") String googleRedirectUri) {
        this.authService = authService;
        this.clientId = clientId == null ? "" : clientId.trim();
        this.clientSecret = clientSecret == null ? "" : clientSecret.trim();
        this.googleRedirectUri = googleRedirectUri == null ? "" : googleRedirectUri.trim();
    }

    public boolean isConfigured() {
        return !clientId.isBlank() && !clientSecret.isBlank() && !googleRedirectUri.isBlank();
    }

    public StartResult start(String appRedirectUri) {
        cleanupExpired();
        String safeRedirect = validateAppRedirectUri(appRedirectUri);
        String state = randomToken();
        pendingStates.put(state, new PendingState(safeRedirect, Instant.now().plusSeconds(STATE_TTL_SECONDS)));

        if (isConfigured()) {
            String authUrl = UriComponentsBuilder.fromUriString("https://accounts.google.com/o/oauth2/v2/auth")
                    .queryParam("client_id", clientId)
                    .queryParam("redirect_uri", googleRedirectUri)
                    .queryParam("response_type", "code")
                    .queryParam("scope", "openid email profile")
                    .queryParam("state", state)
                    .queryParam("prompt", "select_account")
                    .build()
                    .toUriString();
            return new StartResult(authUrl, null);
        }

        return new StartResult(null, renderDevPickerHtml(state, null));
    }

    public String handleGoogleCallback(String code, String state, String error) {
        PendingState pending = consumeState(state);
        if (error != null && !error.isBlank()) {
            return appendQueryParam(pending.redirectUri(), "error", "Đăng nhập Google đã bị hủy (" + error + ")");
        }
        if (code == null || code.isBlank() || !isConfigured()) {
            return appendQueryParam(pending.redirectUri(), "error", "Thiếu mã xác thực từ Google");
        }

        try {
            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("code", code);
            form.add("client_id", clientId);
            form.add("client_secret", clientSecret);
            form.add("redirect_uri", googleRedirectUri);
            form.add("grant_type", "authorization_code");

            Map<?, ?> tokenBody = restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(Map.class);

            String accessToken = tokenBody == null ? null : asString(tokenBody.get("access_token"));
            if (accessToken == null || accessToken.isBlank()) {
                return appendQueryParam(pending.redirectUri(), "error", "Không lấy được access token từ Google");
            }

            Map<?, ?> userInfo = restClient.get()
                    .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(Map.class);

            String email = userInfo == null ? null : asString(userInfo.get("email"));
            String name = userInfo == null ? null : asString(userInfo.get("name"));
            String picture = userInfo == null ? null : asString(userInfo.get("picture"));

            User user = authService.loginOrRegisterWithGoogle(email, name, picture);
            String exchangeCode = issueExchangeCode(user.getId());
            return appendQueryParam(pending.redirectUri(), "code", exchangeCode);
        } catch (BusinessException ex) {
            return appendQueryParam(pending.redirectUri(), "error", ex.getMessage());
        } catch (Exception ex) {
            log.error("Google OAuth callback thất bại", ex);
            return appendQueryParam(pending.redirectUri(), "error", "Xác thực Google thất bại, vui lòng thử lại");
        }
    }

    public StartResult handleMockConsent(String state, String email, String fullName) {
        PendingState pending = pendingStates.get(state);
        if (pending == null || pending.expired()) {
            throw BusinessException.badRequest("Phiên đăng nhập Google đã hết hạn, vui lòng thử lại");
        }

        String normalizedEmail = email == null ? "" : email.trim().toLowerCase();
        if (!EMAIL_PATTERN.matcher(normalizedEmail).matches()) {
            return new StartResult(null, renderDevPickerHtml(state, "Vui lòng nhập địa chỉ email Google hợp lệ."));
        }

        try {
            User user = authService.loginOrRegisterWithGoogle(normalizedEmail, fullName, null);
            pendingStates.remove(state);
            String exchangeCode = issueExchangeCode(user.getId());
            return new StartResult(appendQueryParam(pending.redirectUri(), "code", exchangeCode), null);
        } catch (BusinessException ex) {
            pendingStates.remove(state);
            return new StartResult(appendQueryParam(pending.redirectUri(), "error", ex.getMessage()), null);
        }
    }

    public AuthResponse exchange(GoogleExchangeRequest request) {
        cleanupExpired();
        PendingExchange pending = pendingCodes.remove(request.code().trim());
        if (pending == null || pending.expired()) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED, "Mã đăng nhập Google đã hết hạn hoặc không hợp lệ");
        }
        return authService.issueTokensForUser(pending.userId(), request.fcmToken(), request.deviceInfo());
    }

    private PendingState consumeState(String state) {
        if (state == null || state.isBlank()) {
            throw BusinessException.badRequest("Thiếu tham số state");
        }
        PendingState pending = pendingStates.remove(state);
        if (pending == null || pending.expired()) {
            throw BusinessException.badRequest("Phiên đăng nhập Google đã hết hạn, vui lòng thử lại");
        }
        return pending;
    }

    private String issueExchangeCode(UUID userId) {
        String code = randomToken();
        pendingCodes.put(code, new PendingExchange(userId, Instant.now().plusSeconds(CODE_TTL_SECONDS)));
        return code;
    }

    private static String validateAppRedirectUri(String redirectUri) {
        if (redirectUri == null || redirectUri.isBlank()) {
            throw BusinessException.badRequest("Thiếu redirectUri");
        }
        String trimmed = redirectUri.trim();
        String lower = trimmed.toLowerCase();
        if (lower.startsWith("exp://")
                || lower.startsWith("elearning://")
                || lower.startsWith("http://")
                || lower.startsWith("https://")) {
            return trimmed;
        }
        throw BusinessException.badRequest("redirectUri không hợp lệ");
    }

    private static String appendQueryParam(String baseUrl, String key, String value) {
        String sep = baseUrl.contains("?") ? "&" : "?";
        return baseUrl + sep + URLEncoder.encode(key, StandardCharsets.UTF_8)
                + "=" + URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String randomToken() {
        byte[] bytes = new byte[24];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String asString(Object obj) {
        return obj == null ? null : String.valueOf(obj);
    }

    private void cleanupExpired() {
        pendingStates.entrySet().removeIf(e -> e.getValue().expired());
        pendingCodes.entrySet().removeIf(e -> e.getValue().expired());
    }

    private static String escapeHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }

    private static String renderDevPickerHtml(String state, String errorMessage) {
        String errBlock = (errorMessage == null || errorMessage.isBlank())
                ? ""
                : "<div class=\"err\">" + escapeHtml(errorMessage) + "</div>";
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                  <meta charset="UTF-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                  <title>Đăng nhập bằng Google</title>
                  <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f1f5f9; margin: 0; padding: 24px 16px; color: #0f172a; }
                    .card { max-width: 420px; margin: 20px auto; background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 8px 28px rgba(15, 23, 42, .08); }
                    .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 18px; margin-bottom: 6px; }
                    .sub { color: #64748b; font-size: 14px; margin: 0 0 18px; line-height: 1.45; }
                    .err { background: #fee2e2; color: #b91c1c; padding: 10px 12px; border-radius: 10px; font-size: 13px; margin-bottom: 14px; }
                    .quick-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 18px; }
                    .quick-btn { display: flex; align-items: center; gap: 12px; width: 100%%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fff; cursor: pointer; text-align: left; }
                    .quick-btn:hover { background: #f8fafc; border-color: #cbd5e1; }
                    .avatar { width: 38px; height: 38px; border-radius: 999px; background: #4285F4; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0; }
                    .q-name { font-weight: 600; font-size: 14px; color: #0f172a; }
                    .q-email { font-size: 12px; color: #64748b; }
                    .divider { text-align: center; font-size: 12px; color: #94a3b8; margin: 14px 0; }
                    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; }
                    input { width: 100%%; box-sizing: border-box; padding: 11px 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 14px; margin-bottom: 12px; }
                    .submit { width: 100%%; padding: 12px; border: none; border-radius: 10px; background: #1a73e8; color: #fff; font-weight: 700; font-size: 15px; cursor: pointer; }
                    .note { margin-top: 14px; font-size: 12px; color: #64748b; line-height: 1.45; }
                  </style>
                </head>
                <body>
                  <div class="card">
                    <div class="logo">
                      <svg width="22" height="22" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.7-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1C3.3 21.3 7.3 24 12 24z"/><path fill="#FBBC05" d="M5.3 14.3c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3V6.6H1.3C.5 8.2 0 10 0 12s.5 3.8 1.3 5.4l4-3.1z"/><path fill="#EA4335" d="M12 4.7c1.8 0 3.3.6 4.6 1.8l3.4-3.4C17.9 1.2 15.2 0 12 0 7.3 0 3.3 2.7 1.3 6.6l4 3.1c.9-2.9 3.6-5 6.7-5z"/></svg>
                      <span>Tiếp tục với Google</span>
                    </div>
                    <p class="sub">Chọn tài khoản Google để đăng nhập vào <b>E-Learning</b>.</p>
                    %s
                    <div class="quick-list">
                      <form method="post" action="/api/v1/auth/google/mock-consent">
                        <input type="hidden" name="state" value="%s" />
                        <input type="hidden" name="email" value="hocvien.google@gmail.com" />
                        <input type="hidden" name="fullName" value="Nguyễn Minh Tuấn" />
                        <button type="submit" class="quick-btn">
                          <div class="avatar">MT</div>
                          <div>
                            <div class="q-name">Nguyễn Minh Tuấn</div>
                            <div class="q-email">hocvien.google@gmail.com</div>
                          </div>
                        </button>
                      </form>
                    </div>
                    <div class="divider">hoặc nhập tài khoản Google khác</div>
                    <form method="post" action="/api/v1/auth/google/mock-consent">
                      <input type="hidden" name="state" value="%s" />
                      <label>Email Google</label>
                      <input type="email" name="email" placeholder="example@gmail.com" required />
                      <label>Họ và tên</label>
                      <input type="text" name="fullName" placeholder="Tên hiển thị" />
                      <button type="submit" class="submit">Tiếp tục</button>
                    </form>
                    <p class="note">Chế độ dev: điền GOOGLE_CLIENT_ID &amp; GOOGLE_CLIENT_SECRET trong .env để chuyển sang màn hình Google OAuth thật.</p>
                  </div>
                </body>
                </html>
                """.formatted(errBlock, escapeHtml(state), escapeHtml(state));
    }
}

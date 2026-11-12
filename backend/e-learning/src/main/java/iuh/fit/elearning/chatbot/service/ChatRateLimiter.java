package iuh.fit.elearning.chatbot.service;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.config.ChatProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Giới hạn số tin nhắn mỗi người dùng trong một giờ (cửa sổ trượt, lưu trong bộ nhớ). Bảo vệ hạn mức miễn phí
 * của nhà cung cấp AI và tránh lạm dụng. Chạy nhiều instance backend thì chuyển sang Redis.
 */
@Component
public class ChatRateLimiter {

    private final int limit;
    private final Duration window;
    private final Clock clock;
    private final Map<UUID, Deque<Instant>> hits = new ConcurrentHashMap<>();

    @Autowired
    public ChatRateLimiter(ChatProperties props) {
        this(props.rateLimitPerHour(), Duration.ofHours(1), Clock.systemUTC());
    }

    ChatRateLimiter(int limit, Duration window, Clock clock) {
        this.limit = limit;
        this.window = window;
        this.clock = clock;
    }

    /** Ghi nhận một tin nhắn; ném TOO_MANY_ATTEMPTS khi vượt giới hạn. limit <= 0 nghĩa là không giới hạn. */
    public void acquire(UUID userId) {
        if (limit <= 0) {
            return;
        }
        Instant now = clock.instant();
        Deque<Instant> deque = hits.computeIfAbsent(userId, k -> new ArrayDeque<>());
        synchronized (deque) {
            Instant cutoff = now.minus(window);
            while (!deque.isEmpty() && deque.peekFirst().isBefore(cutoff)) {
                deque.pollFirst();
            }
            if (deque.size() >= limit) {
                long minutes = Math.max(1, Duration.between(now, deque.peekFirst().plus(window)).toMinutes() + 1);
                throw new BusinessException(ErrorCode.TOO_MANY_ATTEMPTS,
                        "Bạn đã hỏi quá nhiều trong một giờ. Vui lòng thử lại sau khoảng " + minutes + " phút.");
            }
            deque.addLast(now);
        }
        if (hits.size() > 10_000) { // dọn người dùng không còn hoạt động
            Instant cutoff = now.minus(window);
            hits.entrySet().removeIf(e -> {
                synchronized (e.getValue()) {
                    return e.getValue().isEmpty() || e.getValue().peekLast().isBefore(cutoff);
                }
            });
        }
    }
}

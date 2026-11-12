package iuh.fit.elearning.chatbot.service;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ChatRateLimiterTest {

    private static final class MutableClock extends Clock {
        Instant now = Instant.parse("2026-11-12T00:00:00Z");

        @Override public java.time.ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(java.time.ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    @Test
    void blocksAfterLimitAndRecoversAfterWindow() {
        MutableClock clock = new MutableClock();
        ChatRateLimiter limiter = new ChatRateLimiter(2, Duration.ofHours(1), clock);
        UUID user = UUID.randomUUID();

        limiter.acquire(user);
        limiter.acquire(user);
        BusinessException ex = assertThrows(BusinessException.class, () -> limiter.acquire(user));
        assertEquals(ErrorCode.TOO_MANY_ATTEMPTS, ex.getErrorCode());

        clock.now = clock.now.plus(Duration.ofHours(1)).plusSeconds(1);
        assertDoesNotThrow(() -> limiter.acquire(user));
    }

    @Test
    void usersAreIndependentAndZeroMeansUnlimited() {
        ChatRateLimiter limiter = new ChatRateLimiter(1, Duration.ofHours(1), new MutableClock());
        limiter.acquire(UUID.randomUUID());
        assertDoesNotThrow(() -> limiter.acquire(UUID.randomUUID()));

        ChatRateLimiter unlimited = new ChatRateLimiter(0, Duration.ofHours(1), new MutableClock());
        UUID u = UUID.randomUUID();
        for (int i = 0; i < 100; i++) {
            unlimited.acquire(u);
        }
    }
}

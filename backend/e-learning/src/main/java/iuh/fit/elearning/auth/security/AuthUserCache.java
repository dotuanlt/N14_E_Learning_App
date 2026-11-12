package iuh.fit.elearning.auth.security;

import iuh.fit.elearning.user.entity.User;
import iuh.fit.elearning.user.entity.enums.UserRole;
import iuh.fit.elearning.user.entity.enums.UserStatus;
import iuh.fit.elearning.user.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Bộ nhớ đệm ngắn hạn (30 giây) cho thông tin xác thực của người dùng.
 * <p>
 * Trước đây bộ lọc JWT truy vấn bảng users ở MỖI request. Khi CSDL ở xa (ví dụ Neon ở Mỹ, ~250 ms/lượt) thì mọi API
 * đều bị cộng thêm một lượt đó. Cache giúp mỗi người dùng chỉ truy vấn tối đa 1 lần / 30 giây.
 * Khóa tài khoản / đổi vai trò / xóa gọi {@link #evict(UUID)} nên có hiệu lực ngay trên instance này.
 */
@Component
public class AuthUserCache {

    /** Bản sao nhỏ của những trường bộ lọc cần. */
    public record Snapshot(UUID id, String email, UserRole role, UserStatus status) {
    }

    private record Entry(Snapshot snapshot, long expiresAtNanos) {
    }

    private static final long TTL_NANOS = 30_000_000_000L;
    private static final int MAX_ENTRIES = 10_000;

    private final UserRepository userRepository;
    private final ConcurrentHashMap<UUID, Entry> cache = new ConcurrentHashMap<>();

    public AuthUserCache(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /** Trả về thông tin người dùng (từ cache nếu còn hạn), rỗng nếu không tồn tại. */
    public Optional<Snapshot> find(UUID userId) {
        long now = System.nanoTime();
        Entry e = cache.get(userId);
        if (e != null && e.expiresAtNanos() - now > 0) {
            return Optional.of(e.snapshot());
        }
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            cache.remove(userId);
            return Optional.empty();
        }
        if (cache.size() >= MAX_ENTRIES) {
            cache.clear(); // đơn giản, tránh phình bộ nhớ; sẽ được nạp lại dần
        }
        User u = user.get();
        Snapshot snapshot = new Snapshot(u.getId(), u.getEmail(), u.getRole(), u.getStatus());
        cache.put(userId, new Entry(snapshot, now + TTL_NANOS));
        return Optional.of(snapshot);
    }

    public void evict(UUID userId) {
        cache.remove(userId);
    }
}

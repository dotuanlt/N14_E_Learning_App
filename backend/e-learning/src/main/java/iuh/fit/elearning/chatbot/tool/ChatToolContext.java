package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.auth.security.AuthUser;

import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

/**
 * Ngữ cảnh một lượt chat. user luôn lấy từ JWT của request (KHÔNG lấy từ tham số do mô hình sinh ra), nên mô hình
 * không thể xem dữ liệu của người khác. referencedCourseIds: các khóa học bot đã tra cứu, dùng để hiện thẻ khóa học.
 */
public final class ChatToolContext {

    private final AuthUser user;
    private final UUID contextCourseId;
    private final Set<UUID> referencedCourseIds = new LinkedHashSet<>();

    public ChatToolContext(AuthUser user, UUID contextCourseId) {
        this.user = user;
        this.contextCourseId = contextCourseId;
    }

    public AuthUser user() {
        return user;
    }

    public UUID contextCourseId() {
        return contextCourseId;
    }

    /** Có thể được gọi đồng thời từ nhiều hàm chạy song song nên cần synchronized. */
    public synchronized void reference(UUID courseId) {
        if (courseId != null) {
            referencedCourseIds.add(courseId);
        }
    }

    public synchronized Set<UUID> referencedCourseIds() {
        return new LinkedHashSet<>(referencedCourseIds);
    }
}

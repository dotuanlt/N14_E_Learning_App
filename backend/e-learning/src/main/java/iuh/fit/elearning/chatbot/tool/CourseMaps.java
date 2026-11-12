package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.course.dto.response.CourseSummaryResponse;

import java.util.LinkedHashMap;
import java.util.Map;

/** Rút gọn dữ liệu khóa học thành Map nhỏ gọn để tiết kiệm token. */
final class CourseMaps {

    private CourseMaps() {
    }

    static Map<String, Object> summary(CourseSummaryResponse c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("course_id", c.id());
        m.put("title", c.title());
        if (c.instructor() != null) {
            m.put("instructor", c.instructor().fullName());
        }
        if (c.category() != null) {
            m.put("category", c.category().name());
        }
        m.put("level", c.level());
        m.put("price_vnd", c.salePrice());
        m.put("original_price_vnd", c.originalPrice());
        m.put("rating", c.avgRating());
        m.put("review_count", c.reviewCount());
        m.put("student_count", c.studentCount());
        m.put("total_lessons", c.totalLessons());
        m.put("duration_minutes", c.totalDurationSeconds() / 60);
        m.put("best_seller", c.bestSeller());
        if (c.owned() != null) {
            m.put("already_owned_by_user", c.owned());
        }
        return m;
    }
}

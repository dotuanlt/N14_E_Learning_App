package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.course.dto.response.BenefitResponse;
import iuh.fit.elearning.course.dto.response.CourseDetailResponse;
import iuh.fit.elearning.course.service.CourseService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class GetCourseDetailTool implements ChatTool {

    private final CourseService courseService;

    public GetCourseDetailTool(CourseService courseService) {
        this.courseService = courseService;
    }

    @Override
    public String name() {
        return "get_course_detail";
    }

    @Override
    public String description() {
        return "Xem chi tiết một khóa học: mô tả, lợi ích, giảng viên, giá, đánh giá, tiến độ của người dùng nếu đã mua. "
                + "Bỏ trống course_id để dùng khóa học đang xem (nếu có).";
    }

    @Override
    public Map<String, Object> parameters() {
        return ToolArgs.schema(new String[][]{
                {"course_id", "string", "UUID khóa học"}
        });
    }

    @Override
    public Object execute(ChatToolContext ctx, Map<String, Object> args) {
        UUID id = ToolArgs.uuid(args, "course_id");
        if (id == null) {
            id = ctx.contextCourseId();
        }
        if (id == null) {
            throw BusinessException.badRequest("Thiếu course_id");
        }
        CourseDetailResponse d = courseService.detail(id, ctx.user());
        ctx.reference(d.id());

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("course_id", d.id());
        m.put("title", d.title());
        m.put("description", ToolArgs.truncate(d.description(), 900));
        m.put("category", d.category() == null ? null : d.category().name());
        m.put("level", d.level());
        m.put("price_vnd", d.salePrice());
        m.put("original_price_vnd", d.originalPrice());
        m.put("discount_percent", d.discountPercent());
        m.put("rating", d.avgRating());
        m.put("review_count", d.reviewCount());
        m.put("student_count", d.studentCount());
        m.put("total_lessons", d.totalLessons());
        m.put("duration_minutes", d.totalDurationSeconds() / 60);
        List<String> benefits = d.benefits() == null ? List.of()
                : d.benefits().stream().map(BenefitResponse::content).limit(8).toList();
        m.put("benefits", benefits);
        if (d.instructor() != null) {
            m.put("instructor", d.instructor().fullName());
            m.put("instructor_title", d.instructor().jobTitle());
            m.put("instructor_expertise", d.instructor().expertise());
        }
        if (d.owned() != null) {
            m.put("user_owns_course", d.owned());
            if (Boolean.TRUE.equals(d.owned())) {
                m.put("user_progress_percent", d.progressPercentage());
                m.put("user_enrollment_status", d.enrollmentStatus());
            } else {
                m.put("in_user_cart", d.inCart());
            }
        }
        return m;
    }
}

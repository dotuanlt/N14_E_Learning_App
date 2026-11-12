package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.course.dto.response.CurriculumResponse;
import iuh.fit.elearning.course.dto.response.LessonResponse;
import iuh.fit.elearning.course.dto.response.SectionResponse;
import iuh.fit.elearning.course.service.CourseService;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
public class GetCourseCurriculumTool implements ChatTool {

    private static final int MAX_LESSONS = 60;

    private final CourseService courseService;

    public GetCourseCurriculumTool(CourseService courseService) {
        this.courseService = courseService;
    }

    @Override
    public String name() {
        return "get_course_curriculum";
    }

    @Override
    public String description() {
        return "Xem mục lục khóa học (các chương và tên bài học, thời lượng, bài học thử, bài đã hoàn thành). "
                + "Dùng để trả lời 'khóa này học những gì', gợi ý bài tiếp theo hoặc lộ trình. Bỏ trống course_id "
                + "để dùng khóa học đang xem.";
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
        CurriculumResponse c = courseService.curriculum(id, ctx.user());
        ctx.reference(id);

        int budget = MAX_LESSONS;
        List<Object> sections = new ArrayList<>();
        for (SectionResponse s : c.sections()) {
            List<Object> lessons = new ArrayList<>();
            for (LessonResponse l : s.lessons()) {
                if (budget-- <= 0) {
                    break;
                }
                Map<String, Object> lm = new LinkedHashMap<>();
                lm.put("title", l.title());
                lm.put("minutes", Math.max(1, l.durationSeconds() / 60));
                if (l.preview()) {
                    lm.put("free_preview", true);
                }
                if (l.completed() != null) {
                    lm.put("completed", l.completed());
                }
                lessons.add(lm);
            }
            Map<String, Object> sm = new LinkedHashMap<>();
            sm.put("section", s.title());
            sm.put("lessons", lessons);
            sections.add(sm);
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total_sections", c.totalSections());
        out.put("total_lessons", c.totalLessons());
        out.put("total_minutes", c.totalDurationSeconds() / 60);
        out.put("sections", sections);
        if (c.totalLessons() > MAX_LESSONS) {
            out.put("note", "Chỉ liệt kê " + MAX_LESSONS + " bài đầu tiên.");
        }
        return out;
    }
}

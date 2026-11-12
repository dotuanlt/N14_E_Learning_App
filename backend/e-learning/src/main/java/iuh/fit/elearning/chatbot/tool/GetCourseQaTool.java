package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.course.service.CourseService;
import iuh.fit.elearning.interaction.entity.QaComment;
import iuh.fit.elearning.interaction.entity.QaPost;
import iuh.fit.elearning.interaction.repository.QaCommentRepository;
import iuh.fit.elearning.interaction.repository.QaPostRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Các câu hỏi đã được giảng viên trả lời trong khu Hỏi đáp của khóa học - nguồn tham khảo cho vai trò trợ giảng. */
@Component
public class GetCourseQaTool implements ChatTool {

    private static final int MAX_POSTS = 5;

    private final CourseService courseService;
    private final QaPostRepository postRepository;
    private final QaCommentRepository commentRepository;

    public GetCourseQaTool(CourseService courseService, QaPostRepository postRepository,
                           QaCommentRepository commentRepository) {
        this.courseService = courseService;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
    }

    @Override
    public String name() {
        return "get_course_qa";
    }

    @Override
    public String description() {
        return "Lấy các câu hỏi gần đây đã được giảng viên trả lời trong mục Hỏi đáp của khóa học. Dùng khi học viên hỏi "
                + "về nội dung khóa học để xem giảng viên đã giải đáp chưa. Bỏ trống course_id để dùng khóa đang xem.";
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
        courseService.requireViewable(id, ctx.user()); // cùng quyền xem với API Hỏi đáp công khai
        List<QaPost> posts = postRepository
                .findByCourseIdAndHiddenFalseAndDeletedAtIsNullOrderByCreatedAtDesc(id, PageRequest.of(0, 30))
                .getContent();
        List<Object> items = new ArrayList<>();
        for (QaPost p : posts) {
            if (items.size() >= MAX_POSTS) {
                break;
            }
            if (!Boolean.TRUE.equals(p.getAnswered())) {
                continue;
            }
            String answer = commentRepository.findByPostIdAndDeletedAtIsNullOrderByCreatedAtAsc(p.getId()).stream()
                    .filter(c -> Boolean.TRUE.equals(c.getInstructorAnswer()))
                    .map(QaComment::getContent).findFirst().orElse(null);
            if (answer == null) {
                continue;
            }
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("question", ToolArgs.truncate(p.getContent(), 400));
            m.put("instructor_answer", ToolArgs.truncate(answer, 600));
            items.add(m);
        }
        ctx.reference(id);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("answered_questions", items);
        if (items.isEmpty()) {
            out.put("hint", "Chưa có câu hỏi nào được giảng viên trả lời. Hãy trả lời từ kiến thức chung và gợi ý học viên đăng câu hỏi ở tab Hỏi đáp.");
        }
        return out;
    }
}

package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.learning.dto.response.EnrollmentResponse;
import iuh.fit.elearning.learning.service.LearningService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

/** Các khóa người dùng đã mua / đang học và tiến độ - chỉ của chính người đang chat (lấy từ JWT). */
@Component
public class GetMyLearningTool implements ChatTool {

    private static final int LIMIT = 10;

    private final LearningService learningService;

    public GetMyLearningTool(LearningService learningService) {
        this.learningService = learningService;
    }

    @Override
    public String name() {
        return "get_my_learning";
    }

    @Override
    public String description() {
        return "Lấy danh sách khóa học của chính người dùng (đang học/đã hoàn thành), % tiến độ, chứng chỉ, lần học gần "
                + "nhất. Dùng để gợi ý lộ trình, nhắc học tiếp, hoặc khi người dùng hỏi về tiến độ của mình.";
    }

    @Override
    public Map<String, Object> parameters() {
        return ToolArgs.schema(new String[][]{
                {"status", "string", "ALL | ONGOING | COMPLETED (mặc định ALL)"}
        });
    }

    @Override
    public Object execute(ChatToolContext ctx, Map<String, Object> args) {
        String status = ToolArgs.string(args, "status");
        status = status == null ? "ALL" : status.toUpperCase(Locale.ROOT);
        if (!status.equals("ONGOING") && !status.equals("COMPLETED")) {
            status = "ALL";
        }
        List<EnrollmentResponse> list = learningService.myEnrollments(ctx.user().id(), status);
        List<Map<String, Object>> items = list.stream().limit(LIMIT).map(e -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("course_id", e.course().id());
            m.put("title", e.course().title());
            m.put("progress_percent", e.progressPercentage());
            m.put("status", e.status());
            m.put("last_accessed_at", e.lastAccessedAt());
            m.put("certificate_code", e.certificateCode());
            m.put("refund_eligible", e.refundEligible());
            return m;
        }).toList();
        list.stream().limit(LIMIT).forEach(e -> ctx.reference(e.course().id()));
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total", list.size());
        out.put("enrollments", items);
        return out;
    }
}

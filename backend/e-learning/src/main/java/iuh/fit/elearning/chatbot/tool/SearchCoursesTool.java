package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.common.response.PageResponse;
import iuh.fit.elearning.course.dto.response.CourseSummaryResponse;
import iuh.fit.elearning.course.entity.enums.CourseLevel;
import iuh.fit.elearning.course.service.CourseSearchCriteria;
import iuh.fit.elearning.course.service.CourseService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

/** Tìm khóa học đang mở bán theo từ khóa / danh mục / giá / đánh giá / trình độ. */
@Component
public class SearchCoursesTool implements ChatTool {

    private static final int LIMIT = 5;
    private static final Set<String> SORTS = Set.of("popular", "newest", "rating", "price_asc", "price_desc");

    private final CourseService courseService;

    public SearchCoursesTool(CourseService courseService) {
        this.courseService = courseService;
    }

    @Override
    public String name() {
        return "search_courses";
    }

    @Override
    public String description() {
        return "Tìm khóa học đang mở bán trong hệ thống. Dùng khi người dùng muốn tìm/chọn/so sánh khóa học. "
                + "keyword nên ngắn (1-3 từ như 'java', 'thiết kế', 'tiếng anh'). "
                + "Trả về tối đa 5 khóa học kèm giá, đánh giá, trình độ.";
    }

    @Override
    public Map<String, Object> parameters() {
        return ToolArgs.schema(new String[][]{
                {"keyword", "string", "Từ khóa ngắn khớp tiêu đề, mô tả, giảng viên, danh mục hoặc chủ đề"},
                {"category_id", "string", "UUID danh mục lấy từ list_categories"},
                {"max_price", "number", "Giá tối đa (VND)"},
                {"min_rating", "number", "Điểm đánh giá tối thiểu (0-5)"},
                {"level", "string", "BEGINNER | INTERMEDIATE | ADVANCED"},
                {"sort", "string", "popular | newest | rating | price_asc | price_desc"}
        });
    }

    @Override
    public Object execute(ChatToolContext ctx, Map<String, Object> args) {
        CourseLevel level = null;
        String levelArg = ToolArgs.string(args, "level");
        if (levelArg != null) {
            try {
                level = CourseLevel.valueOf(levelArg.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ignored) {
                // bỏ qua giá trị không hợp lệ
            }
        }
        String sort = ToolArgs.string(args, "sort");
        if (sort != null && !SORTS.contains(sort)) {
            sort = null;
        }
        CourseSearchCriteria criteria = new CourseSearchCriteria(
                ToolArgs.string(args, "keyword"), ToolArgs.uuid(args, "category_id"), null,
                ToolArgs.decimal(args, "max_price"), ToolArgs.decimal(args, "min_rating"), level, null, sort);

        PageResponse<CourseSummaryResponse> page = courseService.search(criteria, 0, LIMIT, ctx.user().id());
        List<Map<String, Object>> items = page.items().stream().map(CourseMaps::summary).toList();
        page.items().forEach(c -> ctx.reference(c.id()));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("total_matches", page.totalElements());
        out.put("courses", items);
        if (items.isEmpty()) {
            out.put("hint", "Không có kết quả. Hãy thử từ khóa ngắn hơn/khác, hoặc gọi list_categories rồi lọc theo category_id.");
        }
        return out;
    }
}

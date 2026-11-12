package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.catalog.dto.response.CategoryResponse;
import iuh.fit.elearning.catalog.service.CatalogService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class ListCategoriesTool implements ChatTool {

    private final CatalogService catalogService;

    public ListCategoriesTool(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @Override
    public String name() {
        return "list_categories";
    }

    @Override
    public String description() {
        return "Liệt kê các danh mục khóa học (id, tên). Dùng khi người dùng hỏi hệ thống có những lĩnh vực nào "
                + "hoặc khi cần category_id để lọc.";
    }

    @Override
    public Map<String, Object> parameters() {
        return ToolArgs.schema(new String[][]{});
    }

    @Override
    public Object execute(ChatToolContext ctx, Map<String, Object> args) {
        List<Map<String, Object>> list = catalogService.activeCategories().stream().map((CategoryResponse c) -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("category_id", c.id());
            m.put("name", c.name());
            return m;
        }).toList();
        return Map.of("categories", list);
    }
}

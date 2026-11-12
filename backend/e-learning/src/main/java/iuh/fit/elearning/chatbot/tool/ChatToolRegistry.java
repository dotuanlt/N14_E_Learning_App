package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.chatbot.llm.LlmToolCall;
import iuh.fit.elearning.chatbot.llm.LlmToolSpec;
import iuh.fit.elearning.chatbot.llm.MiniJson;
import iuh.fit.elearning.common.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Danh sách hàm cho mô hình và nơi thực thi chúng; mọi lỗi được chuyển thành JSON {"error": ...} cho mô hình. */
@Component
public class ChatToolRegistry {

    private static final Logger log = LoggerFactory.getLogger(ChatToolRegistry.class);
    private static final int MAX_RESULT_CHARS = 8000;

    private final Map<String, ChatTool> tools;
    private final List<LlmToolSpec> specs;

    public ChatToolRegistry(List<ChatTool> toolBeans) {
        this.tools = toolBeans.stream().collect(Collectors.toMap(ChatTool::name, Function.identity(),
                (a, b) -> a, LinkedHashMap::new));
        this.specs = toolBeans.stream()
                .map(t -> new LlmToolSpec(t.name(), t.description(), t.parameters())).toList();
    }

    public List<LlmToolSpec> specs() {
        return specs;
    }

    /** Thực thi một lần gọi hàm và trả về JSON dạng chuỗi (đã giới hạn độ dài). */
    public String execute(ChatToolContext ctx, LlmToolCall call) {
        ChatTool tool = tools.get(call.name());
        if (tool == null) {
            return MiniJson.write(Map.of("error", "Hàm không tồn tại: " + call.name()));
        }
        try {
            Object result = tool.execute(ctx, call.args() == null ? Map.of() : call.args());
            String json = MiniJson.write(result);
            if (json.length() > MAX_RESULT_CHARS) {
                json = MiniJson.write(Map.of("error", "Kết quả quá dài, hãy thu hẹp điều kiện tìm kiếm"));
            }
            return json;
        } catch (BusinessException e) {
            return MiniJson.write(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            log.warn("Hàm {} của trợ lý AI lỗi: {}", call.name(), e.toString());
            return MiniJson.write(Map.of("error", "Không lấy được dữ liệu lúc này"));
        }
    }
}

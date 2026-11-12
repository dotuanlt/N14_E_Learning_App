package iuh.fit.elearning.chatbot.tool;

import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@Component
public class GetPoliciesTool implements ChatTool {

    @Override
    public String name() {
        return "get_policies";
    }

    @Override
    public String description() {
        return "Lấy quy định chính thức của ứng dụng (hoàn tiền, thanh toán, mã giảm giá, chứng chỉ, tiến độ, đánh giá, "
                + "quyền truy cập, tài khoản). Luôn dùng hàm này khi trả lời về chính sách thay vì tự suy đoán.";
    }

    @Override
    public Map<String, Object> parameters() {
        return ToolArgs.schema(new String[][]{
                {"topic", "string", "refund | payment | coupon | certificate | progress | review | access | account | all"}
        });
    }

    @Override
    public Object execute(ChatToolContext ctx, Map<String, Object> args) {
        String topic = ToolArgs.string(args, "topic");
        topic = topic == null ? "all" : topic.toLowerCase(Locale.ROOT);
        Map<String, Object> out = new LinkedHashMap<>();
        if (!"all".equals(topic) && PolicyCatalog.POLICIES.containsKey(topic)) {
            out.put(topic, PolicyCatalog.POLICIES.get(topic));
        } else {
            out.putAll(PolicyCatalog.POLICIES);
        }
        return out;
    }
}

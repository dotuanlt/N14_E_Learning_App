package iuh.fit.elearning.chatbot.tool;

import java.util.Map;

/** Một hàm mà trợ lý AI được phép gọi. Chỉ đọc dữ liệu, không thay đổi dữ liệu. */
public interface ChatTool {

    String name();

    /** Mô tả bằng tiếng Anh/Việt ngắn gọn để mô hình biết khi nào nên gọi. */
    String description();

    /** JSON Schema của tham số (type = object). */
    Map<String, Object> parameters();

    /** Trả về cấu trúc JSON-hóa được (Map, List, String, số...). */
    Object execute(ChatToolContext ctx, Map<String, Object> args);
}

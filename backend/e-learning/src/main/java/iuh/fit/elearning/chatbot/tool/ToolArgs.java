package iuh.fit.elearning.chatbot.tool;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

/** Đọc tham số do mô hình sinh ra một cách an toàn (mô hình có thể gửi sai kiểu). */
final class ToolArgs {

    private ToolArgs() {
    }

    static String string(Map<String, Object> args, String key) {
        Object v = args.get(key);
        if (v == null) {
            return null;
        }
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : s;
    }

    static UUID uuid(Map<String, Object> args, String key) {
        String s = string(args, key);
        if (s == null) {
            return null;
        }
        try {
            return UUID.fromString(s);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    static BigDecimal decimal(Map<String, Object> args, String key) {
        Object v = args.get(key);
        if (v == null) {
            return null;
        }
        try {
            return new BigDecimal(String.valueOf(v).trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        String t = s.strip();
        return t.length() <= max ? t : t.substring(0, max) + "...";
    }

    /** Dựng nhanh một JSON Schema object. props: tên -> [kiểu, mô tả]. */
    static Map<String, Object> schema(String[][] props, String... required) {
        Map<String, Object> properties = new LinkedHashMap<>();
        for (String[] p : props) {
            Map<String, Object> def = new LinkedHashMap<>();
            def.put("type", p[1]);
            def.put("description", p[2]);
            properties.put(p[0], def);
        }
        Map<String, Object> schema = new LinkedHashMap<>();
        schema.put("type", "object");
        schema.put("properties", properties);
        if (required.length > 0) {
            schema.put("required", java.util.List.of(required));
        }
        return schema;
    }
}

package iuh.fit.elearning.chatbot.llm;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Bộ đọc/ghi JSON nhỏ, không phụ thuộc phiên bản Jackson (Spring Boot 4 dùng Jackson 3, jjwt dùng Jackson 2).
 * Chỉ dùng cho lớp giao tiếp với nhà cung cấp AI và kết quả của các hàm (tool).
 * Parse: object -> LinkedHashMap, array -> ArrayList, số nguyên -> Long, số thực -> Double.
 */
public final class MiniJson {

    private static final int MAX_DEPTH = 64;

    private MiniJson() {
    }

    // ------------------------------------------------------------------ ghi

    public static String write(Object value) {
        StringBuilder sb = new StringBuilder();
        write(value, sb, 0);
        return sb.toString();
    }

    private static void write(Object v, StringBuilder sb, int depth) {
        if (depth > MAX_DEPTH) {
            throw new IllegalArgumentException("JSON quá sâu");
        }
        if (v == null) {
            sb.append("null");
        } else if (v instanceof CharSequence cs) {
            quote(cs.toString(), sb);
        } else if (v instanceof Boolean b) {
            sb.append(b ? "true" : "false");
        } else if (v instanceof BigDecimal bd) {
            sb.append(bd.toPlainString());
        } else if (v instanceof Double d) {
            sb.append(d.isNaN() || d.isInfinite() ? "null" : d.toString());
        } else if (v instanceof Float f) {
            sb.append(f.isNaN() || f.isInfinite() ? "null" : f.toString());
        } else if (v instanceof Number n) {
            sb.append(n);
        } else if (v instanceof Map<?, ?> m) {
            sb.append('{');
            boolean first = true;
            for (Map.Entry<?, ?> e : m.entrySet()) {
                if (!first) {
                    sb.append(',');
                }
                first = false;
                quote(String.valueOf(e.getKey()), sb);
                sb.append(':');
                write(e.getValue(), sb, depth + 1);
            }
            sb.append('}');
        } else if (v instanceof Collection<?> c) {
            writeIterable(c, sb, depth);
        } else if (v instanceof Object[] arr) {
            writeIterable(java.util.Arrays.asList(arr), sb, depth);
        } else {
            quote(String.valueOf(v), sb); // UUID, enum, Instant...
        }
    }

    private static void writeIterable(Iterable<?> items, StringBuilder sb, int depth) {
        sb.append('[');
        boolean first = true;
        for (Object o : items) {
            if (!first) {
                sb.append(',');
            }
            first = false;
            write(o, sb, depth + 1);
        }
        sb.append(']');
    }

    private static void quote(String s, StringBuilder sb) {
        sb.append('"');
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            switch (c) {
                case '"' -> sb.append("\\\"");
                case '\\' -> sb.append("\\\\");
                case '\n' -> sb.append("\\n");
                case '\r' -> sb.append("\\r");
                case '\t' -> sb.append("\\t");
                case '\b' -> sb.append("\\b");
                case '\f' -> sb.append("\\f");
                default -> {
                    if (c < 0x20) {
                        sb.append(String.format("\\u%04x", (int) c));
                    } else {
                        sb.append(c);
                    }
                }
            }
        }
        sb.append('"');
    }

    // ------------------------------------------------------------------ đọc

    /** Parse một giá trị JSON; ném IllegalArgumentException nếu sai cú pháp. */
    public static Object parse(String json) {
        if (json == null) {
            throw new IllegalArgumentException("JSON rỗng");
        }
        Parser p = new Parser(json);
        p.skipWs();
        Object v = p.value(0);
        p.skipWs();
        if (p.pos != json.length()) {
            throw p.error("Dư ký tự sau giá trị JSON");
        }
        return v;
    }

    /** Parse an toàn: trả về map rỗng nếu chuỗi rỗng, sai cú pháp hoặc không phải object. */
    public static Map<String, Object> parseObjectOrEmpty(String json) {
        if (json == null || json.isBlank()) {
            return new LinkedHashMap<>();
        }
        try {
            return asMap(parse(json));
        } catch (IllegalArgumentException e) {
            return new LinkedHashMap<>();
        }
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> asMap(Object o) {
        return o instanceof Map<?, ?> ? (Map<String, Object>) o : new LinkedHashMap<>();
    }

    @SuppressWarnings("unchecked")
    public static List<Object> asList(Object o) {
        return o instanceof List<?> ? (List<Object>) o : new ArrayList<>();
    }

    public static String asString(Object o) {
        return o instanceof String s ? s : null;
    }

    private static final class Parser {
        private final String s;
        private int pos;

        Parser(String s) {
            this.s = s;
        }

        IllegalArgumentException error(String msg) {
            return new IllegalArgumentException(msg + " (vị trí " + pos + ")");
        }

        void skipWs() {
            while (pos < s.length() && Character.isWhitespace(s.charAt(pos))) {
                pos++;
            }
        }

        Object value(int depth) {
            if (depth > MAX_DEPTH) {
                throw error("JSON quá sâu");
            }
            if (pos >= s.length()) {
                throw error("JSON kết thúc đột ngột");
            }
            char c = s.charAt(pos);
            switch (c) {
                case '{':
                    return object(depth);
                case '[':
                    return array(depth);
                case '"':
                    return string();
                case 't':
                    return literal("true", Boolean.TRUE);
                case 'f':
                    return literal("false", Boolean.FALSE);
                case 'n':
                    return literal("null", null);
                default:
                    if (c == '-' || (c >= '0' && c <= '9')) {
                        return number();
                    }
                    throw error("Ký tự không hợp lệ '" + c + "'");
            }
        }

        Object literal(String word, Object result) {
            if (!s.startsWith(word, pos)) {
                throw error("Giá trị không hợp lệ");
            }
            pos += word.length();
            return result;
        }

        Map<String, Object> object(int depth) {
            Map<String, Object> map = new LinkedHashMap<>();
            pos++; // {
            skipWs();
            if (peek() == '}') {
                pos++;
                return map;
            }
            while (true) {
                skipWs();
                if (peek() != '"') {
                    throw error("Khóa của object phải là chuỗi");
                }
                String key = string();
                skipWs();
                expect(':');
                skipWs();
                map.put(key, value(depth + 1));
                skipWs();
                char c = next();
                if (c == '}') {
                    return map;
                }
                if (c != ',') {
                    throw error("Thiếu ',' hoặc '}'");
                }
            }
        }

        List<Object> array(int depth) {
            List<Object> list = new ArrayList<>();
            pos++; // [
            skipWs();
            if (peek() == ']') {
                pos++;
                return list;
            }
            while (true) {
                skipWs();
                list.add(value(depth + 1));
                skipWs();
                char c = next();
                if (c == ']') {
                    return list;
                }
                if (c != ',') {
                    throw error("Thiếu ',' hoặc ']'");
                }
            }
        }

        String string() {
            pos++; // "
            StringBuilder sb = new StringBuilder();
            while (true) {
                if (pos >= s.length()) {
                    throw error("Chuỗi chưa đóng");
                }
                char c = s.charAt(pos++);
                if (c == '"') {
                    return sb.toString();
                }
                if (c != '\\') {
                    sb.append(c);
                    continue;
                }
                if (pos >= s.length()) {
                    throw error("Escape dở dang");
                }
                char e = s.charAt(pos++);
                switch (e) {
                    case '"' -> sb.append('"');
                    case '\\' -> sb.append('\\');
                    case '/' -> sb.append('/');
                    case 'b' -> sb.append('\b');
                    case 'f' -> sb.append('\f');
                    case 'n' -> sb.append('\n');
                    case 'r' -> sb.append('\r');
                    case 't' -> sb.append('\t');
                    case 'u' -> {
                        if (pos + 4 > s.length()) {
                            throw error("Escape \\u dở dang");
                        }
                        try {
                            sb.append((char) Integer.parseInt(s.substring(pos, pos + 4), 16));
                        } catch (NumberFormatException ex) {
                            throw error("Escape \\u không hợp lệ");
                        }
                        pos += 4;
                    }
                    default -> throw error("Escape không hợp lệ");
                }
            }
        }

        Object number() {
            int start = pos;
            if (peek() == '-') {
                pos++;
            }
            boolean real = false;
            while (pos < s.length()) {
                char c = s.charAt(pos);
                if (c >= '0' && c <= '9') {
                    pos++;
                } else if (c == '.' || c == 'e' || c == 'E' || c == '+' || c == '-') {
                    real = true;
                    pos++;
                } else {
                    break;
                }
            }
            String num = s.substring(start, pos);
            try {
                if (!real) {
                    return Long.parseLong(num);
                }
                return Double.parseDouble(num);
            } catch (NumberFormatException ex) {
                try {
                    return Double.parseDouble(num);
                } catch (NumberFormatException ex2) {
                    throw error("Số không hợp lệ");
                }
            }
        }

        char peek() {
            return pos < s.length() ? s.charAt(pos) : '\0';
        }

        char next() {
            if (pos >= s.length()) {
                throw error("JSON kết thúc đột ngột");
            }
            return s.charAt(pos++);
        }

        void expect(char c) {
            if (next() != c) {
                pos--;
                throw error("Cần ký tự '" + c + "'");
            }
        }
    }
}

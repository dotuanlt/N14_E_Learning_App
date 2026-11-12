package iuh.fit.elearning.chatbot;

import iuh.fit.elearning.chatbot.llm.MiniJson;
import org.junit.jupiter.api.Test;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MiniJsonTest {

    @Test
    void roundTripsNestedValuesAndEscapes() {
        Map<String, Object> in = new LinkedHashMap<>();
        in.put("text", "Xin chào \"bạn\"\nhàng 2");
        in.put("n", 12);
        in.put("ok", true);
        in.put("list", List.of("a", "b"));
        in.put("none", null);

        Map<String, Object> out = MiniJson.parseObjectOrEmpty(MiniJson.write(in));
        assertEquals("Xin chào \"bạn\"\nhàng 2", out.get("text"));
        assertEquals(List.of("a", "b"), out.get("list"));
        assertEquals(Boolean.TRUE, out.get("ok"));
    }

    @Test
    void invalidJsonGivesEmptyMap() {
        assertTrue(MiniJson.parseObjectOrEmpty("{not json").isEmpty());
    }
}

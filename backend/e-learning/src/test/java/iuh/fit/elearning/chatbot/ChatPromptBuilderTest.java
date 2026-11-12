package iuh.fit.elearning.chatbot.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ChatPromptBuilderTest {

    @Test
    void includesDateNameAndCourseContext() {
        String p = ChatPromptBuilder.build("An", LocalDate.of(2026, 11, 12), "Java Core", "Bài 3");
        assertTrue(p.contains("2026-11-12"));
        assertTrue(p.contains("An"));
        assertTrue(p.contains("Java Core"));
        assertTrue(p.contains("Bài 3"));
    }

    @Test
    void omitsOptionalContext() {
        String p = ChatPromptBuilder.build(null, LocalDate.of(2026, 11, 12), null, null);
        assertFalse(p.contains("đang xem khóa học"));
        assertFalse(p.contains("Người dùng tên"));
    }
}

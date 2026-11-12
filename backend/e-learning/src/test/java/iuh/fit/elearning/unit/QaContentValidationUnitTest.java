package iuh.fit.elearning.unit;

import iuh.fit.elearning.interaction.dto.request.QaContentRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** UT-10: kiểm tra dữ liệu nội dung câu hỏi Q&A (rỗng, quá 1000 ký tự). */
class QaContentValidationUnitTest {

    private static Validator validator;

    @BeforeAll
    static void init() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    private static Set<ConstraintViolation<QaContentRequest>> check(String content) {
        return validator.validate(new QaContentRequest(content));
    }

    @Test
    @DisplayName("UT-10 Nội dung rỗng hoặc chỉ có khoảng trắng bị từ chối")
    void UT10_blankContentRejected() {
        assertEquals(1, check("").size());
        assertEquals(1, check("   ").size());
        assertEquals(1, check(null).size());
    }

    @Test
    @DisplayName("UT-10 Nội dung > 1000 ký tự bị từ chối kèm thông báo")
    void UT10_tooLongContentRejected() {
        Set<ConstraintViolation<QaContentRequest>> violations = check("a".repeat(1001));
        assertEquals(1, violations.size());
        assertTrue(violations.iterator().next().getMessage().contains("1000"));
    }

    @Test
    @DisplayName("UT-10 Nội dung hợp lệ (đúng 1000 ký tự) được chấp nhận")
    void UT10_validContentAccepted() {
        assertTrue(check("Câu hỏi hợp lệ").isEmpty());
        assertTrue(check("a".repeat(1000)).isEmpty());
    }
}

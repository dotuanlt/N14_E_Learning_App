package iuh.fit.elearning.unit;

import iuh.fit.elearning.auth.mail.EmailSender;
import iuh.fit.elearning.auth.otp.InMemoryOtpStore;
import iuh.fit.elearning.auth.otp.OtpPurpose;
import iuh.fit.elearning.auth.otp.OtpService;
import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.config.OtpProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

/** UT-01: nhập sai OTP, đếm số lần còn lại và hủy OTP sau 5 lần sai (kho OTP trong bộ nhớ thay cho Redis). */
class OtpAttemptLimitUnitTest {

    private static final String EMAIL = "an@example.com";

    private EmailSender mailer;
    private OtpService service;

    @BeforeEach
    void setUp() {
        mailer = mock(EmailSender.class);
        OtpProperties props = new OtpProperties("memory", 6, Duration.ofMinutes(5), 5, Duration.ofSeconds(60));
        service = new OtpService(new InMemoryOtpStore(), props, mailer);
    }

    private String issueAndCapture() {
        service.issue(OtpPurpose.REGISTER, EMAIL, "An");
        ArgumentCaptor<String> plain = ArgumentCaptor.forClass(String.class);
        verify(mailer).send(anyString(), anyString(), plain.capture(), anyString());
        Matcher m = Pattern.compile("\\b(\\d{6})\\b").matcher(plain.getValue());
        assertTrue(m.find());
        return m.group(1);
    }

    @Test
    @DisplayName("UT-01 Sai OTP: báo còn X lần thử, sai 5 lần thì hủy OTP")
    void UT01_wrongOtpCountsDownThenCancelsOtp() {
        String code = issueAndCapture();
        String wrong = code.equals("000000") ? "111111" : "000000";

        for (int remaining = 4; remaining >= 1; remaining--) {
            BusinessException ex = assertThrows(BusinessException.class,
                    () -> service.verify(OtpPurpose.REGISTER, EMAIL, wrong));
            assertEquals(ErrorCode.OTP_INVALID, ex.getErrorCode());
            assertTrue(ex.getMessage().contains("còn " + remaining + " lần"),
                    "Thông báo phải cho biết còn " + remaining + " lần thử: " + ex.getMessage());
        }
        BusinessException fifth = assertThrows(BusinessException.class,
                () -> service.verify(OtpPurpose.REGISTER, EMAIL, wrong));
        assertEquals(ErrorCode.TOO_MANY_ATTEMPTS, fifth.getErrorCode());

        // OTP đã bị hủy: mã đúng cũng không dùng được nữa
        BusinessException afterCancel = assertThrows(BusinessException.class,
                () -> service.verify(OtpPurpose.REGISTER, EMAIL, code));
        assertEquals(ErrorCode.OTP_EXPIRED, afterCancel.getErrorCode());
    }
}

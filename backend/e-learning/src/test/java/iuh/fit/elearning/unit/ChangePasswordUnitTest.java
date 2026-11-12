package iuh.fit.elearning.unit;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.interaction.repository.SavedCourseRepository;
import iuh.fit.elearning.learning.repository.EnrollmentRepository;
import iuh.fit.elearning.storage.service.StorageService;
import iuh.fit.elearning.user.dto.request.ChangePasswordRequest;
import iuh.fit.elearning.user.entity.User;
import iuh.fit.elearning.user.repository.UserRepository;
import iuh.fit.elearning.user.service.SessionService;
import iuh.fit.elearning.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** UT-12: UserService.changePassword từ chối khi mật khẩu hiện tại sai (mock Repository). */
class ChangePasswordUnitTest {

    private final UUID userId = UUID.randomUUID();
    private PasswordEncoder passwordEncoder;
    private SessionService sessionService;
    private UserService service;
    private User user;

    @BeforeEach
    void setUp() {
        UserRepository userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        sessionService = mock(SessionService.class);
        service = new UserService(userRepository, passwordEncoder, sessionService, mock(SavedCourseRepository.class),
                mock(EnrollmentRepository.class), mock(StorageService.class));
        user = User.builder().fullName("An").email("an@example.com").passwordHash("hash-cu").build();
        user.setId(userId);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    }

    @Test
    @DisplayName("UT-12 Sai mật khẩu hiện tại -> từ chối, giữ nguyên mật khẩu, không thu hồi phiên")
    void UT12_wrongCurrentPasswordRejected() {
        when(passwordEncoder.matches("sai-mat-khau-cu", "hash-cu")).thenReturn(false);
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.changePassword(userId, new ChangePasswordRequest("sai-mat-khau-cu", "Matkhaumoi1", null)));
        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
        assertEquals("Mật khẩu hiện tại không đúng", ex.getMessage());
        assertEquals("hash-cu", user.getPasswordHash());
        verify(passwordEncoder, never()).encode(anyString());
        verify(sessionService, never()).revokeOthers(any(), any());
    }

    @Test
    @DisplayName("UT-12 Mật khẩu hiện tại đúng -> đổi sang mật khẩu mới (đã băm) và thu hồi phiên khác")
    void UT12_correctCurrentPasswordChangesHash() {
        when(passwordEncoder.matches("matkhaucu1", "hash-cu")).thenReturn(true);
        when(passwordEncoder.matches("Matkhaumoi1", "hash-cu")).thenReturn(false);
        when(passwordEncoder.encode("Matkhaumoi1")).thenReturn("hash-moi");
        service.changePassword(userId, new ChangePasswordRequest("matkhaucu1", "Matkhaumoi1", "refresh-hien-tai"));
        assertEquals("hash-moi", user.getPasswordHash());
        verify(sessionService).revokeOthers(eq(userId), eq("refresh-hien-tai"));
    }
}

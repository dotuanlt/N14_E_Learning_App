package iuh.fit.elearning.unit;

import iuh.fit.elearning.auth.dto.request.LoginRequest;
import iuh.fit.elearning.auth.dto.request.RegisterRequest;
import iuh.fit.elearning.auth.otp.OtpService;
import iuh.fit.elearning.auth.security.JwtService;
import iuh.fit.elearning.auth.service.AuthService;
import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.user.entity.User;
import iuh.fit.elearning.user.entity.enums.UserStatus;
import iuh.fit.elearning.user.mapper.UserMapper;
import iuh.fit.elearning.user.repository.UserRepository;
import iuh.fit.elearning.user.service.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** UT-02, UT-03, UT-04, UT-05: AuthService.register / AuthService.login với Repository được mock. */
class AuthServiceUnitTest {

    private static final String EMAIL = "an@example.com";

    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private OtpService otpService;
    private JwtService jwtService;
    private AuthService service;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        passwordEncoder = mock(PasswordEncoder.class);
        otpService = mock(OtpService.class);
        jwtService = mock(JwtService.class);
        service = new AuthService(userRepository, passwordEncoder, otpService, jwtService,
                mock(SessionService.class), mock(UserMapper.class));
    }

    private User user(UserStatus status) {
        User u = User.builder().fullName("An").email(EMAIL).passwordHash("hash").status(status).build();
        when(userRepository.findByEmail(EMAIL)).thenReturn(Optional.of(u));
        return u;
    }

    private static LoginRequest login(String password) {
        return new LoginRequest(EMAIL, password, null, null);
    }

    // ---------------------------------------------------------------- UT-02

    @Test
    @DisplayName("UT-02 Đăng ký trùng email (ACTIVE) -> EMAIL_EXISTS, không tạo tài khoản")
    void UT02_registerDuplicateActiveEmail() {
        user(UserStatus.ACTIVE);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.register(
                new RegisterRequest("An", "An@Example.com", "Abcdef12", "Abcdef12", true)));
        assertEquals(ErrorCode.EMAIL_EXISTS, ex.getErrorCode());
        verify(userRepository, never()).saveAndFlush(any());
        verify(otpService, never()).issueDeferred(any(), anyString(), any());
    }

    @Test
    @DisplayName("UT-02 Đăng ký trùng email (LOCKED) -> EMAIL_EXISTS")
    void UT02_registerDuplicateLockedEmail() {
        user(UserStatus.LOCKED);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.register(
                new RegisterRequest("An", EMAIL, "Abcdef12", "Abcdef12", true)));
        assertEquals(ErrorCode.EMAIL_EXISTS, ex.getErrorCode());
        verify(userRepository, never()).saveAndFlush(any());
    }

    // ---------------------------------------------------------------- UT-03

    @Test
    @DisplayName("UT-03 Sai mật khẩu -> INVALID_CREDENTIALS, tăng bộ đếm sai")
    void UT03_wrongPassword() {
        User u = user(UserStatus.ACTIVE);
        when(passwordEncoder.matches("sai-mat-khau", "hash")).thenReturn(false);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(login("sai-mat-khau")));
        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
        assertEquals(1, u.getFailedLoginCount());
        assertNull(u.getLoginLockedUntil());
        verify(jwtService, never()).generateAccessToken(any());
    }

    @Test
    @DisplayName("UT-03 Sai mật khẩu lần thứ 5 -> TOO_MANY_ATTEMPTS và khóa tạm")
    void UT03_fifthWrongPasswordLocksTemporarily() {
        User u = user(UserStatus.ACTIVE);
        u.setFailedLoginCount(4);
        when(passwordEncoder.matches("sai-mat-khau", "hash")).thenReturn(false);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(login("sai-mat-khau")));
        assertEquals(ErrorCode.TOO_MANY_ATTEMPTS, ex.getErrorCode());
        assertNotNull(u.getLoginLockedUntil());
        assertEquals(0, u.getFailedLoginCount());
    }

    // ---------------------------------------------------------------- UT-04

    @Test
    @DisplayName("UT-04 Tài khoản LOCKED (mật khẩu đúng) -> ACCOUNT_LOCKED")
    void UT04_lockedAccount() {
        user(UserStatus.LOCKED);
        when(passwordEncoder.matches("dung-mat-khau", "hash")).thenReturn(true);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(login("dung-mat-khau")));
        assertEquals(ErrorCode.ACCOUNT_LOCKED, ex.getErrorCode());
        verify(jwtService, never()).generateAccessToken(any());
    }

    // ---------------------------------------------------------------- UT-05

    @Test
    @DisplayName("UT-05 Tài khoản PENDING (mật khẩu đúng) -> ACCOUNT_NOT_VERIFIED")
    void UT05_pendingAccount() {
        user(UserStatus.PENDING);
        when(passwordEncoder.matches("dung-mat-khau", "hash")).thenReturn(true);
        BusinessException ex = assertThrows(BusinessException.class, () -> service.login(login("dung-mat-khau")));
        assertEquals(ErrorCode.ACCOUNT_NOT_VERIFIED, ex.getErrorCode());
        verify(jwtService, never()).generateAccessToken(any());
    }
}

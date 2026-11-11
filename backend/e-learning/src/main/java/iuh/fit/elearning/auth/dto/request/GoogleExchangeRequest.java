package iuh.fit.elearning.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record GoogleExchangeRequest(
        @NotBlank(message = "Mã xác thực Google không được để trống")
        String code,
        String fcmToken,
        String deviceInfo
) {
}

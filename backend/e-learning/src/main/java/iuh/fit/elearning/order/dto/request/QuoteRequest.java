package iuh.fit.elearning.order.dto.request;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

/** Báo giá đơn hàng / liệt kê khuyến mãi dùng được; couponCode có thể để trống. */
public record QuoteRequest(
        @NotEmpty(message = "Danh sách khóa học không được để trống")
        List<UUID> courseIds,
        String couponCode
) {
}

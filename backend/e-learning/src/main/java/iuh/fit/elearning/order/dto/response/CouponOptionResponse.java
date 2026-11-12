package iuh.fit.elearning.order.dto.response;

import java.math.BigDecimal;
import java.time.Instant;

/** Một khuyến mãi hiển thị trong danh sách chọn; eligible=false kèm reason khi chưa đủ điều kiện. */
public record CouponOptionResponse(
        String code,
        String description,
        String discountType,
        BigDecimal discountValue,
        BigDecimal minOrderValue,
        BigDecimal maxDiscountAmount,
        Instant endAt,
        boolean eligible,
        BigDecimal discount,
        String reason
) {
}

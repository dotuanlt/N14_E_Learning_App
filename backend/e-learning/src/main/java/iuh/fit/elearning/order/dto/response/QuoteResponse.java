package iuh.fit.elearning.order.dto.response;

import java.math.BigDecimal;

/** Số tiền chính thức do server tính. couponError có giá trị khi mã không hợp lệ (đơn được báo giá không mã). */
public record QuoteResponse(
        BigDecimal subtotal,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        String couponCode,
        String couponDescription,
        String couponError
) {
}

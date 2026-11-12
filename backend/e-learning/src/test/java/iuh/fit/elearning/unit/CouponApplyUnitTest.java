package iuh.fit.elearning.unit;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.notification.service.NotificationService;
import iuh.fit.elearning.promotion.entity.Coupon;
import iuh.fit.elearning.promotion.entity.enums.DiscountType;
import iuh.fit.elearning.promotion.mapper.PromotionMapper;
import iuh.fit.elearning.promotion.repository.BannerRepository;
import iuh.fit.elearning.promotion.repository.CouponRepository;
import iuh.fit.elearning.promotion.service.PromotionService;
import iuh.fit.elearning.storage.service.StorageService;
import iuh.fit.elearning.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** UT-09: áp dụng mã giảm giá theo phần trăm và tổng tiền cần thanh toán (PromotionService.evaluate). */
class CouponApplyUnitTest {

    private CouponRepository couponRepository;
    private PromotionService service;

    @BeforeEach
    void setUp() {
        couponRepository = mock(CouponRepository.class);
        service = new PromotionService(couponRepository, mock(BannerRepository.class), mock(UserRepository.class),
                mock(NotificationService.class), mock(StorageService.class), mock(PromotionMapper.class));
    }

    private Coupon coupon(String code, String percent) {
        Coupon c = Coupon.builder().code(code).discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal(percent)).minOrderValue(BigDecimal.ZERO).usedCount(0).active(true).build();
        when(couponRepository.findByCodeIgnoreCase(code)).thenReturn(Optional.of(c));
        return c;
    }

    @Test
    @DisplayName("UT-09 Mã giảm 20% cho đơn 1.000.000đ -> giảm 200.000đ, còn phải trả 800.000đ")
    void UT09_percentageCouponReducesTotal() {
        coupon("WELCOME20", "20");
        BigDecimal subtotal = new BigDecimal("1000000");
        PromotionService.CouponApplication result = service.evaluate("WELCOME20", subtotal);
        assertEquals(0, new BigDecimal("200000").compareTo(result.discount()));
        assertEquals(0, new BigDecimal("800000").compareTo(subtotal.subtract(result.discount())));
    }

    @Test
    @DisplayName("UT-09 Mã hết hạn -> COUPON_INVALID")
    void UT09_expiredCouponRejected() {
        Coupon c = coupon("OLD10", "10");
        c.setEndAt(Instant.now().minus(1, ChronoUnit.DAYS));
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.evaluate("OLD10", new BigDecimal("500000")));
        assertEquals(ErrorCode.COUPON_INVALID, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT-09 Đơn chưa đạt giá trị tối thiểu -> COUPON_INVALID")
    void UT09_belowMinimumOrderRejected() {
        Coupon c = coupon("MIN500", "10");
        c.setMinOrderValue(new BigDecimal("500000"));
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.evaluate("MIN500", new BigDecimal("100000")));
        assertEquals(ErrorCode.COUPON_INVALID, ex.getErrorCode());
    }
}

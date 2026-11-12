package iuh.fit.elearning.unit;

import iuh.fit.elearning.cart.dto.response.CartResponse;
import iuh.fit.elearning.cart.entity.Cart;
import iuh.fit.elearning.cart.entity.CartItem;
import iuh.fit.elearning.cart.repository.CartItemRepository;
import iuh.fit.elearning.cart.repository.CartRepository;
import iuh.fit.elearning.cart.service.CartService;
import iuh.fit.elearning.course.dto.response.CourseSummaryResponse;
import iuh.fit.elearning.course.entity.Course;
import iuh.fit.elearning.course.entity.enums.CourseStatus;
import iuh.fit.elearning.course.repository.CourseRepository;
import iuh.fit.elearning.course.service.CourseService;
import iuh.fit.elearning.learning.service.CourseAccessService;
import iuh.fit.elearning.learning.service.EnrollmentService;
import iuh.fit.elearning.user.entity.User;
import iuh.fit.elearning.user.entity.enums.UserStatus;
import iuh.fit.elearning.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** UT-08: xóa khóa học khỏi giỏ và tính lại tổng tiền (CartService, mock Repository). */
class CartRemoveUnitTest {

    private final UUID userId = UUID.randomUUID();
    private CartRepository cartRepository;
    private CartItemRepository cartItemRepository;
    private CourseService courseService;
    private CartService service;
    private Cart cart;
    private Course courseA;
    private Course courseB;
    private CartItem itemA;
    private CartItem itemB;

    private static Course course(User instructor, String sale) {
        Course c = Course.builder().instructor(instructor).title("Khóa " + sale).status(CourseStatus.PUBLISHED)
                .originalPrice(new BigDecimal(sale)).salePrice(new BigDecimal(sale)).build();
        c.setId(UUID.randomUUID());
        return c;
    }

    @BeforeEach
    void setUp() {
        cartRepository = mock(CartRepository.class);
        cartItemRepository = mock(CartItemRepository.class);
        courseService = mock(CourseService.class);
        service = new CartService(cartRepository, cartItemRepository, mock(CourseRepository.class),
                mock(UserRepository.class), courseService, mock(CourseAccessService.class), mock(EnrollmentService.class));

        User instructor = User.builder().fullName("GV").email("gv@example.com").passwordHash("h")
                .status(UserStatus.ACTIVE).build();
        instructor.setId(UUID.randomUUID());
        cart = Cart.builder().build();
        cart.setId(UUID.randomUUID());
        courseA = course(instructor, "200000");
        courseB = course(instructor, "300000");
        itemA = CartItem.builder().cart(cart).course(courseA).priceAtAdded(courseA.getSalePrice()).build();
        itemB = CartItem.builder().cart(cart).course(courseB).priceAtAdded(courseB.getSalePrice()).build();
        when(cartRepository.findByUserId(userId)).thenReturn(Optional.of(cart));
    }

    @Test
    @DisplayName("UT-08 Xóa 1 khóa học khỏi giỏ -> xóa mục và tính lại tổng tiền")
    void UT08_removeItemRecalculatesTotal() {
        when(cartItemRepository.findByCartIdAndCourseId(cart.getId(), courseA.getId())).thenReturn(Optional.of(itemA));
        when(cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId())).thenReturn(List.of(itemB));
        when(courseService.summarize(anyList(), eq(userId))).thenReturn(List.of(mock(CourseSummaryResponse.class)));

        CartResponse response = service.removeItem(userId, courseA.getId());

        verify(cartItemRepository).delete(itemA);
        assertEquals(1, response.itemCount());
        assertEquals(0, new BigDecimal("300000").compareTo(response.subtotal()),
                "Tổng tiền phải chỉ còn giá khóa học B: " + response.subtotal());
    }

    @Test
    @DisplayName("UT-08 Xóa mục cuối cùng -> giỏ trống, tổng tiền 0")
    void UT08_removeLastItemLeavesEmptyCart() {
        when(cartItemRepository.findByCartIdAndCourseId(cart.getId(), courseA.getId())).thenReturn(Optional.of(itemA));
        when(cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId())).thenReturn(List.of());
        when(courseService.summarize(anyList(), eq(userId))).thenReturn(List.of());

        CartResponse response = service.removeItem(userId, courseA.getId());

        verify(cartItemRepository).delete(itemA);
        assertEquals(0, response.itemCount());
        assertEquals(0, BigDecimal.ZERO.compareTo(response.subtotal()));
    }

    @Test
    @DisplayName("UT-08 Xóa khóa học không có trong giỏ -> không xóa gì")
    void UT08_removeMissingItemDoesNothing() {
        when(cartItemRepository.findByCartIdAndCourseId(cart.getId(), courseA.getId())).thenReturn(Optional.empty());
        when(cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId())).thenReturn(List.of(itemB));
        when(courseService.summarize(anyList(), eq(userId))).thenReturn(List.of(mock(CourseSummaryResponse.class)));

        service.removeItem(userId, courseA.getId());

        verify(cartItemRepository, never()).delete(any(CartItem.class));
    }
}

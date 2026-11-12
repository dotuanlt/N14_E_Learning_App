package iuh.fit.elearning.unit;

import iuh.fit.elearning.auth.security.AuthUser;
import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.course.entity.Course;
import iuh.fit.elearning.course.repository.CourseRepository;
import iuh.fit.elearning.learning.entity.enums.EnrollmentStatus;
import iuh.fit.elearning.learning.repository.EnrollmentRepository;
import iuh.fit.elearning.learning.service.CourseAccessService;
import iuh.fit.elearning.user.entity.User;
import iuh.fit.elearning.user.entity.enums.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** UT-06 (bài học khóa khi chưa mua) và UT-07 (trạng thái sở hữu khóa học) trên CourseAccessService. */
class CourseAccessUnitTest {

    private final UUID studentId = UUID.randomUUID();
    private final UUID courseId = UUID.randomUUID();
    private final AuthUser student = new AuthUser(studentId, "hv@example.com", UserRole.STUDENT);

    private EnrollmentRepository enrollmentRepository;
    private CourseRepository courseRepository;
    private CourseAccessService service;
    private Course course;

    @BeforeEach
    void setUp() {
        enrollmentRepository = mock(EnrollmentRepository.class);
        courseRepository = mock(CourseRepository.class);
        service = new CourseAccessService(enrollmentRepository, courseRepository);

        User instructor = User.builder().fullName("GV").email("gv@example.com").passwordHash("h").build();
        instructor.setId(UUID.randomUUID());
        course = Course.builder().instructor(instructor).title("Khóa học mẫu").build();
        course.setId(courseId);
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
    }

    private void enrolled(boolean value) {
        when(enrollmentRepository.existsByUserIdAndCourseIdAndStatusNot(studentId, courseId, EnrollmentStatus.REFUNDED))
                .thenReturn(value);
    }

    @Test
    @DisplayName("UT-06 Học viên chưa sở hữu khóa học -> NOT_ENROLLED (nội dung bị khóa)")
    void UT06_notEnrolledCannotAccessContent() {
        enrolled(false);
        BusinessException ex = assertThrows(BusinessException.class,
                () -> service.requireContentAccess(student, courseId));
        assertEquals(ErrorCode.NOT_ENROLLED, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT-07 Học viên đã ghi danh -> isEnrolled = true và được xem nội dung")
    void UT07_enrolledOwnsCourse() {
        enrolled(true);
        assertTrue(service.isEnrolled(studentId, courseId));
        assertSame(course, service.requireContentAccess(student, courseId));
    }

    @Test
    @DisplayName("UT-07 Chưa ghi danh hoặc chưa đăng nhập -> isEnrolled = false")
    void UT07_notOwned() {
        enrolled(false);
        assertFalse(service.isEnrolled(studentId, courseId));
        assertFalse(service.isEnrolled(null, courseId));
    }
}

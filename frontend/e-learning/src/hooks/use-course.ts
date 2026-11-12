import { useQuery } from '@/hooks/use-query';
import { courseService } from '@/services/courseService';
import { useAppStore } from '@/store';
import type { CourseDetail } from '@/types';
import type { Chapter, Review } from '@/types/course';

interface CourseBundle {
  detail: CourseDetail;
  chaps: Chapter[];
  revs: Review[];
}

/**
 * Gói dữ liệu một khóa học (chi tiết + chương trình + đánh giá), tải song song và dùng chung cache
 * giữa các màn Tổng quan / Bài học / Đánh giá nên chuyển tab không phải tải lại.
 */
export function useCourse(courseId: string) {
  const { user } = useAppStore();
  const q = useQuery<CourseBundle>(
    `course:${courseId}:${user?.id ?? 'guest'}`,
    async () => {
      const [detail, chaps, revs] = await Promise.all([
        courseService.getCourseDetail(courseId),
        courseService.getCurriculum(courseId),
        courseService.getReviews(courseId),
      ]);
      if (!detail) throw new Error('Không tải được khóa học');
      return { detail, chaps: chaps ?? [], revs: revs ?? [] };
    },
    { staleMs: 60_000, enabled: courseId.length > 0 },
  );
  return {
    courseData: (q.data?.detail ?? null) as CourseDetail | null,
    chaptersList: (q.data?.chaps ?? []) as Chapter[],
    reviewsList: (q.data?.revs ?? []) as Review[],
    loading: q.loading,
    error: q.error,
    refresh: q.refresh,
  };
}

import { useLocalSearchParams, useRouter } from '@/navigation/routerHook';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { notify } from '@/lib/notify';

import { BenefitRow } from '@/components/course/benefit-row';
import { ChapterSection } from '@/components/course/chapter-section';
import { CourseMiniCard } from '@/components/course/course-mini-card';
import { InstructorRow } from '@/components/course/instructor-row';
import { PriceBar } from '@/components/course/price-bar';
import { PriceCard } from '@/components/course/price-card';
import { TwoColumn } from '@/components/ui/two-column';
import { useResponsive } from '@/hooks/use-responsive';
import { ReviewCard } from '@/components/course/review-card';
import { CourseHero } from '@/components/ui/course-hero';
import { SmartVideoPlayer } from '@/components/ui/smart-video-player';
import { RatingLine } from '@/components/ui/rating-line';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionHeader } from '@/components/ui/section-header';
import type { SegmentItem } from '@/components/ui/segmented-tabs';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useCourse } from '@/hooks/use-course';
import { CourseSkeleton } from '@/components/course/course-skeleton';
import {
  courseCurriculumHref,
  courseOverviewHref,
  coursePlayerHref,
  courseReviewsHref,
  instructorHref,
} from '@/lib/routes';
import { courseService } from '@/services/courseService';
import { useAppStore } from '@/store';
import type { CourseDetail } from '@/types';
import type { Chapter, Review } from '@/types/course';

type DetailTab = 'overview' | 'curriculum' | 'reviews';
type ReviewFilter = 'all' | '5' | '4' | '3';

const REVIEW_FILTERS: { key: ReviewFilter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: '5', label: '5 sao' },
  { key: '4', label: '4 sao' },
  { key: '3', label: '3 sao' },
];

export default function CourseOverviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const courseId = typeof id === 'string' && id.length > 0 ? id : '';
  const theme = useAppTheme();
  const router = useRouter();
  const { addToCart } = useAppStore();
  const { isWide, wideMax } = useResponsive();

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all');
  const [expanded, setExpanded] = useState(false);
  const [following, setFollowing] = useState(false);
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  const { courseData, chaptersList, reviewsList, loading, error, refresh } = useCourse(courseId);

  const tabs: SegmentItem[] = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'curriculum', label: 'Bài học' },
    { key: 'reviews', label: 'Đánh giá' },
  ];

  const filteredReviews =
    reviewFilter === 'all'
      ? reviewsList
      : reviewsList.filter((review) => String(Math.round(review.rating)) === reviewFilter);

  const handleAddToCart = async () => {
    if (!courseData) return;
    try {
      await addToCart({
        id: courseData.id,
        courseId: courseData.id,
        title: courseData.title,
        author: courseData.instructor.name,
        price: courseData.priceNumber ?? 0,
        thumbnailColor: '#c9bcff',
        thumbnailLabel: courseData.category.slice(0, 3).toUpperCase(),
        image: courseData.coverImage,
      });
      notify.toast({
        type: 'success',
        title: 'Đã thêm vào giỏ hàng',
        message: courseData.title,
        actionLabel: 'Xem giỏ hàng',
        onAction: () => router.push('/cart'),
      });
    } catch (err: any) {
      notify.error('Không thể thêm vào giỏ', err?.message || 'Vui lòng thử lại.');
    }
  };

  if (!courseData) return <CourseSkeleton error={!loading ? error : undefined} onRetry={refresh} />;

  const mainContent = (
    <>
        {showIntroVideo && courseData?.introVideoUrl ? (
          <View style={[styles.introCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <SmartVideoPlayer url={courseData.introVideoUrl} autoPlay height={210} />
            <Pressable
              accessibilityRole="button"
              onPress={() => setShowIntroVideo(false)}
              style={styles.closeIntroBtn}
            >
              <Text style={[styles.link, { color: theme.primary }]}>Đóng video giới thiệu</Text>
            </Pressable>
          </View>
        ) : null}
        <CourseHero
          activeTab={activeTab}
          category={courseData?.category || 'Khóa học'}
          coverImage={courseData?.coverImage}
          footer={
            <RatingLine
              lessonCount={courseData?.lessonCount || 0}
              rating={courseData?.rating || 5}
              reviewCount={courseData?.reviewCount || 0}
            />
          }
          headline={courseData?.headline || ['Khóa học', 'Chuyên sâu']}
          onPlayPress={() => {
            if (courseData?.introVideoUrl) {
              setShowIntroVideo(true);
            } else {
              router.push(coursePlayerHref(courseId));
            }
          }}
          tabs={tabs}
          onTabChange={(key) => setActiveTab(key as DetailTab)}
          title={courseData?.title || 'Đang tải khóa học...'}
        />

        {activeTab === 'overview' && courseData && (
          <>
            <InstructorRow
              following={following}
              instructor={courseData.instructor}
              onFollow={() => setFollowing((prev) => !prev)}
              onPress={() => router.push(instructorHref(courseData.instructor.id))}
            />

            <View style={styles.section}>
              <SectionHeader title="Mô tả" />
              <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
                {expanded ? courseData.descriptionMore : courseData.description}
              </Text>
              <Pressable accessibilityRole="button" onPress={() => setExpanded((prev) => !prev)}>
                <Text style={[styles.link, { color: theme.primary }]}>
                  {expanded ? 'Thu gọn' : 'Xem thêm'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Lợi ích" />
              <View style={styles.benefits}>
                {(courseData.benefits || []).map((benefit, idx) => (
                  <BenefitRow key={`${benefit}-${idx}`} label={benefit} />
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <SectionHeader title="Khóa học tương tự" />
              {(courseData.related || []).map((item) => (
                <CourseMiniCard
                  key={item.id}
                  course={item}
                  onPress={() => router.push(courseOverviewHref(item.id))}
                />
              ))}
            </View>
          </>
        )}

        {activeTab === 'curriculum' && (
          <View style={{ gap: Spacing.three }}>
            {chaptersList.map((chapter) => (
              <ChapterSection
                key={chapter.id}
                chapter={chapter}
                onLessonPress={() => router.push(coursePlayerHref(courseId))}
              />
            ))}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={{ gap: Spacing.three }}>
            <View style={styles.filterRow}>
              {REVIEW_FILTERS.map((item) => {
                const active = item.key === reviewFilter;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setReviewFilter(item.key)}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: active ? theme.primary : theme.backgroundElement,
                        borderColor: active ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text style={{ color: active ? '#ffffff' : theme.text, fontWeight: '600', fontSize: 13 }}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ gap: Spacing.three }}>
              {filteredReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </View>
          </View>
        )}
    </>
  );

  const owned = !!courseData?.owned;
  const goAi = () => router.push({ pathname: '/chat', params: { courseId } });

  if (isWide) {
    return (
      <Screen maxWidth={wideMax}>
        <ScreenHeader title="Chi tiết khóa học" />
        <TwoColumn
          main={mainContent}
          contentContainerStyle={styles.content}
          aside={
            <PriceCard
              price={owned ? 'Đã sở hữu' : courseData?.price || '0 đ'}
              discount={owned ? '' : courseData?.discount || ''}
              actionLabel={owned ? 'Vào học ngay' : 'Thêm vào giỏ'}
              onAction={owned ? () => router.push(coursePlayerHref(courseId)) : handleAddToCart}
              onAskAi={goAi}
              facts={[
                { icon: 'video', label: 'Số bài học', value: String(courseData?.lessonCount || 0) },
                { icon: 'star', label: 'Đánh giá', value: `${courseData?.rating || 5} (${courseData?.reviewCount || 0})` },
                { icon: 'teacher', label: 'Giảng viên', value: courseData?.instructor?.name || '' },
              ]}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        owned ? (
          <PriceBar
            price="Đã sở hữu"
            discount=""
            actionLabel="Vào học ngay"
            onPress={() => router.push(coursePlayerHref(courseId))}
          />
        ) : (
          <PriceBar
            price={courseData?.price || '0 đ'}
            discount={courseData?.discount || ''}
            actionLabel="Thêm vào giỏ"
            onPress={handleAddToCart}
          />
        )
      }
    >
      <ScreenHeader title="Chi tiết khóa học" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Hỏi trợ lý AI về khóa học này"
        onPress={goAi}
        style={[styles.aiLink, { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }]}>
        <Image
          source={require('../../assets/images/robot.png')}
          style={styles.aiIcon}
          resizeMode="contain"
        />
        <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>Hỏi trợ lý AI về khóa học này</Text>
      </Pressable>
      <TwoColumn main={mainContent} aside={null} narrowAside="hidden" contentContainerStyle={styles.content} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  aiLink: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 },
  aiIcon: { width: 20, height: 20, borderRadius: 6 },
  introCard: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  closeIntroBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  content: {
    padding: Spacing.three,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
  },
  link: {
    fontSize: 13,
    fontWeight: '600',
  },
  benefits: {
    gap: Spacing.two,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  filterChip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});

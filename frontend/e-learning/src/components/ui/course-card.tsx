import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { FontSizes, Radius, Spacing } from '@/constants/theme';
import type { Course } from '@/types';

type CourseCardVariant = 'vertical' | 'horizontal';

interface CourseCardProps {
  course: Course;
  variant?: CourseCardVariant;
  onPress?: () => void;
  onBookmark?: () => void;
}

export function CourseCard({ course, variant = 'vertical', onPress, onBookmark }: CourseCardProps) {
  const theme = useTheme();

  if (variant === 'horizontal') {
    return (
      <PressableScale
        onPress={onPress}
        accessibilityLabel={course.title}
        style={({ pressed }) => [
          styles.hCard,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.divider,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <View style={[styles.hCover, { backgroundColor: course.coverColor }]}>
          {course.coverUri ? (
            <Image source={{ uri: course.coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : null}
        </View>
        <View style={styles.hInfo}>
          <Text numberOfLines={2} style={[styles.hTitle, { color: theme.text }]}>
            {course.title}
          </Text>
          <Text numberOfLines={1} style={[styles.hAuthor, { color: theme.textSecondary }]}>
            {course.instructor}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <Text style={[styles.hMeta, { color: theme.primary }]}>${course.price} ·</Text>
            <Icon name="star" weight="fill" size={13} color={theme.star} />
            <Text style={[styles.hMeta, { color: theme.primary }]}>{course.rating} · {course.lessonCount} bài</Text>
          </View>
        </View>
        <PressableScale
          onPress={onBookmark}
          accessibilityRole="button"
          accessibilityLabel="Lưu khóa học"
          style={[styles.bookmark, { backgroundColor: theme.backgroundSelected }]}
        >
          <Icon name="bookmark" size={16} color={theme.primary} />
        </PressableScale>
      </PressableScale>
    );
  }

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={course.title}
      style={({ pressed }) => [
        styles.vCard,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.vCover, { backgroundColor: course.coverColor }]}>
        {course.coverUri ? (
          <Image source={{ uri: course.coverUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : null}
        {course.isBestseller ? (
          <View style={[styles.bestseller, { backgroundColor: theme.accent }]}>
            <Text style={[styles.bestsellerText, { color: theme.text }]}>Bán chạy</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.vInfo}>
        <Text numberOfLines={2} style={[styles.vTitle, { color: theme.text }]}>
          {course.title}
        </Text>
        <Text numberOfLines={1} style={[styles.vAuthor, { color: theme.textSecondary }]}>
          {course.instructor}
        </Text>
        <Text style={[styles.vPrice, { color: theme.primary }]}>${course.price}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  vCard: {
    width: 180,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginRight: Spacing.three,
  },
  vCover: {
    height: 120,
    width: '100%',
    position: 'relative',
  },
  bestseller: {
    position: 'absolute',
    top: Spacing.two,
    left: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Radius.pill,
  },
  bestsellerText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
  },
  vInfo: {
    padding: Spacing.three,
    gap: Spacing.one,
  },
  vTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  vAuthor: {
    fontSize: FontSizes.sm,
  },
  vPrice: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginTop: Spacing.one,
  },
  hCard: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.two,
    alignItems: 'center',
    borderWidth: 1,
    gap: Spacing.three,
  },
  hCover: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  hInfo: {
    flex: 1,
    gap: Spacing.half,
  },
  hTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  hAuthor: {
    fontSize: FontSizes.sm,
  },
  hMeta: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginTop: Spacing.half,
  },
  bookmark: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

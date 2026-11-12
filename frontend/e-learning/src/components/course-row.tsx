import { AddToCartButton } from '@/components/ui/add-to-cart-button';
import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { Radius, Spacing, FontSizes } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Course } from '@/types/course';

type CourseRowProps = {
  course: Course;
  onPress?: () => void;
};

function formatVnd(amount?: number | null): string {
  if (amount == null || amount === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function CourseRow({ course, onPress }: CourseRowProps) {
  const theme = useTheme();
  const imageUri = course.image || (course as any).coverUri;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={course.title}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.card, opacity: pressed ? 0.9 : 1 },
      ]}>
      <View style={[styles.thumb, { backgroundColor: course.tint }]}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.thumbImage}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
          />
        ) : null}
      </View>
      <View style={styles.content}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {course.title}
        </Text>
        <Text numberOfLines={1} style={[styles.author, { color: theme.textSecondary }]}>
          {course.author}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <Text style={[styles.meta, { color: theme.primary }]}>{`${formatVnd(course.price)} ·`}</Text>
          <Icon name="star" weight="fill" size={12} color={theme.star} />
          <Text style={[styles.meta, { color: theme.primary }]}>{`${course.rating} · ${course.lessons} bài`}</Text>
        </View>
      </View>
      <AddToCartButton variant="icon" course={{ id: course.id, title: course.title, author: course.author, price: course.price, image: imageUri, tint: course.tint }} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.two + 4,
    borderRadius: Radius.lg,
    marginBottom: Spacing.two + 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  thumb: {
    width: 68,
    height: 68,
    borderRadius: Radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  author: {
    fontSize: FontSizes.sm,
  },
  meta: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginTop: 2,
  },
});

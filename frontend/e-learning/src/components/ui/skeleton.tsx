import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Một nhịp nhấp nháy dùng chung cho mọi skeleton đang hiển thị (đồng bộ, đỡ tốn tài nguyên). */
const pulse = new Animated.Value(0);
let users = 0;
let loop: Animated.CompositeAnimation | null = null;

function acquire() {
  users += 1;
  if (users === 1) {
    loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 850, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
  }
}
function release() {
  users = Math.max(0, users - 1);
  if (users === 0) {
    loop?.stop();
    loop = null;
  }
}

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

/** Khối xám nhấp nháy giữ chỗ cho nội dung đang tải. */
export function Skeleton({ width = '100%', height = 16, radius = Radius.sm, style }: SkeletonProps) {
  const theme = useTheme();
  useEffect(() => {
    acquire();
    return release;
  }, []);
  const opacity = useRef(pulse.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1] })).current;
  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Đang tải"
      style={[{ width, height, borderRadius: radius, backgroundColor: theme.backgroundSelected, opacity }, style]}
    />
  );
}

/** Nhiều dòng chữ giả; dòng cuối ngắn hơn cho giống đoạn văn. */
export function SkeletonText({ lines = 3, gap = 8, height = 12 }: { lines?: number; gap?: number; height?: number }) {
  return (
    <View style={{ gap }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={height} width={i === lines - 1 && lines > 1 ? '62%' : '100%'} />
      ))}
    </View>
  );
}

/** Thẻ khóa học dạng hàng ngang (ảnh bên trái + chữ bên phải). */
export function SkeletonCourseRow() {
  return (
    <View style={styles.row}>
      <Skeleton width={96} height={72} radius={Radius.md} />
      <View style={{ flex: 1, gap: 8, justifyContent: 'center' }}>
        <Skeleton height={14} />
        <Skeleton height={12} width="60%" />
        <Skeleton height={12} width="35%" />
      </View>
    </View>
  );
}

/** Thẻ khóa học dạng dọc (ảnh trên + chữ dưới) cho danh sách cuộn ngang. */
export function SkeletonCourseCard({ width = 220 }: { width?: number }) {
  return (
    <View style={{ width, gap: 10 }}>
      <Skeleton height={124} radius={Radius.lg} />
      <Skeleton height={14} />
      <Skeleton height={12} width="55%" />
    </View>
  );
}

export function SkeletonList({ count = 4, children }: { count?: number; children?: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.three }}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i}>{children ?? <SkeletonCourseRow />}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.three },
});

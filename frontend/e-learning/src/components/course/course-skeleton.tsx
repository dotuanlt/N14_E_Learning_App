import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Skeleton, SkeletonText } from '@/components/ui/skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

/** Trang chi tiết khóa học khi dữ liệu chưa về: khung xương; nếu tải lỗi thì hiện nút Thử lại. */
export function CourseSkeleton({ error, onRetry }: { error?: unknown; onRetry?: () => void }) {
  const theme = useAppTheme();
  return (
    <Screen footer={<Skeleton height={52} radius={Radius.pill} style={styles.footer} />}>
      <ScreenHeader title="Chi tiết khóa học" />
      {error ? (
        <View style={styles.errorBox}>
          <Text style={{ color: theme.textSecondary, textAlign: 'center', fontSize: 13, lineHeight: 20 }}>
            Không tải được khóa học. Vui lòng kiểm tra kết nối và thử lại.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={onRetry}
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
            <Text style={{ color: theme.onPrimary, fontWeight: '700' }}>Thử lại</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.content}>
          <Skeleton height={176} radius={Radius.xl} />
          <Skeleton height={20} width="80%" />
          <Skeleton height={14} width="40%" />
          <View style={styles.tabs}>
            <Skeleton height={32} width={84} radius={Radius.pill} />
            <Skeleton height={32} width={84} radius={Radius.pill} />
            <Skeleton height={32} width={84} radius={Radius.pill} />
          </View>
          <SkeletonText lines={5} />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { marginHorizontal: Spacing.three, marginVertical: Spacing.two },
  content: { padding: Spacing.three, gap: Spacing.three },
  tabs: { flexDirection: 'row', gap: Spacing.three, marginVertical: Spacing.two },
  errorBox: { alignItems: 'center', gap: Spacing.three, padding: Spacing.five },
  retryBtn: { borderRadius: Radius.pill, paddingHorizontal: Spacing.five, paddingVertical: Spacing.three },
});

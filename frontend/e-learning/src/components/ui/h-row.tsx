import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { FadeIn } from '@/components/ui/fade-in';
import { Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

/**
 * Hàng thẻ: điện thoại/cửa sổ hẹp thì cuộn ngang; màn hình rộng (máy tính) thì xếp thành lưới tự xuống dòng
 * để không bỏ trống nửa màn hình và không bắt người dùng cuộn ngang bằng chuột.
 */
export function HRow({ children, ready = true }: { children: ReactNode; ready?: boolean }) {
  const { isWide, gutter } = useResponsive();
  return (
    <FadeIn key={ready ? 'ready' : 'loading'}>
      {isWide ? (
        <View style={[styles.wrap, { paddingHorizontal: gutter }]}>{children}</View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.row, { paddingHorizontal: gutter }]}>
          {children}
        </ScrollView>
      )}
    </FadeIn>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.three },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three },
});

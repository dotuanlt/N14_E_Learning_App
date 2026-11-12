import type { ReactNode } from 'react';
import { RefreshControlProps, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';

type Props = {
  /** Cột chính (nội dung dài, cuộn). */
  main: ReactNode;
  /** Cột phụ (thẻ tóm tắt / thanh toán / danh sách bài học). */
  aside: ReactNode;
  /** Hẹp: 'below' xếp cột phụ dưới cột chính, 'above' xếp trên, 'hidden' ẩn đi (đã có thanh dưới). */
  narrowAside?: 'below' | 'above' | 'hidden';
  asideWidth?: number;
  gap?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
  asideContentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ReactElement<RefreshControlProps>;
  /** Đảo vị trí: cột phụ bên trái khi màn rộng. */
  asideLeft?: boolean;
};

/**
 * Bố cục 2 cột cho màn rộng (>= 820px vùng nội dung): cột chính cuộn riêng, cột phụ cuộn riêng nên luôn
 * hiện trong tầm mắt (giống "sticky"). Màn hẹp: một cột như cũ.
 */
export function TwoColumn({
  main,
  aside,
  narrowAside = 'below',
  asideWidth = 360,
  gap = Spacing.four,
  contentContainerStyle,
  asideContentStyle,
  refreshControl,
  asideLeft,
}: Props) {
  const { isWide } = useResponsive();

  if (!isWide) {
    return (
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={refreshControl}>
        {narrowAside === 'above' ? aside : null}
        {main}
        {narrowAside === 'below' ? aside : null}
      </ScrollView>
    );
  }

  const mainCol = (
    <ScrollView
      key="main"
      style={styles.main}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}>
      {main}
    </ScrollView>
  );
  const asideCol = (
    <ScrollView
      key="aside"
      style={{ width: asideWidth, flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={[styles.asideContent, asideContentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      {aside}
    </ScrollView>
  );

  return (
    <View style={[styles.row, { gap }]}>{asideLeft ? [asideCol, mainCol] : [mainCol, asideCol]}</View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row', alignItems: 'stretch' },
  main: { flex: 1, minWidth: 0 },
  asideContent: { paddingVertical: Spacing.three, paddingRight: Spacing.three, gap: Spacing.three },
});

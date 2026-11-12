import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';
import { useResponsive } from '@/hooks/use-responsive';

type Props = {
  children: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Ghi đè bề rộng tối đa (bố cục 2 cột dùng wideMax). */
  maxWidth?: number;
};

export function Screen({ children, footer, style, maxWidth }: Props) {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const { contentMax } = useResponsive();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.background, paddingTop: insets.top },
        style,
      ]}
    >
      <View style={[styles.content, { maxWidth: maxWidth ?? contentMax }]}>{children}</View>
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
  },
});

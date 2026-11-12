import { PressableScale } from '@/components/ui/pressable-scale';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/hooks/use-theme';
import { Icon } from '@/components/ui/icon';
import { FontSizes, Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { navigate } from '@/navigation/navigationRef';

export type TabName = 'home' | 'search' | 'courses' | 'profile';

interface Props {
  currentTab?: TabName;
}

export function BottomNavBar({ currentTab = 'home' }: Props) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { isCompact, hasSidebar } = useResponsive();

  const active: TabName = currentTab;
  if (hasSidebar) return null; // màn rộng đã có thanh điều hướng bên

  const tabs: { key: TabName; label: string; icon: string; screen: string }[] = [
    { key: 'home', label: 'Trang chủ', icon: 'home', screen: 'Home' },
    { key: 'search', label: 'Tìm kiếm', icon: 'search', screen: 'Search' },
    { key: 'courses', label: 'Khóa học', icon: 'courses', screen: 'MyCourses' },
    { key: 'profile', label: 'Hồ sơ', icon: 'profile', screen: 'Profile' },
  ];

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, Spacing.two) }]}
    >
      <View
        style={[
          styles.inner,
          { maxWidth: isCompact ? 640 : 520, backgroundColor: theme.backgroundElement, borderColor: theme.border },
        ]}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.key;
          const color = isActive ? theme.onPrimary : theme.textSecondary;
          return (
            <PressableScale haptic="selection"
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.label}
              onPress={() => {
                if (!isActive) {
                  navigate(tab.screen as any);
                }
              }}
              style={[styles.tabBtn, isActive && { backgroundColor: theme.primary, flex: 1.6 }]}
            >
              <Icon name={tab.icon} weight={isActive ? 'fill' : 'regular'} size={22} color={color} />
              {isActive ? (
                <Text numberOfLines={1} style={[styles.tabLabel, { color }]}>
                  {tab.label}
                </Text>
              ) : null}
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.three,
    zIndex: 99,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 6,
    gap: 4,
    elevation: 10,
    shadowColor: '#181528',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  tabBtn: {
    flex: 1,
    height: 46,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
});

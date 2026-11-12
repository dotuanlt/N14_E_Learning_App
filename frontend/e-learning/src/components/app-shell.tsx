import { useMemo, type ReactNode } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { FontSizes, Radius, Spacing } from '@/constants/theme';
import { LayoutContext } from '@/hooks/layout-context';
import { useTheme } from '@/hooks/use-theme';
import { navigate } from '@/navigation/navigationRef';
import { useCurrentRouteName } from '@/navigation/route-store';
import { useAppStore } from '@/store';

const SIDEBAR_MIN_WINDOW = 900;
const FULL_MIN_WINDOW = 1100;
const FULL_WIDTH = 248;
const RAIL_WIDTH = 80;

/** Màn hình không hiển thị sidebar (đăng nhập/giới thiệu, trình phát, hộp thoại lọc). */
const NO_SIDEBAR = new Set([
  'Welcome', 'Login', 'Register', 'VerifyOtp', 'ForgotPassword', 'CoursePlayer', 'SearchFilter',
]);

type NavItem = {
  key: string;
  label: string;
  icon: string;
  screen: string;
  /** Các route được coi là "đang ở mục này". */
  routes: string[];
  badge?: number;
};

export function AppShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const route = useCurrentRouteName();
  const visible = width >= SIDEBAR_MIN_WINDOW && !!route && !NO_SIDEBAR.has(route);
  const full = width >= FULL_MIN_WINDOW;
  const sidebarWidth = visible ? (full ? FULL_WIDTH : RAIL_WIDTH) : 0;

  const layout = useMemo(
    () => ({ width: width - sidebarWidth, hasSidebar: visible }),
    [width, sidebarWidth, visible],
  );

  return (
    <LayoutContext.Provider value={layout}>
      <View style={styles.row}>
        {visible ? <Sidebar full={full} route={route!} width={sidebarWidth} /> : null}
        <View style={styles.main}>{children}</View>
      </View>
    </LayoutContext.Provider>
  );
}

function Sidebar({ full, route, width }: { full: boolean; route: string; width: number }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, cart, unreadCount } = useAppStore();

  const items: NavItem[] = [
    { key: 'home', label: 'Trang chủ', icon: 'home', screen: 'Home', routes: ['Home'] },
    { key: 'search', label: 'Tìm kiếm', icon: 'search', screen: 'Search', routes: ['Search', 'SearchResults'] },
    { key: 'courses', label: 'Khóa học của tôi', icon: 'courses', screen: 'MyCourses', routes: ['MyCourses'] },
    { key: 'cart', label: 'Giỏ hàng', icon: 'cart', screen: 'Cart', routes: ['Cart', 'Checkout', 'PaymentQr', 'CheckoutSuccess'], badge: cart.length },
    { key: 'notifications', label: 'Thông báo', icon: 'bell', screen: 'Notifications', routes: ['Notifications'], badge: unreadCount },
    { key: 'chat', label: 'Trợ lý AI', icon: 'sparkle', screen: 'Chat', routes: ['Chat'] },
    { key: 'profile', label: 'Hồ sơ', icon: 'profile', screen: 'Profile', routes: ['Profile', 'Settings', 'InstructorProfile'] },
  ];

  const initials = user ? (user.initials || user.name.slice(0, 2).toUpperCase()) : null;

  return (
    <View
      style={[
        styles.sidebar,
        {
          width,
          paddingTop: insets.top + Spacing.three,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
          backgroundColor: theme.backgroundElement,
          borderRightColor: theme.border,
        },
      ]}>
      <View style={[styles.brand, !full && { justifyContent: 'center', paddingHorizontal: 0 }]}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <Icon name="graduation" weight="fill" size={20} color={theme.onPrimary} />
        </View>
        {full ? (
          <Text style={[styles.brandText, { color: theme.text }]} numberOfLines={1}>
            E-Learning
          </Text>
        ) : null}
      </View>

      <View style={styles.items}>
        {items.map((it) => {
          const active = it.routes.includes(route);
          const color = active ? theme.onPrimary : theme.textSecondary;
          return (
            <PressableScale
              key={it.key}
              haptic="selection"
              accessibilityRole="tab"
              accessibilityLabel={it.label}
              accessibilityState={{ selected: active }}
              onPress={() => {
                if (!active) navigate(it.screen as any);
              }}
              style={[
                styles.item,
                !full && styles.itemRail,
                active && { backgroundColor: theme.primary },
              ]}>
              <View>
                <Icon name={it.icon} weight={active ? 'fill' : 'regular'} size={22} color={color} />
                {!full && it.badge ? (
                  <View style={[styles.dot, { backgroundColor: active ? theme.onPrimary : theme.danger }]} />
                ) : null}
              </View>
              {full ? (
                <>
                  <Text
                    numberOfLines={1}
                    style={[styles.itemLabel, { color: active ? theme.onPrimary : theme.text, fontWeight: active ? '800' : '600' }]}>
                    {it.label}
                  </Text>
                  {it.badge ? (
                    <View style={[styles.badge, { backgroundColor: active ? theme.onPrimary : theme.primary }]}>
                      <Text style={[styles.badgeText, { color: active ? theme.primary : theme.onPrimary }]}>
                        {it.badge > 99 ? '99+' : it.badge}
                      </Text>
                    </View>
                  ) : null}
                </>
              ) : null}
            </PressableScale>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />

      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={user ? 'Hồ sơ của tôi' : 'Đăng nhập'}
        onPress={() => navigate((user ? 'Profile' : 'Login') as any)}
        style={[
          styles.userCard,
          { backgroundColor: theme.chipBackground, borderColor: theme.border },
          !full && { paddingHorizontal: 0, justifyContent: 'center' },
        ]}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}>
          {initials ? (
            <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 13 }}>{initials}</Text>
          ) : (
            <Icon name="profile" size={18} color={theme.primary} />
          )}
        </View>
        {full ? (
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ color: theme.text, fontWeight: '800', fontSize: FontSizes.sm }}>
              {user ? user.name : 'Khách'}
            </Text>
            <Text numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 12 }}>
              {user ? user.email : 'Bấm để đăng nhập'}
            </Text>
          </View>
        ) : null}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flex: 1, flexDirection: 'row' },
  main: { flex: 1, minWidth: 0 },
  sidebar: {
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 8, marginBottom: Spacing.four },
  logo: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brandText: { fontSize: 19, fontWeight: '900', letterSpacing: -0.3, flexShrink: 1 },
  items: { gap: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: Radius.lg,
  },
  itemRail: { justifyContent: 'center', paddingHorizontal: 0 },
  itemLabel: { flex: 1, fontSize: FontSizes.sm },
  badge: { minWidth: 22, height: 22, borderRadius: 11, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 11, fontWeight: '800' },
  dot: { position: 'absolute', top: -2, right: -3, width: 9, height: 9, borderRadius: 5 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    minHeight: 52,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});

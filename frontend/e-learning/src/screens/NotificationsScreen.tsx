import { FadeIn } from '@/components/ui/fade-in';
import { useResponsive } from '@/hooks/use-responsive';
import { SkeletonList } from '@/components/ui/skeleton';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { NotificationRow } from '@/components/notification-row';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useTheme } from '@/hooks/use-theme';
import { BottomTabInset, FontSizes, MaxContentWidth, Spacing } from '@/constants/theme';
import { notificationService } from '@/services/notificationService';
import type { NotificationItem } from '@/types/notification';

type Filter = 'all' | 'unread';

const filterLabels: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'unread', label: 'Chưa đọc' },
];

export default function NotificationsScreen() {
  const { contentMax } = useResponsive();
  const theme = useTheme();
  const [filter, setFilter] = useState<Filter>('all');
  const [notifList, setNotifList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const items = await notificationService.getNotifications();
      if (items && items.length > 0) {
        setNotifList(items);
      }
    } catch (err) {
      console.warn('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (item: NotificationItem) => {
    if (!item.unread) return;
    setNotifList((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)),
    );
    await notificationService.markAsRead(item.id);
  };

  const items = useMemo(
    () => (filter === 'all' ? notifList : notifList.filter((n) => n.unread)),
    [filter, notifList],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        style={[styles.list, { maxWidth: contentMax }]}
        contentContainerStyle={{
          paddingHorizontal: Spacing.four,
          paddingTop: Spacing.one,
          paddingBottom: BottomTabInset + Spacing.four,
          gap: Spacing.three,
        }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ gap: Spacing.three, marginBottom: Spacing.two }}>
            <ScreenHeader title="Thông báo" />
            <View style={styles.tabRow}>
              {filterLabels.map((t) => {
                const active = filter === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setFilter(t.key)}
                    accessibilityRole="tab"
                    accessibilityLabel={t.label}
                    accessibilityState={{ selected: active }}
                    hitSlop={6}
                  >
                    <ThemedText
                      style={[
                        styles.tab,
                        { color: active ? theme.primary : theme.muted, fontWeight: active ? '700' : '500' },
                      ]}
                    >
                      {t.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={loading ? <SkeletonList count={5} /> : undefined}
        renderItem={({ item, index }) => (
          <FadeIn index={index}>
            <NotificationRow item={item} onPress={() => handleMarkRead(item)} />
          </FadeIn>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { width: '100%', alignSelf: 'center' },
  tabRow: { flexDirection: 'row', gap: Spacing.four },
  tab: { fontSize: FontSizes.base },
});

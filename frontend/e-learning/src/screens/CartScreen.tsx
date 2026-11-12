import { Icon } from '@/components/ui/icon';
import { router } from '@/navigation/routerHook';
import { useMemo, useState, useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { notify } from '@/lib/notify';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/card';
import { CartItemRow } from '@/components/ui/cart-item-row';
import { InfoRow } from '@/components/ui/info-row';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { FontSizes, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { TwoColumn } from '@/components/ui/two-column';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';
import { formatUsd } from '@/utils/format';
import { useAppStore } from '@/store';

export default function CartScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user, cart, removeFromCart } = useAppStore();
  const { isWide, wideMax } = useResponsive();

  const items = cart;
  const [selectedIds, setSelectedIds] = useState<string[]>(() => items.map((i) => i.id));
  useEffect(() => {
    setSelectedIds(items.map((i) => i.id));
  }, [items.length]);

  const isAllSelected = items.length > 0 && selectedIds.length === items.length;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  const summary = useMemo(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    return { subtotal };
  }, [selectedItems]);

  const handleRemove = async (id: string) => {
    const target = items.find((item) => item.id === id);
    const ok = await notify.confirm({
      title: 'Xóa khỏi giỏ hàng?',
      message: target ? `Bạn có chắc muốn xóa "${target.title}" khỏi giỏ hàng?` : undefined,
      confirmLabel: 'Xóa',
      cancelLabel: 'Giữ lại',
      destructive: true,
    });
    if (!ok) return;
    await removeFromCart(id);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
    notify.success('Đã xóa khỏi giỏ hàng', target?.title);
  };

  const goCheckout = () => {
    if (!user) {
      notify.alert(
        'Yêu cầu đăng nhập',
        'Bạn cần đăng nhập tài khoản học viên để tiến hành thanh toán khóa học.',
        [
          { text: 'Để sau', style: 'cancel' },
          { text: 'Đăng nhập ngay', onPress: () => router.push('/login') },
        ]
      );
      return;
    }
    router.push({
      pathname: '/checkout',
      params: {
        ids: selectedItems.map((item) => item.courseId || item.id).join(','),
      },
    });
  };

  const checkoutButton = (
    <PrimaryButton
      label={
        selectedItems.length === 0
          ? 'Chọn khóa học để thanh toán'
          : `Thanh toán (${selectedItems.length}) · ${formatUsd(summary.subtotal)}`
      }
      accessibilityLabel={`Thanh toán ${formatUsd(summary.subtotal)}`}
      disabled={selectedItems.length === 0}
      onPress={goCheckout}
    />
  );

  const listBlock =
    items.length === 0 ? (
      <Card>
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Giỏ hàng trống</Text>
        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
          Khám phá thêm khóa học và thêm vào giỏ hàng của bạn.
        </Text>
        <View style={{ height: Spacing.three }} />
        <PrimaryButton label="Khám phá khóa học" onPress={() => router.push('/search')} />
      </Card>
    ) : (
      <>
        <View style={[styles.selectAllRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isAllSelected }}
            onPress={handleToggleSelectAll}
            style={styles.selectAllBtn}
            hitSlop={8}>
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: isAllSelected ? theme.primary : theme.border,
                  backgroundColor: isAllSelected ? theme.primary : 'transparent',
                },
              ]}>
              {isAllSelected ? <Icon name="check" weight="bold" size={13} color="#ffffff" /> : null}
            </View>
            <Text style={[styles.selectAllText, { color: theme.text }]}>
              Chọn tất cả ({selectedIds.length}/{items.length} khóa học)
            </Text>
          </Pressable>
        </View>

        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            selected={selectedIds.includes(item.id)}
            onToggleSelect={handleToggleSelect}
            onRemove={() => handleRemove(item.id)}
          />
        ))}
      </>
    );

  const summaryCard = (
    <Card>
      <InfoRow label={`Tạm tính (${selectedItems.length} khóa học)`} value={formatUsd(summary.subtotal)} />
      <Text style={[styles.emptyText, { color: theme.textSecondary, marginTop: Spacing.one }]}>
        Mã khuyến mãi được chọn ở bước thanh toán, số tiền cuối cùng do hệ thống tính.
      </Text>
    </Card>
  );

  const rootStyle = [styles.root, { backgroundColor: theme.background, paddingTop: insets.top + Spacing.two }];

  if (isWide) {
    return (
      <View style={rootStyle}>
        <View style={[styles.content, { maxWidth: wideMax }]}>
          <ScreenHeader title="Giỏ hàng" />
        </View>
        <View style={[styles.wideBody, { maxWidth: wideMax }]}>
          <TwoColumn
            main={<View style={{ gap: Spacing.three }}>{listBlock}</View>}
            contentContainerStyle={styles.wideMain}
            aside={
              <>
                {summaryCard}
                {checkoutButton}
              </>
            }
          />
        </View>
      </View>
    );
  }

  return (
    <View style={rootStyle}>
      <View style={styles.content}>
        <ScreenHeader title="Giỏ hàng" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          {listBlock}
          {summaryCard}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + Spacing.three,
            backgroundColor: theme.background,
            borderTopColor: theme.border,
          },
        ]}>
        <View style={styles.footerInner}>{checkoutButton}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  scroll: {
    flex: 1,
  },
  wideBody: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  wideMain: {
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  emptyTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  emptyText: {
    fontSize: FontSizes.sm,
  },
  selectAllRow: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  selectAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  selectAllText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  promoInput: {
    flex: 1,
    fontSize: FontSizes.md,
    paddingVertical: Spacing.one,
  },
  promoButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
  },
  promoButtonLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.two,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  footerInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
});

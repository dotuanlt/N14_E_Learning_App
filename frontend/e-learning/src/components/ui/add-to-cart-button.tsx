import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { notify } from '@/lib/notify';
import { router } from '@/navigation/routerHook';
import { useAppStore } from '@/store';

export type CartSource = {
  id: string;
  title: string;
  author?: string;
  /** Giá bán (số). Thiếu thì để 0, giỏ hàng sẽ được server đồng bộ lại giá thật sau khi thêm. */
  price?: number;
  image?: string;
  tint?: string;
};

type Props = {
  course: CartSource;
  /** full: nút chữ + icon chiếm cả chiều ngang thẻ; icon: nút tròn nhỏ gọn cho dòng danh sách. */
  variant?: 'full' | 'icon';
  style?: StyleProp<ViewStyle>;
};

/**
 * Nút "Thêm vào giỏ" dùng chung cho các thẻ khóa học. Đã có trong giỏ thì chuyển thành "Xem giỏ hàng".
 * Lỗi thật (đã sở hữu khóa học, khóa không còn bán...) được báo bằng toast, không thêm giả vào giỏ.
 */
export function AddToCartButton({ course, variant = 'full', style }: Props) {
  const theme = useTheme();
  const { cart, addToCart } = useAppStore();
  const [busy, setBusy] = useState(false);
  const inCart = cart.some((c) => (c.courseId || c.id) === course.id);

  const onPress = async () => {
    if (busy) return;
    if (inCart) {
      router.push('/cart');
      return;
    }
    try {
      setBusy(true);
      await addToCart({
        id: course.id,
        courseId: course.id,
        title: course.title,
        author: course.author || 'Giảng viên',
        price: course.price ?? 0,
        thumbnailColor: course.tint || '#c9bcff',
        thumbnailLabel: course.title.slice(0, 3).toUpperCase(),
        image: course.image,
      });
      notify.success('Đã thêm vào giỏ hàng', course.title, {
        actionLabel: 'Xem giỏ hàng',
        onAction: () => router.push('/cart'),
      });
    } catch (err: any) {
      notify.error('Không thể thêm vào giỏ', err?.message || 'Vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const bg = inCart ? theme.primarySoft : theme.primary;
  const fg = inCart ? theme.primary : theme.onPrimary;
  const label = inCart ? 'Đã trong giỏ · Xem' : 'Thêm vào giỏ';

  if (variant === 'icon') {
    return (
      <PressableScale
        haptic="light"
        accessibilityRole="button"
        accessibilityLabel={inCart ? 'Xem giỏ hàng' : `Thêm ${course.title} vào giỏ hàng`}
        onPress={onPress}
        hitSlop={6}
        style={[styles.iconBtn, { backgroundColor: bg }, style]}>
        {busy ? <ActivityIndicator size="small" color={fg} /> : <Icon name={inCart ? 'check' : 'cart'} weight={inCart ? 'bold' : 'fill'} size={18} color={fg} />}
      </PressableScale>
    );
  }

  return (
    <PressableScale
      haptic="light"
      accessibilityRole="button"
      accessibilityLabel={inCart ? 'Xem giỏ hàng' : `Thêm ${course.title} vào giỏ hàng`}
      onPress={onPress}
      style={[styles.fullBtn, { backgroundColor: bg }, style]}>
      {busy ? (
        <ActivityIndicator size="small" color={fg} />
      ) : (
        <>
          <Icon name={inCart ? 'check' : 'cart'} weight={inCart ? 'bold' : 'fill'} size={16} color={fg} />
          <Text numberOfLines={1} style={[styles.fullLabel, { color: fg }]}>
            {label}
          </Text>
        </>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  fullBtn: {
    minHeight: 38,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  fullLabel: { fontSize: 13, fontWeight: '800' },
});

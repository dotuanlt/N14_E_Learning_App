import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { cartService } from '@/services/cartService';
import type { CouponOption } from '@/types/payment';
import { formatVnd } from '@/utils/format';

type Props = {
  visible: boolean;
  courseIds: string[];
  selectedCode?: string | null;
  onClose: () => void;
  /** null = bỏ chọn khuyến mãi. */
  onSelect: (code: string | null) => void;
};

function describe(c: CouponOption): string {
  const value = c.discountType === 'PERCENTAGE' ? `Giảm ${Number(c.discountValue)}%` : `Giảm ${formatVnd(c.discountValue)}`;
  const cap = c.discountType === 'PERCENTAGE' && c.maxDiscountAmount ? ` (tối đa ${formatVnd(c.maxDiscountAmount)})` : '';
  return value + cap;
}

/** Danh sách khuyến mãi lấy từ server + ô nhập mã thủ công, mã được kiểm tra bằng báo giá chính thức. */
export function CouponSheet({ visible, courseIds, selectedCode, onClose, onSelect }: Props) {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const [coupons, setCoupons] = useState<CouponOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [manual, setManual] = useState('');
  const [manualError, setManualError] = useState('');
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setCoupons(await cartService.availableCoupons(courseIds));
    } catch (err: any) {
      setLoadError(err?.message || 'Không tải được danh sách khuyến mãi');
    } finally {
      setLoading(false);
    }
  }, [courseIds]);

  useEffect(() => {
    if (visible) {
      setManual('');
      setManualError('');
      load();
    }
  }, [visible, load]);

  const applyManual = async () => {
    const code = manual.trim();
    if (!code) return;
    setChecking(true);
    setManualError('');
    try {
      const q = await cartService.quote(courseIds, code);
      if (q.couponError) setManualError(q.couponError);
      else {
        onSelect(q.couponCode || code);
        onClose();
      }
    } catch (err: any) {
      setManualError(err?.message || 'Không kiểm tra được mã');
    } finally {
      setChecking(false);
    }
  };

  const wide = width >= 600;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.overlay, justifyContent: wide ? 'center' : 'flex-end' }]} onPress={onClose}>
        <Pressable
          onPress={() => undefined}
          style={[
            styles.sheet,
            { backgroundColor: theme.card, maxHeight: height * 0.85, width: wide ? 480 : '100%' },
            wide ? { borderRadius: 24 } : { borderTopLeftRadius: 24, borderTopRightRadius: 24 },
          ]}>
          <View style={styles.head}>
            <Text style={[styles.title, { color: theme.text }]}>Chọn khuyến mãi</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Đóng" hitSlop={10} onPress={onClose}>
              <Icon name="close" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.manualRow}>
            <TextInput
              value={manual}
              onChangeText={(v) => {
                setManual(v.toUpperCase());
                setManualError('');
              }}
              placeholder="Nhập mã khuyến mãi"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={applyManual}
              accessibilityLabel="Nhập mã khuyến mãi"
              style={[styles.manualInput, { color: theme.text, backgroundColor: theme.background, borderColor: manualError ? theme.danger : theme.border }]}
            />
            <PressableScale
              accessibilityRole="button"
              disabled={checking || !manual.trim()}
              onPress={applyManual}
              style={[styles.applyBtn, { backgroundColor: theme.primary, opacity: manual.trim() ? 1 : 0.5 }]}>
              {checking ? <ActivityIndicator color="#ffffff" /> : <Text style={{ color: '#ffffff', fontWeight: '800' }}>Áp dụng</Text>}
            </PressableScale>
          </View>
          {manualError ? <Text style={{ color: theme.danger, fontSize: 12, paddingHorizontal: Spacing.four }}>{manualError}</Text> : null}

          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {loading ? (
              <ActivityIndicator color={theme.primary} style={{ marginVertical: Spacing.four }} />
            ) : loadError ? (
              <View style={{ alignItems: 'center', gap: 8, padding: Spacing.three }}>
                <Text style={{ color: theme.textSecondary, textAlign: 'center' }}>{loadError}</Text>
                <PressableScale accessibilityRole="button" onPress={load} style={[styles.retry, { backgroundColor: theme.primarySoft }]}>
                  <Text style={{ color: theme.primary, fontWeight: '700' }}>Thử lại</Text>
                </PressableScale>
              </View>
            ) : coupons.length === 0 ? (
              <Text style={{ color: theme.textSecondary, textAlign: 'center', padding: Spacing.three }}>
                Hiện chưa có khuyến mãi nào khả dụng.
              </Text>
            ) : (
              coupons.map((c) => {
                const selected = selectedCode?.toUpperCase() === c.code.toUpperCase();
                return (
                  <PressableScale
                    key={c.code}
                    accessibilityRole="radio"
                    accessibilityState={{ selected, disabled: !c.eligible }}
                    disabled={!c.eligible}
                    onPress={() => {
                      onSelect(c.code);
                      onClose();
                    }}
                    style={[
                      styles.coupon,
                      {
                        borderColor: selected ? theme.primary : theme.border,
                        backgroundColor: selected ? theme.primarySoft : theme.background,
                        opacity: c.eligible ? 1 : 0.55,
                      },
                    ]}>
                    <View style={[styles.couponIcon, { backgroundColor: theme.primarySoft }]}>
                      <Icon name="tag" weight="fill" size={20} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={{ color: theme.text, fontWeight: '800', fontSize: 15 }}>{c.code}</Text>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={2}>
                        {c.description || describe(c)}
                      </Text>
                      {c.eligible ? (
                        <Text style={{ color: theme.success, fontSize: 12, fontWeight: '700' }}>
                          Tiết kiệm {formatVnd(c.discount)}
                        </Text>
                      ) : (
                        <Text style={{ color: theme.danger, fontSize: 12 }} numberOfLines={2}>
                          {c.reason || 'Chưa đủ điều kiện'}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.radio, { borderColor: selected ? theme.primary : theme.borderStrong }]}>
                      {selected ? <View style={[styles.radioDot, { backgroundColor: theme.primary }]} /> : null}
                    </View>
                  </PressableScale>
                );
              })
            )}
          </ScrollView>

          {selectedCode ? (
            <PressableScale
              accessibilityRole="button"
              onPress={() => {
                onSelect(null);
                onClose();
              }}
              style={[styles.clear, { borderColor: theme.border }]}>
              <Text style={{ color: theme.text, fontWeight: '700' }}>Không dùng khuyến mãi</Text>
            </PressableScale>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center' },
  sheet: { paddingBottom: Spacing.three },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.four, paddingBottom: Spacing.two },
  title: { fontSize: 18, fontWeight: '800' },
  manualRow: { flexDirection: 'row', gap: Spacing.two, paddingHorizontal: Spacing.four, paddingBottom: Spacing.two },
  manualInput: { flex: 1, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: 11, fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
  applyBtn: { minWidth: 92, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  list: { padding: Spacing.four, paddingTop: Spacing.two, gap: Spacing.two },
  coupon: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: Radius.lg, borderWidth: 1 },
  couponIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  retry: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.pill },
  clear: { marginHorizontal: Spacing.four, minHeight: 46, borderRadius: Radius.lg, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});

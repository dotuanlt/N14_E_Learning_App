import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';

import { BrandLogo } from '@/components/ui/brand-logo';
import { PressableScale } from '@/components/ui/pressable-scale';
import { providerOf } from '@/constants/payment-providers';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { notify } from '@/lib/notify';
import { cartService } from '@/services/cartService';
import type { OrderInfo } from '@/types/payment';
import { formatVnd } from '@/utils/format';

export const DEMO_OTP = '123456';

type Props = {
  visible: boolean;
  provider: string;
  orderCode: string;
  amount: number;
  /** Người dùng đã chọn xong (xác nhận / từ chối) và server đã ghi nhận; order.status = PAID hoặc FAILED. */
  onResult: (order: OrderInfo) => void;
  /** Đóng mà chưa quyết định gì (đơn vẫn chờ thanh toán). */
  onDismiss: () => void;
};

/**
 * Cổng thanh toán giả lập của đồ án. Với ví (MoMo/ZaloPay) đây là "ứng dụng ví" sau khi quét mã;
 * với thẻ có thêm bước nhập OTP (giả lập 3D Secure). Kết quả luôn do server ghi nhận.
 */
export function MockGatewayModal({ visible, provider, orderCode, amount, onResult, onDismiss }: Props) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const info = providerOf(provider);
  const needsOtp = info.kind === 'card';
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [busy, setBusy] = useState<null | 'ok' | 'bad'>(null);

  useEffect(() => {
    if (visible) {
      setOtp('');
      setOtpError('');
      setBusy(null);
    }
  }, [visible]);

  const decide = async (result: 'SUCCESS' | 'FAILED') => {
    if (busy) return;
    if (result === 'SUCCESS' && needsOtp && otp.trim() !== DEMO_OTP) {
      setOtpError(`Mã OTP không đúng. Mã demo: ${DEMO_OTP}`);
      return;
    }
    try {
      setBusy(result === 'SUCCESS' ? 'ok' : 'bad');
      const order = await cartService.mockPay(orderCode, result);
      onResult(order);
    } catch (err: any) {
      notify.error('Không thể xử lý giao dịch', err?.message || 'Vui lòng thử lại.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => {
      if (!busy) onDismiss();
    }} statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.overlay }]} onPress={() => !busy && onDismiss()}>
        <Pressable onPress={() => undefined} style={{ width: Math.min(420, width - 32) }}>
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.header, { backgroundColor: info.color }]}>
              <BrandLogo provider={info.id} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>{info.label}</Text>
                <Text style={styles.headerSub}>{needsOtp ? 'Xác thực giao dịch thẻ (giả lập)' : 'Ứng dụng ví (giả lập)'}</Text>
              </View>
            </View>

            <View style={styles.body}>
              <Text style={[styles.merchant, { color: theme.textSecondary }]}>Thanh toán cho E-Learning Platform</Text>
              <Text style={[styles.amount, { color: theme.text }]}>{formatVnd(amount)}</Text>
              <View style={[styles.orderPill, { backgroundColor: theme.chipBackground }]}>
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Mã đơn</Text>
                <Text style={{ color: theme.text, fontSize: 13, fontWeight: '800' }}>{orderCode}</Text>
              </View>

              {needsOtp ? (
                <View style={{ gap: 6, alignSelf: 'stretch' }}>
                  <Text style={[styles.label, { color: theme.text }]}>Mã OTP</Text>
                  <TextInput
                    value={otp}
                    onChangeText={(v) => {
                      setOtp(v.replace(/\D/g, '').slice(0, 6));
                      setOtpError('');
                    }}
                    placeholder="Nhập 6 chữ số"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="number-pad"
                    maxLength={6}
                    accessibilityLabel="Mã OTP xác thực giao dịch"
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.background, borderColor: otpError ? theme.danger : theme.border },
                    ]}
                  />
                  {otpError ? (
                    <Text style={{ color: theme.danger, fontSize: 12 }}>{otpError}</Text>
                  ) : (
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Mã OTP demo: {DEMO_OTP}</Text>
                  )}
                </View>
              ) : (
                <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
                  Kiểm tra thông tin rồi xác nhận để hoàn tất thanh toán. Đây là môi trường giả lập, không thu tiền thật.
                </Text>
              )}

              <View style={styles.buttons}>
                <PressableScale
                  accessibilityRole="button"
                  disabled={!!busy}
                  onPress={() => decide('FAILED')}
                  style={[styles.btn, { backgroundColor: theme.chipBackground, flex: 1 }]}>
                  {busy === 'bad' ? (
                    <ActivityIndicator color={theme.text} />
                  ) : (
                    <Text style={{ color: theme.text, fontWeight: '800', fontSize: 15 }}>Từ chối</Text>
                  )}
                </PressableScale>
                <PressableScale
                  accessibilityRole="button"
                  disabled={!!busy}
                  onPress={() => decide('SUCCESS')}
                  style={[styles.btn, { backgroundColor: info.color, flex: 1.4 }]}>
                  {busy === 'ok' ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 15 }}>Xác nhận thanh toán</Text>
                  )}
                </PressableScale>
              </View>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  card: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: Spacing.three },
  headerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  body: { padding: Spacing.four, gap: Spacing.three, alignItems: 'center' },
  merchant: { fontSize: 13 },
  amount: { fontSize: 32, fontWeight: '900', letterSpacing: -0.5 },
  orderPill: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.pill },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.three, paddingVertical: 12, fontSize: 18, letterSpacing: 6, textAlign: 'center' },
  buttons: { flexDirection: 'row', gap: Spacing.two, alignSelf: 'stretch', marginTop: Spacing.two },
  btn: { minHeight: 50, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
});

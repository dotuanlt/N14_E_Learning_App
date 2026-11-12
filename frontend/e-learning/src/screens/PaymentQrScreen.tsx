import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { MockGatewayModal } from '@/components/payment/mock-gateway-modal';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { providerOf } from '@/constants/payment-providers';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { notify } from '@/lib/notify';
import { usePaymentSuccess } from '@/lib/payment-flow';
import { goBack } from '@/navigation/navigationRef';
import { useLocalSearchParams } from '@/navigation/routerHook';
import { cartService } from '@/services/cartService';
import type { OrderInfo } from '@/types/payment';
import { formatVnd } from '@/utils/format';

type Phase = 'waiting' | 'failed' | 'expired';

const POLL_MS = 2000;

function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function PaymentQrScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{
    orderCode?: string;
    provider?: string;
    total?: string;
    paymentUrl?: string;
    expiresAt?: string;
    methodLabel?: string;
    ids?: string;
  }>();
  const orderCode = params.orderCode ?? '';
  const info = providerOf(params.provider);
  const total = Number(params.total ?? 0);
  const methodLabel = params.methodLabel || info.label;
  const courseIds = (params.ids ?? '').split(',').filter(Boolean);
  const expiresAtMs = params.expiresAt ? new Date(params.expiresAt).getTime() : NaN;

  const onPaid = usePaymentSuccess();
  const [phase, setPhase] = useState<Phase>('waiting');
  const [failMessage, setFailMessage] = useState('');
  const [remaining, setRemaining] = useState<number>(Number.isFinite(expiresAtMs) ? expiresAtMs - Date.now() : 15 * 60 * 1000);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const handled = useRef(false);

  const handleOrder = useCallback(
    (order: OrderInfo) => {
      if (handled.current) return;
      if (order.status === 'PAID') {
        handled.current = true;
        onPaid(order, courseIds, methodLabel);
      } else if (order.status === 'FAILED' || order.status === 'CANCELLED') {
        handled.current = true;
        setFailMessage(
          order.status === 'FAILED' ? 'Giao dịch bị từ chối hoặc không thành công.' : 'Đơn hàng đã bị hủy hoặc hết hạn.',
        );
        setPhase('failed');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onPaid, methodLabel, params.ids],
  );

  // Hỏi server định kỳ: dù người dùng xác nhận ở điện thoại khác (quét QR thật) hay bằng nút mô phỏng,
  // thanh toán chỉ được coi là thành công khi server ghi nhận PAID.
  useEffect(() => {
    if (!orderCode || phase !== 'waiting') return;
    let stopped = false;
    const tick = async () => {
      try {
        const order = await cartService.getOrder(orderCode);
        if (!stopped) handleOrder(order);
      } catch {
        // mạng chập chờn: thử lại ở nhịp sau
      }
    };
    tick();
    const timer = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [orderCode, phase, handleOrder]);

  // Đếm ngược tới hạn thanh toán.
  useEffect(() => {
    if (phase !== 'waiting' || !Number.isFinite(expiresAtMs)) return;
    const timer = setInterval(() => {
      const left = expiresAtMs - Date.now();
      setRemaining(left);
      if (left <= 0 && !handled.current) {
        clearInterval(timer);
        // lần kiểm tra cuối: nếu server đã nhận tiền thì vẫn thành công
        cartService
          .getOrder(orderCode)
          .then((o) => {
            handleOrder(o);
            if (!handled.current) setPhase('expired');
          })
          .catch(() => setPhase('expired'));
      }
    }, 500);
    return () => clearInterval(timer);
  }, [phase, expiresAtMs, orderCode, handleOrder]);

  const cancelPayment = useCallback(async () => {
    if (phase !== 'waiting') {
      goBack();
      return;
    }
    const ok = await notify.confirm({
      title: 'Hủy thanh toán?',
      message: 'Đơn hàng sẽ bị hủy. Bạn có thể quay lại giỏ hàng và thanh toán lại bất cứ lúc nào.',
      confirmLabel: 'Hủy thanh toán',
      cancelLabel: 'Tiếp tục chờ',
      destructive: true,
    });
    if (!ok) return;
    handled.current = true;
    try {
      await cartService.mockPay(orderCode, 'FAILED'); // báo server hủy để đơn không treo tới khi hết hạn
    } catch {
      // đơn sẽ tự hết hạn
    }
    goBack();
  }, [phase, orderCode]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      cancelPayment();
      return true;
    });
    return () => sub.remove();
  }, [cancelPayment]);

  const url = params.paymentUrl ?? '';
  const localhostWarning = /\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)/.test(url);

  return (
    <Screen>
      <ScreenHeader title="Quét mã thanh toán" onBack={cancelPayment} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {phase === 'waiting' ? (
          <>
            <Card style={styles.qrCard}>
              <View style={styles.providerRow}>
                <BrandLogo provider={info.id} size={44} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.providerName, { color: theme.text }]}>{info.label}</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Mã đơn {orderCode}</Text>
                </View>
                <View style={[styles.timer, { backgroundColor: remaining < 60_000 ? theme.danger : theme.primarySoft }]}>
                  <Icon name="clock" size={14} color={remaining < 60_000 ? '#ffffff' : theme.primary} />
                  <Text style={{ color: remaining < 60_000 ? '#ffffff' : theme.primary, fontWeight: '800', fontSize: 13 }}>
                    {formatClock(remaining)}
                  </Text>
                </View>
              </View>

              <View style={styles.qrBox}>
                {url ? <QRCode value={url} size={220} color="#181528" backgroundColor="#ffffff" quietZone={10} /> : null}
              </View>

              <Text style={[styles.amount, { color: theme.text }]}>{formatVnd(total)}</Text>
              <View style={styles.waitRow}>
                <ActivityIndicator size="small" color={info.color} />
                <Text style={{ color: theme.textSecondary, fontSize: 13 }}>Đang chờ bạn quét mã và xác nhận thanh toán…</Text>
              </View>
            </Card>

            <Card style={{ gap: Spacing.two }}>
              <Text style={[styles.stepsTitle, { color: theme.text }]}>Cách thanh toán</Text>
              {[
                `Mở ứng dụng ${info.short} trên điện thoại và chọn Quét mã.`,
                'Quét mã QR ở trên, kiểm tra số tiền rồi bấm Xác nhận thanh toán.',
                'Hệ thống tự ghi nhận khi giao dịch hoàn tất, bạn không cần thao tác thêm.',
              ].map((t, i) => (
                <View key={i} style={styles.step}>
                  <View style={[styles.stepNum, { backgroundColor: theme.primarySoft }]}>
                    <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 13, flex: 1, lineHeight: 19 }}>{t}</Text>
                </View>
              ))}
              {localhostWarning ? (
                <Text style={{ color: theme.danger, fontSize: 12, lineHeight: 18 }}>
                  Lưu ý (môi trường dev): địa chỉ trong mã QR là localhost nên điện thoại khác không mở được. Hãy đặt
                  app.public-base-url ở backend bằng IP LAN của máy chạy server, hoặc dùng nút mô phỏng bên dưới.
                </Text>
              ) : null}
            </Card>

            <View style={{ gap: Spacing.two }}>
              <PrimaryButton label="Mô phỏng quét mã" onPress={() => setGatewayOpen(true)} />
              <PrimaryButton label="Hủy thanh toán" variant="outline" onPress={cancelPayment} />
            </View>
          </>
        ) : (
          <Card style={styles.resultCard}>
            <View style={[styles.resultIcon, { backgroundColor: theme.danger + '22' }]}>
              <Icon name={phase === 'expired' ? 'clock' : 'warning'} weight="fill" size={36} color={theme.danger} />
            </View>
            <Text style={[styles.resultTitle, { color: theme.text }]}>
              {phase === 'expired' ? 'Mã thanh toán đã hết hạn' : 'Thanh toán không thành công'}
            </Text>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
              {phase === 'expired'
                ? 'Đơn hàng quá thời gian chờ nên đã bị hủy. Bạn chưa bị trừ tiền.'
                : failMessage || 'Giao dịch chưa hoàn tất. Bạn chưa bị trừ tiền.'}
            </Text>
            <View style={{ alignSelf: 'stretch', gap: Spacing.two, marginTop: Spacing.two }}>
              <PrimaryButton label="Thử thanh toán lại" onPress={() => goBack()} />
            </View>
          </Card>
        )}
      </ScrollView>

      <MockGatewayModal
        visible={gatewayOpen}
        provider={info.id}
        orderCode={orderCode}
        amount={total}
        onDismiss={() => setGatewayOpen(false)}
        onResult={(order) => {
          setGatewayOpen(false);
          handleOrder(order);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, paddingBottom: Spacing.six, gap: Spacing.three },
  qrCard: { alignItems: 'center', gap: Spacing.three },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'stretch' },
  providerName: { fontSize: 16, fontWeight: '800' },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.pill },
  qrBox: { backgroundColor: '#ffffff', padding: 10, borderRadius: Radius.lg, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e3f3' },
  amount: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  waitRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepsTitle: { fontSize: 15, fontWeight: '800', marginBottom: 2 },
  step: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  stepNum: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  resultCard: { alignItems: 'center', gap: Spacing.three, paddingVertical: Spacing.five },
  resultIcon: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  resultTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
});

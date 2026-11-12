import { router, useLocalSearchParams } from '@/navigation/routerHook';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CouponSheet } from '@/components/payment/coupon-sheet';
import { MockGatewayModal } from '@/components/payment/mock-gateway-modal';
import { BrandLogo } from '@/components/ui/brand-logo';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { InfoRow } from '@/components/ui/info-row';
import { PaymentMethodRow } from '@/components/ui/payment-method-row';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SectionTitle } from '@/components/ui/section-title';
import { TwoColumn } from '@/components/ui/two-column';
import { PAYMENT_PROVIDERS, PROVIDER_ORDER, providerOf } from '@/constants/payment-providers';
import { FontSizes, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useSavedPayments } from '@/hooks/use-saved-payments';
import { useTheme } from '@/hooks/use-theme';
import { notify } from '@/lib/notify';
import { usePaymentSuccess } from '@/lib/payment-flow';
import { cartService } from '@/services/cartService';
import { useAppStore } from '@/store';
import type { OrderInfo, PaymentProvider, Quote } from '@/types/payment';
import { formatCardNumber, formatExpiry, formatVnd } from '@/utils/format';

function isValidExpiry(value: string): boolean {
  const m = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const now = new Date();
  return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth() + 1);
}

export default function CheckoutScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { cart } = useAppStore();
  const { isWide, wideMax } = useResponsive();
  const params = useLocalSearchParams<{ ids?: string; couponCode?: string }>();
  const onPaid = usePaymentSuccess();
  const saved = useSavedPayments();

  // Chỉ thanh toán các khóa học được chọn ở giỏ hàng (nếu có truyền sang).
  const activeItems = useMemo(() => {
    if (!params.ids) return cart;
    const wanted = new Set(params.ids.split(',').filter(Boolean));
    return cart.filter((item) => wanted.has(item.courseId || item.id));
  }, [cart, params.ids]);
  const courseIds = useMemo(() => activeItems.map((item) => item.courseId || item.id), [activeItems]);
  const idsKey = courseIds.join(',');

  const [provider, setProvider] = useState<PaymentProvider>('card');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [walletPhone, setWalletPhone] = useState('');
  const [saveMethod, setSaveMethod] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [couponCode, setCouponCode] = useState<string | null>(params.couponCode || null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState('');

  const [paying, setPaying] = useState(false);
  const [gatewayOrder, setGatewayOrder] = useState<OrderInfo | null>(null);

  const info = providerOf(provider);
  const selectedSaved = saved.items.find((m) => m.id === savedId) ?? null;
  const methodLabel = selectedSaved ? selectedSaved.label : info.label;

  // Số tiền luôn lấy từ báo giá của server để khớp 100% với đơn hàng được tạo.
  const loadQuote = useCallback(async () => {
    if (courseIds.length === 0) {
      setQuote(null);
      return;
    }
    setQuoting(true);
    setQuoteError('');
    try {
      const q = await cartService.quote(courseIds, couponCode || undefined);
      setQuote(q);
      if (q.couponError) {
        notify.warning('Không áp dụng được khuyến mãi', q.couponError);
        setCouponCode(null);
      }
    } catch (err: any) {
      setQuote(null);
      setQuoteError(err?.message || 'Không tính được số tiền thanh toán');
    } finally {
      setQuoting(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey, couponCode]);

  useEffect(() => {
    loadQuote();
  }, [loadQuote]);

  const selectProvider = (id: PaymentProvider) => {
    setProvider(id);
    setSavedId(null);
    setErrors({});
    setSaveMethod(false);
  };

  const selectSaved = (id: string) => {
    const item = saved.items.find((m) => m.id === id);
    if (!item) return;
    setProvider(item.provider);
    setSavedId(id);
    setErrors({});
    setSaveMethod(false);
  };

  const removeSaved = async (id: string) => {
    const item = saved.items.find((m) => m.id === id);
    const ok = await notify.confirm({
      title: 'Xóa phương thức đã lưu?',
      message: item ? `Bạn có chắc muốn xóa "${item.label}"?` : undefined,
      confirmLabel: 'Xóa',
      cancelLabel: 'Giữ lại',
      destructive: true,
    });
    if (!ok) return;
    saved.remove(id);
    if (savedId === id) setSavedId(null);
    notify.success('Đã xóa phương thức thanh toán');
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!selectedSaved) {
      if (info.kind === 'card') {
        const digits = cardNumber.replace(/\D/g, '');
        if (digits.length < 13) next.cardNumber = 'Số thẻ chưa đủ chữ số';
        if (!isValidExpiry(expiry)) next.expiry = 'Ngày hết hạn không hợp lệ';
        if (!/^\d{3,4}$/.test(cvv)) next.cvv = 'CVV gồm 3-4 chữ số';
      } else if (saveMethod && !/^0\d{9}$/.test(walletPhone.replace(/\D/g, ''))) {
        next.phone = 'Số điện thoại gồm 10 chữ số, bắt đầu bằng 0';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const finishPaid = async (order: OrderInfo) => {
    await onPaid(order, courseIds, methodLabel);
  };

  const handlePay = async () => {
    if (!quote || paying) return;
    if (!validate()) return;
    const ok = await notify.confirm({
      title: 'Xác nhận thanh toán?',
      message: `Thanh toán ${formatVnd(quote.totalAmount)} bằng ${methodLabel} cho ${activeItems.length} khóa học.`,
      confirmLabel: 'Thanh toán',
      cancelLabel: 'Xem lại',
    });
    if (!ok) return;

    try {
      setPaying(true);
      const order = await cartService.createOrder({
        courseIds,
        provider,
        couponCode: quote.couponCode || undefined,
      });

      if (saveMethod && !selectedSaved) {
        if (info.kind === 'card') saved.saveCard(cardNumber, holder, expiry);
        else saved.saveWallet(provider as Exclude<PaymentProvider, 'card'>, walletPhone);
        notify.success('Đã lưu phương thức thanh toán');
      }

      if (order.status === 'PAID') {
        // Đơn 0 đ (được miễn phí hoàn toàn): server ghi danh ngay, không cần cổng.
        await finishPaid(order);
        return;
      }
      if (info.kind === 'wallet') {
        router.push({
          pathname: '/payment-qr',
          params: {
            orderCode: order.orderCode,
            provider,
            total: String(order.totalAmount),
            paymentUrl: order.paymentUrl ?? '',
            expiresAt: order.expiresAt ?? '',
            methodLabel,
            ids: idsKey,
          },
        });
      } else {
        setGatewayOrder(order);
      }
    } catch (err: any) {
      // Không còn "thành công giả": lỗi thật thì báo lỗi thật và giữ nguyên giỏ hàng.
      notify.error('Không thể tạo đơn hàng', err?.message || 'Vui lòng thử lại sau.');
    } finally {
      setPaying(false);
    }
  };

  const inputStyle = (hasError?: boolean) => [
    styles.input,
    { color: theme.text, backgroundColor: theme.backgroundElement, borderColor: hasError ? theme.danger : theme.border },
  ];
  const fieldError = (key: string) =>
    errors[key] ? <Text style={{ color: theme.danger, fontSize: FontSizes.xs }}>{errors[key]}</Text> : null;

  const methodsBlock = (
    <>
      {saved.items.length > 0 ? (
        <>
          <SectionTitle>Phương thức đã lưu</SectionTitle>
          <View style={styles.methods}>
            {saved.items.map((m) => {
              const selected = savedId === m.id;
              return (
                <PressableScale
                  key={m.id}
                  haptic="selection"
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={m.label}
                  onPress={() => selectSaved(m.id)}
                  style={[
                    styles.savedRow,
                    { backgroundColor: theme.backgroundElement, borderColor: selected ? theme.primary : theme.border },
                  ]}>
                  <BrandLogo provider={m.provider} size={40} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: FontSizes.md, fontWeight: '600' }}>{m.label}</Text>
                    {m.expiry ? (
                      <Text style={{ color: theme.textSecondary, fontSize: FontSizes.xs }}>Hết hạn {m.expiry}</Text>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Xóa ${m.label}`}
                    hitSlop={10}
                    onPress={() => removeSaved(m.id)}>
                    <Icon name="trash" size={18} color={theme.textSecondary} />
                  </Pressable>
                  <View style={[styles.radio, { borderColor: selected ? theme.primary : theme.borderStrong }]}>
                    {selected ? <View style={[styles.radioDot, { backgroundColor: theme.primary }]} /> : null}
                  </View>
                </PressableScale>
              );
            })}
          </View>
        </>
      ) : null}

      <SectionTitle>{saved.items.length > 0 ? 'Hoặc chọn phương thức khác' : 'Phương thức thanh toán'}</SectionTitle>
      <View style={styles.methods}>
        {PROVIDER_ORDER.map((id) => (
          <PaymentMethodRow
            key={id}
            method={{ id, label: PAYMENT_PROVIDERS[id].label, icon: '', iconBackground: PAYMENT_PROVIDERS[id].color }}
            selected={provider === id && !savedId}
            onSelect={() => selectProvider(id)}
          />
        ))}
      </View>

      {!selectedSaved && info.kind === 'card' ? (
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Số thẻ</Text>
            <TextInput
              value={cardNumber}
              onChangeText={(v) => setCardNumber(formatCardNumber(v))}
              placeholder="1234 5678 9012 3456"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              maxLength={19}
              accessibilityLabel="Số thẻ"
              style={inputStyle(!!errors.cardNumber)}
            />
            {fieldError('cardNumber')}
          </View>
          <View style={styles.field}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>Tên chủ thẻ (không bắt buộc)</Text>
            <TextInput
              value={holder}
              onChangeText={(v) => setHolder(v.toUpperCase())}
              placeholder="NGUYEN VAN A"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="characters"
              accessibilityLabel="Tên chủ thẻ"
              style={inputStyle()}
            />
          </View>
          <View style={styles.rowFields}>
            <View style={[styles.field, styles.flexField]}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Hết hạn</Text>
              <TextInput
                value={expiry}
                onChangeText={(v) => setExpiry(formatExpiry(v))}
                placeholder="MM/YY"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                maxLength={5}
                accessibilityLabel="Ngày hết hạn thẻ"
                style={inputStyle(!!errors.expiry)}
              />
              {fieldError('expiry')}
            </View>
            <View style={[styles.field, styles.flexField]}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>CVV</Text>
              <TextInput
                value={cvv}
                onChangeText={(v) => setCvv(v.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                maxLength={4}
                secureTextEntry
                accessibilityLabel="Mã bảo mật CVV"
                style={inputStyle(!!errors.cvv)}
              />
              {fieldError('cvv')}
            </View>
          </View>
        </View>
      ) : null}

      {!selectedSaved && info.kind === 'wallet' ? (
        <Card style={{ gap: Spacing.two }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Icon name="info" size={18} color={theme.primary} />
            <Text style={{ color: theme.textSecondary, fontSize: FontSizes.sm, flex: 1, lineHeight: 19 }}>
              Sau khi bấm thanh toán, bạn sẽ quét mã QR bằng ứng dụng {info.short} để xác nhận giao dịch.
            </Text>
          </View>
        </Card>
      ) : null}

      {!selectedSaved ? (
        <View style={{ gap: Spacing.two }}>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: saveMethod }}
            onPress={() => setSaveMethod((v) => !v)}
            style={styles.saveRow}
            hitSlop={6}>
            <View
              style={[
                styles.checkbox,
                { borderColor: saveMethod ? theme.primary : theme.border, backgroundColor: saveMethod ? theme.primary : 'transparent' },
              ]}>
              {saveMethod ? <Icon name="check" weight="bold" size={13} color="#ffffff" /> : null}
            </View>
            <Text style={{ color: theme.text, fontSize: FontSizes.sm, fontWeight: '600', flex: 1 }}>
              {info.kind === 'card' ? 'Lưu thẻ này cho lần sau (chỉ lưu 4 số cuối)' : `Lưu ví ${info.short} để chọn nhanh lần sau`}
            </Text>
          </Pressable>
          {saveMethod && info.kind === 'wallet' ? (
            <View style={styles.field}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Số điện thoại ví</Text>
              <TextInput
                value={walletPhone}
                onChangeText={(v) => setWalletPhone(v.replace(/\D/g, '').slice(0, 10))}
                placeholder="09xxxxxxxx"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
                maxLength={10}
                accessibilityLabel="Số điện thoại ví"
                style={inputStyle(!!errors.phone)}
              />
              {fieldError('phone')}
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );

  const couponBlock = (
    <PressableScale
      accessibilityRole="button"
      accessibilityLabel="Chọn khuyến mãi"
      onPress={() => setCouponOpen(true)}
      style={[styles.couponRow, { backgroundColor: theme.backgroundElement, borderColor: quote?.couponCode ? theme.primary : theme.border }]}>
      <View style={[styles.couponIcon, { backgroundColor: theme.primarySoft }]}>
        <Icon name="tag" weight="fill" size={20} color={theme.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontWeight: '700', fontSize: FontSizes.md }}>
          {quote?.couponCode ? quote.couponCode : 'Chọn hoặc nhập mã khuyến mãi'}
        </Text>
        <Text style={{ color: quote?.couponCode ? theme.success : theme.textSecondary, fontSize: FontSizes.xs }}>
          {quote?.couponCode ? `Tiết kiệm ${formatVnd(quote.discountAmount)}` : 'Xem các ưu đãi đang có'}
        </Text>
      </View>
      <Icon name="forward" size={16} color={theme.textSecondary} />
    </PressableScale>
  );

  const summaryBlock = (
    <>
      <SectionTitle>Chi tiết thanh toán</SectionTitle>
      <Card>
        {activeItems.map((item) => (
          <InfoRow key={item.id} label={item.title} value={formatVnd(Number(item.price) || 0)} />
        ))}
        <View style={[styles.divider, { backgroundColor: theme.borderStrong }]} />
        {quoting && !quote ? (
          <ActivityIndicator color={theme.primary} style={{ marginVertical: Spacing.two }} />
        ) : quote ? (
          <>
            <InfoRow label="Tạm tính" value={formatVnd(quote.subtotal)} />
            <InfoRow
              label={quote.couponCode ? `Khuyến mãi ${quote.couponCode}` : 'Khuyến mãi'}
              value={formatVnd(-quote.discountAmount)}
            />
            <View style={[styles.divider, { backgroundColor: theme.borderStrong }]} />
            <InfoRow label="Tổng thanh toán" value={formatVnd(quote.totalAmount)} emphasis />
          </>
        ) : (
          <View style={{ gap: Spacing.two, alignItems: 'center' }}>
            <Text style={{ color: theme.danger, textAlign: 'center', fontSize: FontSizes.sm }}>
              {quoteError || (courseIds.length === 0 ? 'Chưa có khóa học nào để thanh toán.' : 'Chưa có số tiền thanh toán.')}
            </Text>
            {courseIds.length > 0 ? (
              <PrimaryButton label="Tính lại" variant="soft" onPress={loadQuote} />
            ) : null}
          </View>
        )}
      </Card>
    </>
  );

  const payDisabled = paying || quoting || !quote || courseIds.length === 0;
  const payButton = (
    <PrimaryButton
      label={paying ? 'Đang xử lý...' : quote ? `Thanh toán · ${formatVnd(quote.totalAmount)}` : 'Thanh toán'}
      accessibilityLabel={quote ? `Thanh toán ${formatVnd(quote.totalAmount)}` : 'Thanh toán'}
      onPress={handlePay}
      disabled={payDisabled}
    />
  );

  const rootStyle = [styles.root, { backgroundColor: theme.background, paddingTop: insets.top + Spacing.two }];

  const modals = (
    <>
      <CouponSheet
        visible={couponOpen}
        courseIds={courseIds}
        selectedCode={quote?.couponCode ?? couponCode}
        onClose={() => setCouponOpen(false)}
        onSelect={setCouponCode}
      />
      {gatewayOrder ? (
        <MockGatewayModal
          visible
          provider={provider}
          orderCode={gatewayOrder.orderCode}
          amount={gatewayOrder.totalAmount}
          onDismiss={() => setGatewayOrder(null)}
          onResult={(order) => {
            setGatewayOrder(null);
            if (order.status === 'PAID') finishPaid(order);
            else notify.error('Thanh toán không thành công', 'Giao dịch bị từ chối hoặc không hoàn tất. Bạn chưa bị trừ tiền.');
          }}
        />
      ) : null}
    </>
  );

  if (isWide) {
    return (
      <View style={rootStyle}>
        <View style={[styles.content, { maxWidth: wideMax }]}>
          <ScreenHeader title="Thanh toán" />
        </View>
        <View style={[styles.wideBody, { maxWidth: wideMax }]}>
          <TwoColumn
            main={<View style={{ gap: Spacing.three }}>{methodsBlock}</View>}
            contentContainerStyle={styles.wideMain}
            aside={
              <>
                {couponBlock}
                {summaryBlock}
                {payButton}
              </>
            }
          />
        </View>
        {modals}
      </View>
    );
  }

  return (
    <View style={rootStyle}>
      <View style={styles.content}>
        <ScreenHeader title="Thanh toán" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.column}>
          {methodsBlock}
          <SectionTitle>Khuyến mãi</SectionTitle>
          {couponBlock}
          {summaryBlock}
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + Spacing.three, backgroundColor: theme.background, borderTopColor: theme.border },
        ]}>
        <View style={styles.footerInner}>{payButton}</View>
      </View>
      {modals}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', paddingHorizontal: Spacing.three },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.five },
  wideBody: { flex: 1, width: '100%', alignSelf: 'center', paddingHorizontal: Spacing.three },
  wideMain: { paddingTop: Spacing.three, paddingBottom: Spacing.five },
  column: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', gap: Spacing.three },
  methods: { gap: Spacing.two },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  form: { gap: Spacing.two },
  field: { gap: Spacing.one },
  fieldLabel: { fontSize: FontSizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    fontSize: FontSizes.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  rowFields: { flexDirection: 'row', gap: Spacing.two },
  flexField: { flex: 1 },
  saveRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  checkbox: { width: 20, height: 20, borderRadius: Radius.sm, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  couponIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.two },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three, paddingHorizontal: Spacing.three },
  footerInner: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
});

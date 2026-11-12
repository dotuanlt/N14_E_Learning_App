import type { PaymentProvider } from '@/types/payment';

export type ProviderInfo = {
  id: PaymentProvider;
  label: string;
  /** Tên ngắn dùng trong dòng tóm tắt / thông báo. */
  short: string;
  kind: 'card' | 'wallet';
  /** Màu nhận diện (nền ô logo, thanh tiêu đề cổng giả lập). */
  color: string;
  /** Chữ cái hiển thị khi chưa có file logo. */
  monogram: string;
  description: string;
};

export const PAYMENT_PROVIDERS: Record<PaymentProvider, ProviderInfo> = {
  card: {
    id: 'card',
    label: 'Thẻ ngân hàng',
    short: 'Thẻ ngân hàng',
    kind: 'card',
    color: '#0f766e',
    monogram: '',
    description: 'Visa, Mastercard, thẻ nội địa',
  },
  momo: {
    id: 'momo',
    label: 'Ví MoMo',
    short: 'MoMo',
    kind: 'wallet',
    color: '#a50064',
    monogram: 'M',
    description: 'Quét mã QR bằng ứng dụng MoMo',
  },
  zalopay: {
    id: 'zalopay',
    label: 'ZaloPay',
    short: 'ZaloPay',
    kind: 'wallet',
    color: '#0068ff',
    monogram: 'Z',
    description: 'Quét mã QR bằng ứng dụng ZaloPay',
  },
};

export const PROVIDER_ORDER: PaymentProvider[] = ['card', 'momo', 'zalopay'];

export function providerOf(value?: string | null): ProviderInfo {
  const key = String(value || 'card').toLowerCase() as PaymentProvider;
  return PAYMENT_PROVIDERS[key] ?? PAYMENT_PROVIDERS.card;
}

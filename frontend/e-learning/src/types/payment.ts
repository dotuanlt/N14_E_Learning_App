export type PaymentProvider = 'card' | 'momo' | 'zalopay';

export type Quote = {
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  couponDescription?: string | null;
  /** Có giá trị khi mã gửi lên không hợp lệ (báo giá đã tính không mã). */
  couponError?: string | null;
};

export type CouponOption = {
  code: string;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | string;
  discountValue: number;
  minOrderValue?: number | null;
  maxDiscountAmount?: number | null;
  endAt?: string | null;
  eligible: boolean;
  discount: number;
  reason?: string | null;
};

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | string;

export type OrderInfo = {
  orderCode: string;
  status: OrderStatus;
  method?: string | null;
  provider?: string | null;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string | null;
  expiresAt?: string | null;
  paidAt?: string | null;
  paymentUrl?: string | null;
};

/** Phương thức đã lưu: chỉ giữ thông tin đã che bớt, tuyệt đối không lưu số thẻ đầy đủ / CVV. */
export type SavedPaymentMethod = {
  id: string;
  provider: PaymentProvider;
  /** Nhãn hiển thị, ví dụ "Visa •••• 4242" hoặc "MoMo 09•••••123". */
  label: string;
  last4?: string;
  cardBrand?: string;
  holder?: string;
  expiry?: string;
  phoneMasked?: string;
  createdAt: number;
};

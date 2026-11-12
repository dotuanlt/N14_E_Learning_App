import { useCallback } from 'react';

import { resetToCheckoutSuccess } from '@/navigation/navigationRef';
import { useAppStore } from '@/store';
import type { OrderInfo } from '@/types/payment';

/**
 * Xử lý chung khi đơn đã được ghi nhận PAID (từ cổng thẻ hoặc màn QR): dọn giỏ, làm mới dữ liệu người dùng
 * rồi chuyển sang màn thành công và bỏ các màn thanh toán khỏi ngăn xếp.
 */
export function usePaymentSuccess() {
  const { removeFromCart, refreshUserData } = useAppStore();

  return useCallback(
    async (order: OrderInfo, courseIds: string[], methodLabel: string) => {
      resetToCheckoutSuccess({
        orderId: order.orderCode,
        method: methodLabel,
        total: String(order.totalAmount),
      });
      // chạy sau khi đã chuyển màn để người dùng không phải chờ
      await Promise.all(courseIds.map((id) => removeFromCart(id)));
      await refreshUserData();
    },
    [removeFromCart, refreshUserData],
  );
}

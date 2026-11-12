import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/storage';
import { useAppStore } from '@/store';
import type { PaymentProvider, SavedPaymentMethod } from '@/types/payment';

export function detectCardBrand(digits: string): string {
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  if (/^35/.test(digits)) return 'JCB';
  if (/^9704/.test(digits)) return 'Thẻ nội địa';
  return 'Thẻ';
}

export function maskPhone(phone: string): string {
  const d = phone.replace(/\D/g, '');
  if (d.length < 7) return d;
  return `${d.slice(0, 2)}${'•'.repeat(d.length - 5)}${d.slice(-3)}`;
}

/**
 * Phương thức thanh toán đã lưu, giữ trên thiết bị theo từng tài khoản.
 * Chỉ lưu thông tin đã che (4 số cuối, số điện thoại che giữa); không bao giờ lưu số thẻ đầy đủ hay CVV.
 */
export function useSavedPayments() {
  const { user } = useAppStore();
  const key = `saved_payments_v1:${user?.id ?? 'guest'}`;
  const [items, setItems] = useState<SavedPaymentMethod[]>([]);

  useEffect(() => {
    let mounted = true;
    storage.getItem<SavedPaymentMethod[]>(key).then((v) => {
      if (mounted) setItems(Array.isArray(v) ? v : []);
    });
    return () => {
      mounted = false;
    };
  }, [key]);

  const persist = useCallback(
    (next: SavedPaymentMethod[]) => {
      setItems(next);
      storage.setItem(key, next);
    },
    [key],
  );

  const saveCard = useCallback(
    (cardNumber: string, holder: string, expiry: string) => {
      const digits = cardNumber.replace(/\D/g, '');
      const last4 = digits.slice(-4);
      const brand = detectCardBrand(digits);
      const existing = items.find((m) => m.provider === 'card' && m.last4 === last4 && m.cardBrand === brand);
      if (existing) return existing;
      const method: SavedPaymentMethod = {
        id: `card-${Date.now()}`,
        provider: 'card',
        label: `${brand} •••• ${last4}`,
        last4,
        cardBrand: brand,
        holder: holder.trim() || undefined,
        expiry,
        createdAt: Date.now(),
      };
      persist([method, ...items]);
      return method;
    },
    [items, persist],
  );

  const saveWallet = useCallback(
    (provider: Exclude<PaymentProvider, 'card'>, phone: string) => {
      const masked = maskPhone(phone);
      const existing = items.find((m) => m.provider === provider && m.phoneMasked === masked);
      if (existing) return existing;
      const name = provider === 'momo' ? 'MoMo' : 'ZaloPay';
      const method: SavedPaymentMethod = {
        id: `${provider}-${Date.now()}`,
        provider,
        label: `${name} ${masked}`,
        phoneMasked: masked,
        createdAt: Date.now(),
      };
      persist([method, ...items]);
      return method;
    },
    [items, persist],
  );

  const remove = useCallback((id: string) => persist(items.filter((m) => m.id !== id)), [items, persist]);

  return { items, saveCard, saveWallet, remove };
}

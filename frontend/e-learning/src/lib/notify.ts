import { Alert, Platform } from 'react-native';

/**
 * Thông báo toàn ứng dụng, gọi được từ bất kỳ đâu (kể cả ngoài component):
 *  - notify.success/error/info/warning: toast góc phải màn hình, tự tắt;
 *  - notify.confirm: hộp thoại Đồng ý / Hủy, trả về Promise<boolean>;
 *  - notify.alert: thay thế Alert.alert (React Native Web KHÔNG hiển thị Alert.alert nên trước đây trên web
 *    các thông báo bị mất hẳn).
 * Giao diện do <FeedbackHost /> vẽ; chưa gắn host thì rơi về Alert/confirm gốc.
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** ms; 0 = không tự tắt. */
  duration?: number;
}

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export type DialogVariant = 'info' | 'success' | 'warning' | 'danger';

export interface DialogOptions {
  title: string;
  message?: string;
  buttons: DialogButton[];
  variant?: DialogVariant;
  /** Chạm nền / bấm Esc để đóng (chạy nút kiểu cancel nếu có). */
  cancelable?: boolean;
}

interface Driver {
  toast(options: ToastOptions): void;
  dialog(options: DialogOptions): void;
}

let driver: Driver | null = null;

export function registerNotifier(next: Driver | null) {
  driver = next;
}

function inferType(title: string): ToastType {
  const t = title.toLowerCase();
  if (/^(lỗi|không thể|thất bại)|thất bại|không hợp lệ|không đúng|không khớp/.test(t)) return 'error';
  if (/^(thành công|đã )|thành công/.test(t)) return 'success';
  if (/yêu cầu|thiếu|chưa |vui lòng/.test(t)) return 'warning';
  return 'info';
}

function toastFallback(o: ToastOptions) {
  const text = [o.title, o.message].filter(Boolean).join('\n');
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') window.alert(text);
  } else {
    Alert.alert(o.title, o.message);
  }
}

function dialogFallback(o: DialogOptions) {
  if (Platform.OS === 'web') {
    const text = [o.title, o.message].filter(Boolean).join('\n\n');
    if (typeof window === 'undefined') return;
    const cancel = o.buttons.find((b) => b.style === 'cancel');
    const action = o.buttons.find((b) => b.style !== 'cancel') ?? o.buttons[0];
    if (o.buttons.length > 1) {
      if (window.confirm(text)) action?.onPress?.();
      else cancel?.onPress?.();
    } else {
      window.alert(text);
      o.buttons[0]?.onPress?.();
    }
  } else {
    Alert.alert(o.title, o.message, o.buttons as any);
  }
}

function toast(o: ToastOptions) {
  if (driver) driver.toast(o);
  else toastFallback(o);
}

function dialog(o: DialogOptions) {
  if (driver) driver.dialog(o);
  else dialogFallback(o);
}

export const notify = {
  toast,
  success: (title: string, message?: string, extra?: Partial<ToastOptions>) =>
    toast({ type: 'success', title, message, ...extra }),
  error: (title: string, message?: string, extra?: Partial<ToastOptions>) =>
    toast({ type: 'error', title, message, ...extra }),
  info: (title: string, message?: string, extra?: Partial<ToastOptions>) =>
    toast({ type: 'info', title, message, ...extra }),
  warning: (title: string, message?: string, extra?: Partial<ToastOptions>) =>
    toast({ type: 'warning', title, message, ...extra }),

  /** Hộp thoại xác nhận Đồng ý / Hủy. Trả về true nếu người dùng đồng ý. */
  confirm(opts: {
    title: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
  }): Promise<boolean> {
    return new Promise((resolve) => {
      dialog({
        title: opts.title,
        message: opts.message,
        variant: opts.destructive ? 'danger' : 'warning',
        cancelable: true,
        buttons: [
          { text: opts.cancelLabel ?? 'Hủy', style: 'cancel', onPress: () => resolve(false) },
          {
            text: opts.confirmLabel ?? 'Đồng ý',
            style: opts.destructive ? 'destructive' : 'default',
            onPress: () => resolve(true),
          },
        ],
      });
    });
  },

  /**
   * Cùng chữ ký với Alert.alert. Không có nút -> toast (loại suy từ tiêu đề); có nút -> hộp thoại.
   */
  alert(title: string, message?: string, buttons?: DialogButton[]) {
    if (!buttons || buttons.length === 0) {
      toast({ type: inferType(title), title, message });
      return;
    }
    const hasDestructive = buttons.some((b) => b.style === 'destructive');
    const type = inferType(title);
    dialog({
      title,
      message,
      buttons,
      variant: hasDestructive ? 'danger' : type === 'success' ? 'success' : type === 'error' ? 'danger' : buttons.length > 1 ? 'warning' : 'info',
      cancelable: buttons.some((b) => b.style === 'cancel'),
    });
  },
};

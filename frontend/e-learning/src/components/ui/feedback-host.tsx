import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { haptic } from '@/lib/haptics';
import {
  registerNotifier,
  type DialogOptions,
  type DialogVariant,
  type ToastOptions,
  type ToastType,
} from '@/lib/notify';

type ToastItem = ToastOptions & { id: number };

const MAX_TOASTS = 3;
let seq = 0;

/** Vẽ toast (góc phải trên) và hộp thoại xác nhận. Đặt một lần ở gốc ứng dụng. */
export function FeedbackHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [queue, setQueue] = useState<DialogOptions[]>([]);

  const dismissToast = useCallback((id: number) => setToasts((p) => p.filter((t) => t.id !== id)), []);

  useEffect(() => {
    registerNotifier({
      toast: (o) => {
        if (o.type === 'success') haptic('success');
        else if (o.type === 'error' || o.type === 'warning') haptic('warning');
        setToasts((prev) => {
          // bỏ toast trùng nội dung đang hiện để không dồn đống khi bấm liên tục
          const rest = prev.filter((t) => !(t.title === o.title && t.message === o.message));
          return [...rest, { ...o, id: ++seq }].slice(-MAX_TOASTS);
        });
      },
      dialog: (o) => setQueue((q) => [...q, o]),
    });
    return () => registerNotifier(null);
  }, []);

  const current = queue[0];
  const closeDialog = useCallback(() => setQueue((q) => q.slice(1)), []);

  return (
    <>
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
      <DialogModal key={queue.length ? 'open' : 'closed'} dialog={current} onClose={closeDialog} />
    </>
  );
}

// ------------------------------------------------------------------ Toast

function ToastStack({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= 600;
  if (toasts.length === 0) return null;
  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.stack,
        { top: insets.top + 12 },
        wide ? { right: 20, width: 380 } : { left: 12, right: 12 },
      ]}>
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </View>
  );
}

function accentOf(type: ToastType, theme: ReturnType<typeof useTheme>): { color: string; icon: string } {
  switch (type) {
    case 'success':
      return { color: theme.success, icon: 'checkCircle' };
    case 'error':
      return { color: theme.danger, icon: 'warning' };
    case 'warning':
      return { color: '#d97706', icon: 'warning' };
    default:
      return { color: theme.primary, icon: 'info' };
  }
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const theme = useTheme();
  const type = toast.type ?? 'info';
  const { color, icon } = accentOf(type, theme);
  const enter = useRef(new Animated.Value(0)).current;
  const dismissed = useRef(false);

  const close = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    Animated.timing(enter, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(
      () => onDismiss(),
    );
  }, [enter, onDismiss]);

  useEffect(() => {
    Animated.spring(enter, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 6 }).start();
    const duration = toast.duration ?? (toast.actionLabel || type === 'error' ? 5500 : 3500);
    if (duration <= 0) return;
    const timer = setTimeout(close, duration);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: enter,
          transform: [{ translateX: enter.interpolate({ inputRange: [0, 1], outputRange: [48, 0] }) }],
        },
        shadow,
      ]}>
      <View style={[styles.toastBar, { backgroundColor: color }]} />
      <View style={[styles.toastIcon, { backgroundColor: `${color}22` }]}>
        <Icon name={icon} weight="fill" size={20} color={color} />
      </View>
      <View style={styles.toastBody}>
        <Text style={[styles.toastTitle, { color: theme.text }]} numberOfLines={2}>
          {toast.title}
        </Text>
        {toast.message ? (
          <Text style={[styles.toastMsg, { color: theme.textSecondary }]} numberOfLines={3}>
            {toast.message}
          </Text>
        ) : null}
        {toast.actionLabel ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => {
              close();
              toast.onAction?.();
            }}
            style={styles.toastAction}>
            <Text style={{ color, fontWeight: '800', fontSize: 13 }}>{toast.actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Đóng thông báo" hitSlop={10} onPress={close}>
        <Icon name="close" size={16} color={theme.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}

// ------------------------------------------------------------------ Hộp thoại

function variantIcon(v: DialogVariant, theme: ReturnType<typeof useTheme>): { color: string; icon: string } {
  switch (v) {
    case 'success':
      return { color: theme.success, icon: 'checkCircle' };
    case 'danger':
      return { color: theme.danger, icon: 'trash' };
    case 'warning':
      return { color: '#d97706', icon: 'help' };
    default:
      return { color: theme.primary, icon: 'info' };
  }
}

function DialogModal({ dialog, onClose }: { dialog?: DialogOptions; onClose: () => void }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!dialog) return;
    anim.setValue(0);
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 18, bounciness: 7 }).start();
  }, [dialog, anim]);

  if (!dialog) return null;
  const { color, icon } = variantIcon(dialog.variant ?? 'info', theme);

  const press = (index: number) => {
    const b = dialog.buttons[index];
    onClose();
    // chạy sau khi đóng để các thao tác điều hướng/hộp thoại tiếp theo không bị chồng
    setTimeout(() => b.onPress?.(), 0);
  };
  const dismiss = () => {
    if (!dialog.cancelable) return;
    const i = dialog.buttons.findIndex((b) => b.style === 'cancel');
    if (i >= 0) press(i);
    else onClose();
  };

  const stacked = dialog.buttons.length > 2;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={dismiss} statusBarTranslucent>
      <Pressable style={[styles.backdrop, { backgroundColor: theme.overlay }]} onPress={dismiss}>
        {/* chặn chạm xuyên xuống nền */}
        <Pressable onPress={() => undefined} style={{ width: Math.min(400, width - 40) }}>
          <Animated.View
            accessibilityViewIsModal
            accessibilityRole="alert"
            style={[
              styles.dialog,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
                opacity: anim,
                transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
              },
              shadow,
            ]}>
            <View style={[styles.dialogIcon, { backgroundColor: `${color}22` }]}>
              <Icon name={icon} weight="fill" size={28} color={color} />
            </View>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>{dialog.title}</Text>
            {dialog.message ? (
              <Text style={[styles.dialogMsg, { color: theme.textSecondary }]}>{dialog.message}</Text>
            ) : null}
            <View style={[styles.btnRow, stacked && { flexDirection: 'column' }]}>
              {dialog.buttons.map((b, i) => {
                const isCancel = b.style === 'cancel';
                const destructive = b.style === 'destructive';
                const bg = isCancel ? theme.chipBackground : destructive ? theme.danger : theme.primary;
                const fg = isCancel ? theme.text : '#ffffff';
                return (
                  <PressableScale
                    key={`${b.text}-${i}`}
                    accessibilityRole="button"
                    haptic={isCancel ? 'selection' : 'light'}
                    onPress={() => press(i)}
                    style={[styles.btn, { backgroundColor: bg, flex: stacked ? undefined : 1 }]}>
                    <Text style={{ color: fg, fontWeight: '800', fontSize: 15 }}>{b.text}</Text>
                  </PressableScale>
                );
              })}
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const shadow = Platform.select({
  web: { boxShadow: '0 12px 32px rgba(24,21,40,0.18)' } as any,
  default: {
    shadowColor: '#181528',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
});

const styles = StyleSheet.create({
  stack: { position: 'absolute', gap: Spacing.two, zIndex: 3000, elevation: 30 },
  toast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two + 2,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    overflow: 'hidden',
  },
  toastBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  toastIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toastBody: { flex: 1, gap: 2, paddingTop: 1 },
  toastTitle: { fontSize: 14, fontWeight: '800', lineHeight: 19 },
  toastMsg: { fontSize: 13, lineHeight: 18 },
  toastAction: { marginTop: 6, alignSelf: 'flex-start' },
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  dialog: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  dialogIcon: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  dialogTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  dialogMsg: { fontSize: 14, lineHeight: 21, textAlign: 'center' },
  btnRow: { flexDirection: 'row', gap: 10, alignSelf: 'stretch', marginTop: 14 },
  btn: { minHeight: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
});

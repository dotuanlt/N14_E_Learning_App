import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { Icon } from '@/components/ui/icon';
import { navigationRef } from '@/navigation/navigationRef';
import { storage } from '@/storage';
import { useChat } from '@/store/ChatContext';

const SIZE = 56;
const MARGIN = 10;
const POS_KEY = 'assistant_bubble_pos';
const HIDDEN_ROUTES = new Set([
  'Chat', 'Welcome', 'Login', 'Register', 'VerifyOtp', 'ForgotPassword', 'CoursePlayer', 'SearchFilter',
]);

type Ctx = { route?: string; courseId?: string; lessonId?: string };

function readContext(): Ctx {
  if (!navigationRef.isReady()) return {};
  const r = navigationRef.getCurrentRoute();
  const p = (r?.params ?? {}) as any;
  const route = r?.name;
  const courseId =
    route === 'CourseDetail' || route === 'CourseCurriculum' || route === 'CourseReviews' ||
    route === 'CourseQa' || route === 'CoursePlayer'
      ? p.id
      : undefined;
  return { route, courseId: courseId ? String(courseId) : undefined };
}

/**
 * Bong bóng trợ lý AI kéo thả được (giống AssistiveTouch trên iPhone):
 * chạm để mở trò chuyện (biết đang xem khóa học nào), kéo để di chuyển, thả ra tự hít vào mép gần nhất
 * và nhớ vị trí lần sau.
 */
export function FloatingAssistant() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { sending, unread } = useChat();
  const [ctx, setCtx] = useState<Ctx>({});

  const bounds = useMemo(
    () => ({
      minX: MARGIN,
      maxX: Math.max(MARGIN, width - SIZE - MARGIN),
      minY: insets.top + MARGIN,
      maxY: Math.max(insets.top + MARGIN, height - SIZE - insets.bottom - MARGIN),
    }),
    [width, height, insets.top, insets.bottom],
  );
  const boundsRef = useRef(bounds);
  boundsRef.current = bounds;

  const pos = useRef(new Animated.ValueXY({ x: width - SIZE - MARGIN, y: height * 0.62 })).current;
  const last = useRef({ x: width - SIZE - MARGIN, y: height * 0.62 });
  const start = useRef({ x: 0, y: 0 });
  const pulse = useRef(new Animated.Value(0)).current;

  const place = useCallback(
    (x: number, y: number, animate = true) => {
      const b = boundsRef.current;
      const cy = Math.min(Math.max(y, b.minY), b.maxY);
      const snapX = x + SIZE / 2 < (b.minX + b.maxX + SIZE) / 2 ? b.minX : b.maxX;
      last.current = { x: snapX, y: cy };
      if (animate) {
        Animated.spring(pos, { toValue: last.current, useNativeDriver: false, friction: 7, tension: 80 }).start();
      } else {
        pos.setValue(last.current);
      }
      storage.setItem(POS_KEY, { rx: snapX === b.minX ? 0 : 1, y: cy / Math.max(1, b.maxY) });
    },
    [pos],
  );

  // Khôi phục vị trí đã lưu, và giữ bong bóng trong màn hình khi xoay / đổi kích thước.
  useEffect(() => {
    let alive = true;
    storage.getItem<{ rx: number; y: number }>(POS_KEY).then((saved) => {
      if (!alive) return;
      const b = boundsRef.current;
      const x = saved?.rx === 0 ? b.minX : b.maxX;
      const y = saved ? saved.y * b.maxY : height * 0.62;
      place(x, y, false);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, insets.top, insets.bottom]);

  // Theo dõi màn hình hiện tại để ẩn/hiện và biết ngữ cảnh khóa học.
  useEffect(() => {
    const update = () => setCtx(readContext());
    update();
    const unsub = navigationRef.addListener('state', update);
    const t = setTimeout(update, 400); // navigationRef có thể chưa sẵn sàng ở lần đầu
    return () => {
      clearTimeout(t);
      unsub();
    };
  }, []);

  // Nhấp nháy nhẹ khi trợ lý đang trả lời.
  useEffect(() => {
    if (!sending) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 700, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sending, pulse]);

  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
          pos.stopAnimation();
          start.current = { ...last.current };
        },
        onPanResponderMove: (_e, g) => {
          const b = boundsRef.current;
          pos.setValue({
            x: Math.min(Math.max(start.current.x + g.dx, b.minX - 6), b.maxX + 6),
            y: Math.min(Math.max(start.current.y + g.dy, b.minY), b.maxY),
          });
        },
        onPanResponderRelease: (_e, g) => {
          if (Math.abs(g.dx) < 6 && Math.abs(g.dy) < 6) {
            // chạm: mở trợ lý với ngữ cảnh khóa học hiện tại
            const c = ctxRef.current;
            if (navigationRef.isReady()) {
              (navigationRef as any).navigate('Chat', c.courseId ? { courseId: c.courseId } : undefined);
            }
            return;
          }
          place(start.current.x + g.dx, start.current.y + g.dy);
        },
        onPanResponderTerminate: () => place(last.current.x, last.current.y),
      }),
    [pos, place],
  );

  if (!ctx.route || HIDDEN_ROUTES.has(ctx.route)) return null;

  const ring = pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 10] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const showDot = unread && !sending;

  return (
    <Animated.View
      {...responder.panHandlers}
      accessibilityRole="button"
      accessibilityLabel="Trợ lý AI. Chạm để trò chuyện, kéo để di chuyển"
      style={[styles.wrap, { transform: pos.getTranslateTransform() }]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.ring, { opacity: ringOpacity, transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) }] }]}
      />
      <View style={styles.shadow}>
        <LinearGradient
          colors={['#7b61ff', '#5641f5', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bubble}>
          <Icon name="sparkle" weight="fill" size={26} color="#ffffff" />
        </LinearGradient>
      </View>
      {showDot ? <View style={styles.dot} /> : null}
      <Animated.View pointerEvents="none" style={{ height: ring }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, top: 0, width: SIZE, height: SIZE, zIndex: 999, elevation: 12 },
  ring: { position: 'absolute', width: SIZE, height: SIZE, borderRadius: SIZE / 2, backgroundColor: '#7b61ff' },
  shadow: Platform.select({
    web: { width: SIZE, height: SIZE, borderRadius: SIZE / 2, boxShadow: '0 6px 18px rgba(86,65,245,0.45)' } as any,
    default: {
      width: SIZE,
      height: SIZE,
      borderRadius: SIZE / 2,
      shadowColor: '#5641f5',
      shadowOpacity: 0.45,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 10,
    },
  }) as any,
  bubble: { flex: 1, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center' },
  dot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

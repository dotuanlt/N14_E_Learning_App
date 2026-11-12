import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Easing, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  /** Trễ (ms) trước khi hiện, dùng để xếp lần lượt các mục trong danh sách. */
  delay?: number;
  /** Thứ tự mục; tự đổi thành độ trễ (tối đa 8 mục đầu để không bắt người dùng chờ). */
  index?: number;
  duration?: number;
  offset?: number;
  style?: StyleProp<ViewStyle>;
};

/** Hiện dần + trượt nhẹ lên khi nội dung xuất hiện (ví dụ thay skeleton bằng dữ liệu thật). */
export function FadeIn({ children, delay, index = 0, duration = 320, offset = 10, style }: Props) {
  const v = useRef(new Animated.Value(0)).current;
  const wait = delay ?? Math.min(index, 8) * 55;

  useEffect(() => {
    const a = Animated.timing(v, {
      toValue: 1,
      duration,
      delay: wait,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    a.start();
    return () => a.stop();
  }, [v, duration, wait]);

  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }) }] },
      ]}>
      {children}
    </Animated.View>
  );
}

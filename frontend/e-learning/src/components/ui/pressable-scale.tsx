import { useRef, useState } from 'react';
import { Animated, Platform, Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { haptic, type HapticKind } from '@/lib/haptics';

const APressable = Animated.createAnimatedComponent(Pressable);

export type PressableScaleProps = Omit<PressableProps, 'style'> & {
  /** Hệ số thu nhỏ khi nhấn (mặc định 0.97). */
  scaleTo?: number;
  /** Hệ số phóng nhẹ khi rê chuột (chỉ web). */
  hoverScale?: number;
  /** Rung phản hồi khi nhấn (chỉ điện thoại). */
  haptic?: HapticKind | false;
  style?: StyleProp<ViewStyle> | ((state: { pressed: boolean }) => StyleProp<ViewStyle>);
};

/**
 * Thay thế Pressable: nhấn thì co lại mượt (spring), web rê chuột thì nở nhẹ, có thể rung phản hồi.
 * Giữ nguyên API của Pressable nên đổi tên là dùng được.
 */
export function PressableScale({
  scaleTo = 0.97,
  hoverScale = 1.015,
  haptic: hapticKind = false,
  style,
  onPress,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);
  const hovering = useRef(false);

  const to = (value: number) =>
    Animated.spring(scale, { toValue: value, useNativeDriver: true, speed: 40, bounciness: 5 }).start();

  const resolved = typeof style === 'function' ? style({ pressed }) : style;

  return (
    <APressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        setPressed(true);
        if (!disabled) to(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        to(hovering.current && Platform.OS === 'web' ? hoverScale : 1);
        onPressOut?.(e);
      }}
      onHoverIn={(e: any) => {
        hovering.current = true;
        if (Platform.OS === 'web' && !disabled) to(hoverScale);
        onHoverIn?.(e);
      }}
      onHoverOut={(e: any) => {
        hovering.current = false;
        if (Platform.OS === 'web') to(1);
        onHoverOut?.(e);
      }}
      onPress={(e) => {
        if (hapticKind) haptic(hapticKind);
        onPress?.(e);
      }}
      style={[resolved as any, { transform: [{ scale }] }]}
    />
  );
}

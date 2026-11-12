import { PressableScale } from '@/components/ui/pressable-scale';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';

import { Icon } from '@/components/ui/icon';
import type { Category } from '@/types/category';

type CategoryCardProps = {
  category: Category;
  onPress?: () => void;
};

export const CATEGORY_CARD_WIDTH = 132;
export const CATEGORY_CARD_HEIGHT = 156;

function shade(hex: string, amount: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c * (1 + amount))));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Thẻ danh mục dạng khối lớn: ảnh minh họa làm mờ + gradient màu + icon lớn mờ làm hình nền. */
export function CategoryCard({ category, onPress }: CategoryCardProps) {
  const label = category.title || category.label || 'Danh mục';
  const base = category.tint || category.color || '#5641f5';
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(category.image) && !imageFailed;

  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.card}>
      <LinearGradient
        colors={[shade(base, 0.12), shade(base, -0.28)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {showImage ? (
        <Image
          source={{ uri: category.image }}
          style={[StyleSheet.absoluteFill, { opacity: 0.38 }]}
          contentFit="cover"
          blurRadius={3}
          cachePolicy="memory-disk"
          onError={() => setImageFailed(true)}
          accessible={false}
        />
      ) : null}
      {/* phủ màu để chữ luôn đọc được, đậm dần xuống dưới */}
      <LinearGradient
        colors={['rgba(0,0,0,0)', shade(base, -0.45) + 'd9']}
        start={{ x: 0.5, y: 0.2 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* icon lớn mờ làm hình nền */}
      <View pointerEvents="none" style={styles.watermark}>
        <Icon name={category.icon} sf={category.icon} glyph={category.glyph} emoji={category.emoji} size={104} weight="fill" color="rgba(255,255,255,0.16)" />
      </View>
      <View style={styles.iconBubble}>
        <Icon name={category.icon} sf={category.icon} glyph={category.glyph} emoji={category.emoji} size={24} weight="fill" color="#ffffff" />
      </View>
      <View style={styles.footer}>
        <Text numberOfLines={2} style={styles.label}>
          {label}
        </Text>
        <View style={styles.arrow}>
          <Icon name="arrowUpRight" size={14} weight="bold" color="#ffffff" />
        </View>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CATEGORY_CARD_WIDTH,
    height: CATEGORY_CARD_HEIGHT,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#181528',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  watermark: {
    position: 'absolute',
    right: -22,
    top: 18,
    transform: [{ rotate: '-14deg' }],
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  label: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  arrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});

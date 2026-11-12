import { memo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { GLYPH_ALIAS, REGISTRY, SF_ALIAS, type IconName } from './phosphor-registry';

export type { IconName } from './phosphor-registry';
export type IconWeight = 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';

export type IconProps = {
  /** Tên icon (IconName). Vẫn chấp nhận tên SF Symbols cũ. */
  name?: IconName | (string & {});
  /** Tương thích ngược: tên SF Symbols / emoji / ký tự cũ sẽ được tự đổi sang icon Phosphor. */
  sf?: string;
  glyph?: string;
  emoji?: string;
  size?: number;
  color?: string;
  /** Kiểu nét. Mặc định 'regular'; icon đang chọn (active) nên dùng 'fill'. */
  weight?: IconWeight;
  style?: StyleProp<TextStyle>;
};

function resolve(props: IconProps): { key: IconName | null; fill: boolean } {
  const { name, sf, glyph, emoji } = props;
  for (const raw of [name, sf]) {
    if (!raw) continue;
    if (raw in REGISTRY) return { key: raw as IconName, fill: false };
    const alias = SF_ALIAS[raw];
    if (alias) return { key: alias, fill: raw.endsWith('.fill') };
  }
  for (const raw of [emoji, glyph]) {
    if (raw && GLYPH_ALIAS[raw]) return { key: GLYPH_ALIAS[raw], fill: false };
  }
  return { key: null, fill: false };
}

function IconImpl(props: IconProps) {
  const theme = useTheme();
  const { size = 20, color, weight, style, glyph, emoji } = props;
  const tint = color ?? theme.text;
  const { key, fill } = resolve(props);

  if (!key) {
    // Không có icon tương ứng: hiện ký tự gốc để không mất thông tin (hiếm khi xảy ra).
    return (
      <Text style={[{ fontSize: size, lineHeight: size + 2, color: tint, textAlign: 'center' }, style]}>
        {glyph || emoji || '•'}
      </Text>
    );
  }
  const Cmp = REGISTRY[key];
  return <Cmp size={size} color={tint} weight={weight ?? (fill ? 'fill' : 'regular')} />;
}

export const Icon = memo(IconImpl);

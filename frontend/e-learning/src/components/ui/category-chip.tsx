import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { FontSizes, Radius, Spacing } from '@/constants/theme';
import type { Category } from '@/types';

type CategoryChipVariant = 'card' | 'pill';

interface CategoryChipProps {
  category: Category;
  variant?: CategoryChipVariant;
  selected?: boolean;
  onPress?: () => void;
}

const ICONS: Record<string, string> = {
  business: '💼',
  design: '🎨',
  programming: '💻',
  writing: '✍️',
  film: '🎬',
  language: '🌐',
};

export function CategoryChip({ category, variant = 'card', selected, onPress }: CategoryChipProps) {
  const theme = useTheme();
  const glyph = ICONS[category.id] ?? '📚';

  if (variant === 'pill') {
    return (
      <PressableScale haptic="selection"
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={category.label}
        accessibilityState={{ selected: !!selected }}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: selected ? theme.primary : theme.backgroundElement,
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <Text
          style={[
            styles.pillText,
            { color: selected ? '#FFFFFF' : theme.text },
          ]}
        >
          {category.label}
        </Text>
      </PressableScale>
    );
  }

  return (
    <PressableScale haptic="selection"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={category.label}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${category.color}66` }]}>
        <Icon glyph={glyph} emoji={glyph} size={24} weight="fill" color={theme.text} />
      </View>
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>
        {category.label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 92,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.lg,
    marginRight: Spacing.two,
    gap: Spacing.two,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 20,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  pill: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    marginRight: Spacing.two,
  },
  pillText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});

import { Icon } from '@/components/ui/icon';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
  rating: number;
  reviewCount?: number;
  lessonCount?: number;
  fontSize?: number;
};

export function RatingLine({ rating, reviewCount, lessonCount, fontSize = 13 }: Props) {
  const theme = useAppTheme();

  const suffix = [
    reviewCount ? `(${reviewCount})` : null,
    lessonCount ? `${lessonCount} bài học` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' · ');

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
    <Icon name="star" weight="fill" size={fontSize + 2} color={theme.star} />
    <Text style={[styles.text, { color: theme.textSecondary, fontSize }]}>
      {rating.toFixed(1)}
      {suffix ? ` ${suffix}` : ''}
    </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '500',
  },
});

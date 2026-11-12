import { Icon } from '@/components/ui/icon';
import { StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
  likes: number;
  shares: number;
};

export function CourseStats({ likes, shares }: Props) {
  const theme = useAppTheme();

  return (
    <View style={styles.row}>
      <View style={styles.stat}>
        <Icon name="heart" size={15} color={theme.textSecondary} />
        <Text style={[styles.item, { color: theme.textSecondary }]}>{`${likes} Thích`}</Text>
      </View>
      <View style={styles.stat}>
        <Icon name="share" size={15} color={theme.textSecondary} />
        <Text style={[styles.item, { color: theme.textSecondary }]}>{`${shares} Chia sẻ`}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  item: {
    fontSize: 13,
    fontWeight: '500',
  },
});

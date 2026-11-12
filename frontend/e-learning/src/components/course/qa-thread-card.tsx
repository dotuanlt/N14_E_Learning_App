import { Icon } from '@/components/ui/icon';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';
import type { QaThread } from '@/types/course';

type Props = {
  thread: QaThread;
  onPress?: () => void;
};

export function QaThreadCard({ thread, onPress }: Props) {
  const theme = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Câu hỏi của ${thread.author}`}
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
    >
      <View style={styles.head}>
        <Avatar name={thread.author} size={40} tone={thread.tone} />
        <View style={styles.headBody}>
          <Text style={[styles.name, { color: theme.text }]}>{thread.author}</Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{thread.timeAgo}</Text>
        </View>
      </View>
      <Text style={[styles.body, { color: theme.textSecondary }]}>{thread.body}</Text>
      <View style={styles.footer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <Icon name="heart" size={15} color={theme.text} />
          <Text style={[styles.meta, { color: theme.text }]}>{thread.likes}</Text>
        </View>
        <Text style={[styles.meta, { color: theme.text }]}>{thread.comments} bình luận</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.three,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  headBody: {
    flex: 1,
    gap: Spacing.half,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  meta: {
    fontSize: 12,
    fontWeight: '600',
  },
});

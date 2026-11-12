import { Image, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PressableScale } from '@/components/ui/pressable-scale';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type Props = {
  price: string;
  discount?: string;
  actionLabel: string;
  onAction: () => void;
  onAskAi?: () => void;
  facts?: { icon: string; label: string; value: string }[];
};

/** Thẻ giá + nút hành động cho màn chi tiết khóa học ở bố cục 2 cột. */
export function PriceCard({ price, discount, actionLabel, onAction, onAskAi, facts = [] }: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={{ gap: 2 }}>
        <Text style={[styles.price, { color: theme.text }]}>{price}</Text>
        {discount ? <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{discount}</Text> : null}
      </View>
      <PrimaryButton label={actionLabel} onPress={onAction} />
      {onAskAi ? (
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel="Hỏi trợ lý AI về khóa học này"
          onPress={onAskAi}
          style={[styles.ai, { backgroundColor: theme.primarySoft, borderColor: theme.primaryBorder }]}>
          <Image source={require('../../../assets/images/robot.png')} style={styles.aiIcon} resizeMode="contain" />
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: 14 }}>Hỏi trợ lý AI</Text>
        </PressableScale>
      ) : null}
      {facts.length > 0 ? (
        <View style={[styles.facts, { borderTopColor: theme.border }]}>
          {facts.map((f) => (
            <View key={f.label} style={styles.fact}>
              <Icon name={f.icon} size={18} color={theme.primary} />
              <Text style={{ color: theme.textSecondary, fontSize: 13, flex: 1 }}>{f.label}</Text>
              <Text style={{ color: theme.text, fontSize: 13, fontWeight: '700' }}>{f.value}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.xl, padding: Spacing.three, gap: Spacing.three },
  price: { fontSize: 26, fontWeight: '800' },
  ai: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  aiIcon: { width: 20, height: 20, borderRadius: 6 },
  facts: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.three, gap: Spacing.two + 2 },
  fact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

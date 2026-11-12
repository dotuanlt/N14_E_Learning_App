import { PressableScale } from '@/components/ui/pressable-scale';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/components/ui/brand-logo';
import { PAYMENT_PROVIDERS } from '@/constants/payment-providers';
import { FontSizes, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { PaymentMethod } from '@/types/settings';

export type PaymentMethodRowProps = {
  method: PaymentMethod;
  selected: boolean;
  onSelect: (id: string) => void;
  subtitle?: string;
};

export function PaymentMethodRow({ method, selected, onSelect, subtitle }: PaymentMethodRowProps) {
  const theme = useTheme();
  const description = subtitle ?? PAYMENT_PROVIDERS[method.id as keyof typeof PAYMENT_PROVIDERS]?.description;

  return (
    <PressableScale haptic="selection"
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={method.label}
      onPress={() => onSelect(method.id)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.backgroundElement,
          borderColor: selected ? theme.primary : theme.border,
          opacity: pressed ? 0.85 : 1,
          shadowColor: theme.shadow,
        },
      ]}>
      <BrandLogo provider={method.id} size={44} />

      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: theme.text }]}>{method.label}</Text>
        {description ? <Text style={[styles.sub, { color: theme.textSecondary }]}>{description}</Text> : null}
      </View>

      <View style={[styles.radio, { borderColor: selected ? theme.primary : theme.borderStrong }]}>
        {selected ? <View style={[styles.radioDot, { backgroundColor: theme.primary }]} /> : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  label: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  sub: {
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

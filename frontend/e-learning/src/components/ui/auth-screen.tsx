import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useTheme } from '@/hooks/use-theme';

export type AuthScreenProps = {
  children: ReactNode;
  testID?: string;
};

export function AuthScreen({ children, testID }: AuthScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isWide } = useResponsive();

  const form = (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.four, paddingBottom: insets.bottom + Spacing.five },
        ]}
      >
        <View style={styles.inner}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (isWide) {
    return (
      <View style={[styles.root, styles.split, { backgroundColor: theme.background }]} testID={testID}>
        <LinearGradient
          colors={[theme.primary, '#7a63ff', '#a597ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.brandPanel}
        >
          <View style={styles.brandLogo}>
            <Icon name="graduation" weight="fill" size={30} color="#ffffff" />
          </View>
          <Text style={styles.brandTitle}>Học thông minh hơn mỗi ngày</Text>
          <Text style={styles.brandSub}>
            Hàng trăm khóa học từ giảng viên giàu kinh nghiệm, kèm trợ lý AI giải đáp ngay khi bạn thắc mắc.
          </Text>
          <View style={styles.perks}>
            {['Học mọi lúc, trên mọi thiết bị', 'Chứng chỉ sau khi hoàn thành', 'Trợ lý AI hỗ trợ 24/7'].map((t) => (
              <View key={t} style={styles.perk}>
                <Icon name="checkCircle" weight="fill" size={20} color="#ffffff" />
                <Text style={styles.perkText}>{t}</Text>
              </View>
            ))}
          </View>
        </LinearGradient>
        <View style={styles.formPanel}>{form}</View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]} testID={testID}>
      <View pointerEvents="none" style={[styles.blob, { backgroundColor: theme.primarySoft }]} />
      <View pointerEvents="none" style={[styles.blobAccent, { backgroundColor: theme.accent }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: insets.top + Spacing.four,
              paddingBottom: insets.bottom + Spacing.five,
            },
          ]}
        >
          <View style={styles.inner}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  split: { flexDirection: 'row' },
  brandPanel: { flex: 1, justifyContent: 'center', padding: 56, gap: 18 },
  formPanel: { flex: 1 },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { color: '#ffffff', fontSize: 36, fontWeight: '900', letterSpacing: -0.8, lineHeight: 44, maxWidth: 440 },
  brandSub: { color: 'rgba(255,255,255,0.85)', fontSize: 16, lineHeight: 24, maxWidth: 440 },
  perks: { gap: 12, marginTop: 12 },
  perk: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  perkText: { color: '#ffffff', fontSize: 15, fontWeight: '600' },
  root: {
    flex: 1,
    overflow: 'hidden',
  },
  flex: {
    flex: 1,
  },
  blob: {
    borderRadius: 160,
    height: 320,
    position: 'absolute',
    right: -120,
    top: -140,
    width: 320,
  },
  blobAccent: {
    borderRadius: 70,
    bottom: -50,
    height: 140,
    left: -60,
    opacity: 0.6,
    position: 'absolute',
    width: 140,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  inner: {
    alignSelf: 'center',
    maxWidth: 480,
    width: '100%',
  },
});

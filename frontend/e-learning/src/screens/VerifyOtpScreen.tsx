import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from '@/navigation/routerHook';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AuthScreen } from '@/components/ui/auth-screen';
import { BackButton } from '@/components/ui/back-button';
import { FooterLink } from '@/components/ui/footer-link';
import { FormField } from '@/components/ui/form-field';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services/authService';
import { isValidOtp } from '@/utils/validation';

type VerifyOtpParams = {
  email?: string;
  expiresInSeconds?: number | string;
  resendAfterSeconds?: number | string;
};

export default function VerifyOtpScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<VerifyOtpParams>();
  const targetEmail = (params.email || '').trim();
  const initialCooldown = Math.max(0, Number(params.resendAfterSeconds ?? 60) || 60);
  const expireMinutes = Math.max(1, Math.round((Number(params.expiresInSeconds ?? 300) || 300) / 60));

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState<number>(initialCooldown);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async () => {
    if (!targetEmail) {
      Alert.alert('Thiếu thông tin', 'Không tìm thấy email cần xác thực. Vui lòng đăng ký lại.', [
        { text: 'Quay lại', onPress: () => router.replace('/register') },
      ]);
      return;
    }

    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setOtpError('Vui lòng nhập mã OTP 6 chữ số đã gửi về email.');
      return;
    }
    if (!isValidOtp(trimmedOtp)) {
      setOtpError('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }

    try {
      setLoading(true);
      setOtpError(undefined);
      await authService.verifyOtp(targetEmail, trimmedOtp);
      Alert.alert(
        'Tạo tài khoản thành công',
        'Tài khoản của bạn đã được xác thực qua email. Vui lòng đăng nhập để bắt đầu học!',
        [
          {
            text: 'Đến trang đăng nhập',
            onPress: () =>
              router.replace({
                pathname: '/login',
                params: { email: targetEmail },
              }),
          },
        ],
      );
    } catch (err: any) {
      const msg = err?.message || 'Mã OTP không đúng hoặc đã hết hạn';
      setOtpError(msg);
      Alert.alert('Xác thực thất bại', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!targetEmail || cooldown > 0 || resending) return;
    try {
      setResending(true);
      setOtpError(undefined);
      const res = await authService.resendOtp(targetEmail, 'REGISTER');
      setCooldown(Math.max(1, res?.resendAfterSeconds || 60));
      Alert.alert('Đã gửi lại mã OTP', `Mã OTP mới đã được gửi tới ${targetEmail}. Vui lòng kiểm tra hộp thư.`);
    } catch (err: any) {
      Alert.alert('Không thể gửi lại mã', err?.message || 'Vui lòng thử lại sau.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthScreen testID="verify-otp-screen">
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>

      <SurfaceCard>
        <ThemedText type="title" style={[styles.title, { color: theme.text }]}>
          Xác thực email
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Chúng tôi đã gửi mã OTP gồm 6 chữ số tới{' '}
          <Text style={[styles.emailHighlight, { color: theme.text }]}>
            {targetEmail || 'email của bạn'}
          </Text>
          . Mã có hiệu lực trong {expireMinutes} phút.
        </ThemedText>

        <View style={styles.fields}>
          <FormField
            label="Mã xác thực OTP"
            value={otp}
            onChangeText={(value) => {
              const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
              setOtp(digitsOnly);
              setOtpError(undefined);
            }}
            placeholder="Nhập 6 chữ số OTP"
            keyboardType="number-pad"
            maxLength={6}
            returnKeyType="done"
            onSubmitEditing={handleVerify}
            error={otpError}
          />

          <AppButton
            label={loading ? 'Đang xác thực...' : 'Xác thực & Hoàn tất đăng ký'}
            onPress={handleVerify}
            disabled={loading}
          />

          <Pressable
            onPress={handleResend}
            disabled={cooldown > 0 || resending}
            accessibilityRole="button"
            style={styles.resendWrap}
          >
            <Text
              style={[
                styles.resendText,
                {
                  color: cooldown > 0 || resending ? theme.textSecondary : theme.primary,
                },
              ]}
            >
              {resending
                ? 'Đang gửi lại mã...'
                : cooldown > 0
                  ? `Gửi lại mã OTP sau ${cooldown}s`
                  : 'Chưa nhận được mã? Gửi lại OTP'}
            </Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <FooterLink
        question="Đã có tài khoản?"
        action="Đăng nhập"
        onPress={() =>
          router.replace({
            pathname: '/login',
            params: targetEmail ? { email: targetEmail } : undefined,
          })
        }
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  emailHighlight: {
    fontWeight: '700',
  },
  fields: {
    gap: Spacing.three,
  },
  resendWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

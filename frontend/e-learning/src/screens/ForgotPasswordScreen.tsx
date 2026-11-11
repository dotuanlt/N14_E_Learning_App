import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from '@/navigation/routerHook';
import { useTheme } from '@/hooks/use-theme';
import { Screen } from '@/components/ui/screen';
import { FormField } from '@/components/ui/form-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { BackButton } from '@/components/ui/back-button';
import { passwordVisibilityLabels } from '@/constants/auth';
import { FontSizes, Spacing } from '@/constants/theme';
import { authService } from '@/services/authService';
import { isStrongEnoughPassword, isValidEmail, isValidOtp } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const theme = useTheme();
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequest = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ email của bạn');
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      Alert.alert('Lỗi', 'Email không đúng định dạng');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.forgotPassword(normalizedEmail);
      setEmail(normalizedEmail);
      setOtp('');
      setCooldown(Math.max(1, res?.resendAfterSeconds ?? 60));
      setStep('reset');
      Alert.alert(
        'Đã gửi mã xác nhận',
        `Nếu email ${normalizedEmail} hợp lệ, mã OTP đặt lại mật khẩu đã được gửi về hộp thư của bạn.`,
      );
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể gửi yêu cầu đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || cooldown > 0 || resending) return;
    try {
      setResending(true);
      const res = await authService.resendOtp(normalizedEmail, 'RESET_PASSWORD');
      setCooldown(Math.max(1, res?.resendAfterSeconds ?? 60));
      Alert.alert('Đã gửi lại mã OTP', `Mã OTP mới đã được gửi tới ${normalizedEmail}.`);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể gửi lại mã OTP lúc này');
    } finally {
      setResending(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();
    if (!isValidOtp(trimmedOtp)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đúng mã OTP gồm 6 chữ số');
      return;
    }
    if (!isStrongEnoughPassword(newPassword)) {
      Alert.alert('Lỗi', 'Mật khẩu mới tối thiểu 8 ký tự, gồm cả chữ và số');
      return;
    }
    if (confirmPassword !== newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(normalizedEmail, trimmedOtp, newPassword);
      Alert.alert('Thành công', 'Mật khẩu đã được cập nhật thành công! Vui lòng đăng nhập lại.', [
        {
          text: 'Đăng nhập',
          onPress: () =>
            router.replace({
              pathname: '/login',
              params: { email: normalizedEmail },
            }),
        },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <BackButton onPress={() => (step === 'reset' ? setStep('request') : router.back())} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          {step === 'request' ? 'Quên mật khẩu?' : 'Đặt lại mật khẩu'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {step === 'request'
            ? 'Nhập email đăng ký tài khoản để nhận mã OTP khôi phục mật khẩu.'
            : `Nhập mã OTP 6 chữ số đã gửi tới ${email} và mật khẩu mới.`}
        </Text>
      </View>

      <View style={styles.form}>
        {step === 'request' ? (
          <>
            <FormField
              label="Email"
              placeholder="student@elearning.local"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <PrimaryButton
              label={loading ? 'Đang gửi...' : 'Gửi mã OTP'}
              onPress={handleRequest}
              disabled={loading}
              style={{ marginTop: Spacing.three }}
            />
          </>
        ) : (
          <>
            <FormField
              label="Mã OTP (6 chữ số)"
              placeholder="Nhập 6 chữ số OTP"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
            />

            <FormField
              label="Mật khẩu mới"
              placeholder="Tối thiểu 8 ký tự (chữ và số)"
              secureTextEntry={!showPassword}
              rightLabel={showPassword ? passwordVisibilityLabels.hide : passwordVisibilityLabels.show}
              onRightLabelPress={() => setShowPassword((prev) => !prev)}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <FormField
              label="Xác nhận mật khẩu mới"
              placeholder="Nhập lại mật khẩu mới"
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <PrimaryButton
              label={loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
              onPress={handleResetPassword}
              disabled={loading}
              style={{ marginTop: Spacing.three }}
            />

            <Pressable
              onPress={handleResendOtp}
              disabled={cooldown > 0 || resending}
              style={styles.resendWrap}
            >
              <Text
                style={[
                  styles.resendText,
                  { color: cooldown > 0 || resending ? theme.textSecondary : theme.primary },
                ]}
              >
                {resending
                  ? 'Đang gửi lại mã...'
                  : cooldown > 0
                    ? `Gửi lại mã OTP sau ${cooldown}s`
                    : 'Chưa nhận được mã? Gửi lại OTP'}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginVertical: Spacing.four,
    gap: Spacing.one,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  form: {
    gap: Spacing.three,
  },
  resendWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  resendText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});

import { router, useLocalSearchParams } from '@/navigation/routerHook';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AuthScreen } from '@/components/ui/auth-screen';
import { BackButton } from '@/components/ui/back-button';
import { FooterLink } from '@/components/ui/footer-link';
import { FormField } from '@/components/ui/form-field';
import { OrDivider } from '@/components/ui/or-divider';
import { SocialButton } from '@/components/ui/social-button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import {
  authPlaceholders,
  authValidationMessages,
  loginCopy,
  passwordVisibilityLabels,
} from '@/constants/auth';
import { useTheme } from '@/hooks/use-theme';
import { isValidEmail } from '@/utils/validation';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store';

export default function LoginScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ email?: string }>();
  const { setUser, refreshUserData } = useAppStore();
  const [email, setEmail] = useState(params.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
      setPassword('');
      setEmailError(undefined);
      setPasswordError(undefined);
    }
  }, [params.email]);

  const handleSubmit = async (overrideEmail?: string, overridePassword?: string) => {
    const targetEmail = (overrideEmail ?? email).trim().toLowerCase();
    const targetPassword = overridePassword ?? password;

    const nextEmailError =
      targetEmail.length === 0
        ? authValidationMessages.emailRequired
        : isValidEmail(targetEmail)
          ? undefined
          : authValidationMessages.emailInvalid;
    const nextPasswordError =
      targetPassword.length === 0 ? authValidationMessages.passwordRequired : undefined;

    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);

    if (nextEmailError || nextPasswordError) {
      return;
    }

    try {
      setLoading(true);
      const loggedInUser = await authService.login(targetEmail, targetPassword);
      setUser(loggedInUser);
      await refreshUserData();
      router.replace('/');
    } catch (err: any) {
      const msg = err?.message || 'Đăng nhập không thành công, vui lòng thử lại';
      setPasswordError(msg);
      if (err?.code === 'ACCOUNT_NOT_VERIFIED') {
        Alert.alert('Tài khoản chưa xác thực', msg, [
          { text: 'Để sau', style: 'cancel' },
          {
            text: 'Xác thực OTP ngay',
            onPress: async () => {
              let resendAfterSeconds = 60;
              try {
                const res = await authService.resendOtp(targetEmail, 'REGISTER');
                resendAfterSeconds = res?.resendAfterSeconds ?? 60;
              } catch {
                // Cooldown đang chạy hoặc đã gửi trước đó, vẫn chuyển sang màn hình nhập OTP
              }
              router.push({
                pathname: '/verify-otp',
                params: { email: targetEmail, resendAfterSeconds },
              });
            },
          },
        ]);
      } else {
        Alert.alert('Đăng nhập thất bại', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      const googleUser = await authService.loginWithGoogle();
      if (!googleUser) {
        return;
      }
      setUser(googleUser);
      await refreshUserData();
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Đăng nhập Google thất bại', err?.message || 'Không thể đăng nhập bằng Google lúc này.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthScreen testID="login-screen">
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>

      <SurfaceCard>
        <ThemedText type="title" style={[styles.title, { color: theme.text }]}>
          {loginCopy.title}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {loginCopy.subtitle}
        </ThemedText>

        <View style={styles.fields}>
          <FormField
            label={loginCopy.emailLabel}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setEmailError(undefined);
            }}
            placeholder={authPlaceholders.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={emailError}
          />
          <FormField
            label={loginCopy.passwordLabel}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setPasswordError(undefined);
            }}
            placeholder={authPlaceholders.password}
            secureTextEntry={!showPassword}
            rightLabel={showPassword ? passwordVisibilityLabels.hide : passwordVisibilityLabels.show}
            rightLabelAccessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onRightLabelPress={() => setShowPassword((current) => !current)}
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => handleSubmit()}
            error={passwordError}
          />
        </View>

        <Pressable
          onPress={handleForgotPassword}
          accessibilityRole="link"
          accessibilityLabel={loginCopy.forgotPassword}
          hitSlop={Spacing.two}
          style={styles.forgot}
        >
          <Text style={[styles.forgotLabel, { color: theme.primary }]}>
            {loginCopy.forgotPassword}
          </Text>
        </Pressable>

        <AppButton
          label={loading ? 'Đang xử lý...' : loginCopy.submit}
          onPress={() => handleSubmit()}
          disabled={loading || googleLoading}
        />

        <View style={styles.divider}>
          <OrDivider label={loginCopy.divider} />
        </View>

        <SocialButton
          label={googleLoading ? 'Đang kết nối Google...' : loginCopy.google}
          onPress={handleGoogleSignIn}
          disabled={loading || googleLoading}
        />
      </SurfaceCard>

      <FooterLink
        question={loginCopy.footerQuestion}
        action={loginCopy.footerAction}
        onPress={() => router.replace('/register')}
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
    lineHeight: 20,
    marginBottom: Spacing.four,
    marginTop: Spacing.two,
  },
  fields: {
    gap: Spacing.three,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
  },
  forgotLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    marginVertical: Spacing.four,
  },
});

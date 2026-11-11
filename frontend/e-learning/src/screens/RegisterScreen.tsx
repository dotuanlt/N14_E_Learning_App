import { router } from '@/navigation/routerHook';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppButton } from '@/components/ui/app-button';
import { AuthScreen } from '@/components/ui/auth-screen';
import { BackButton } from '@/components/ui/back-button';
import { Checkbox } from '@/components/ui/checkbox';
import { FooterLink } from '@/components/ui/footer-link';
import { FormField } from '@/components/ui/form-field';
import { OrDivider } from '@/components/ui/or-divider';
import { SocialButton } from '@/components/ui/social-button';
import { SurfaceCard } from '@/components/ui/surface-card';
import { Spacing } from '@/constants/theme';
import {
  authPlaceholders,
  authValidationMessages,
  passwordVisibilityLabels,
  registerCopy,
  termsCopy,
} from '@/constants/auth';
import { useTheme } from '@/hooks/use-theme';
import type { RegisterFormErrors } from '@/types/auth';
import { isStrongEnoughPassword, isValidEmail } from '@/utils/validation';
import { authService } from '@/services/authService';
import { useAppStore } from '@/store';

export default function RegisterScreen() {
  const theme = useTheme();
  const { setUser, refreshUserData } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async () => {
    const nextErrors: RegisterFormErrors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (name.trim().length === 0) {
      nextErrors.name = authValidationMessages.nameRequired;
    }
    if (normalizedEmail.length === 0) {
      nextErrors.email = authValidationMessages.emailRequired;
    } else if (!isValidEmail(normalizedEmail)) {
      nextErrors.email = authValidationMessages.emailInvalid;
    }
    if (password.length === 0) {
      nextErrors.password = authValidationMessages.passwordRequired;
    } else if (!isStrongEnoughPassword(password)) {
      nextErrors.password = 'Mật khẩu tối thiểu 8 ký tự, gồm cả chữ và số.';
    }
    if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    if (!acceptedTerms) {
      nextErrors.acceptedTerms = authValidationMessages.termsRequired;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(
        name.trim(),
        normalizedEmail,
        password,
        confirmPassword,
        acceptedTerms,
      );
      router.push({
        pathname: '/verify-otp',
        params: {
          email: res?.email || normalizedEmail,
          expiresInSeconds: res?.expiresInSeconds ?? 300,
          resendAfterSeconds: res?.resendAfterSeconds ?? 60,
        },
      });
    } catch (err: any) {
      const msg = err?.message || 'Đăng ký không thành công, vui lòng thử lại';
      Alert.alert('Lỗi đăng ký', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
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
      Alert.alert('Đăng ký Google thất bại', err?.message || 'Không thể tiếp tục với Google lúc này.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthScreen testID="register-screen">
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} />
      </View>

      <SurfaceCard>
        <ThemedText type="title" style={[styles.title, { color: theme.text }]}>
          {registerCopy.title}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {registerCopy.subtitle}
        </ThemedText>

        <View style={styles.fields}>
          <FormField
            label={registerCopy.nameLabel}
            value={name}
            onChangeText={(value) => {
              setName(value);
              setErrors((current) => ({ ...current, name: undefined }));
            }}
            placeholder={authPlaceholders.name}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
            error={errors.name}
          />
          <FormField
            label={registerCopy.emailLabel}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            placeholder={authPlaceholders.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            error={errors.email}
          />
          <FormField
            label={registerCopy.passwordLabel}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrors((current) => ({ ...current, password: undefined }));
            }}
            placeholder="Ví dụ: Pass123456"
            secureTextEntry={!showPassword}
            rightLabel={showPassword ? passwordVisibilityLabels.hide : passwordVisibilityLabels.show}
            rightLabelAccessibilityLabel={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            onRightLabelPress={() => setShowPassword((current) => !current)}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="next"
            error={errors.password}
          />
          <FormField
            label="Xác nhận mật khẩu"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setErrors((current) => ({ ...current, confirmPassword: undefined }));
            }}
            placeholder="Nhập lại mật khẩu"
            secureTextEntry={!showConfirmPassword}
            rightLabel={showConfirmPassword ? passwordVisibilityLabels.hide : passwordVisibilityLabels.show}
            rightLabelAccessibilityLabel={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
            onRightLabelPress={() => setShowConfirmPassword((current) => !current)}
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            error={errors.confirmPassword}
          />
        </View>

        <View style={styles.terms}>
          <Checkbox
            checked={acceptedTerms}
            onCheckedChange={(checked) => {
              setAcceptedTerms(checked);
              setErrors((current) => ({ ...current, acceptedTerms: undefined }));
            }}
            accessibilityLabel="Tôi đồng ý với Điều khoản và Chính sách"
          >
            <Text style={[styles.termsText, { color: theme.textSecondary }]}>
              {termsCopy.prefix}{' '}
              <Text style={[styles.termsLink, { color: theme.primary }]}>{termsCopy.terms}</Text>{' '}
              {termsCopy.conjunction}{' '}
              <Text style={[styles.termsLink, { color: theme.primary }]}>{termsCopy.privacy}</Text>
            </Text>
          </Checkbox>
          {errors.acceptedTerms ? (
            <Text style={[styles.termsError, { color: theme.danger }]} accessibilityLiveRegion="polite">
              {errors.acceptedTerms}
            </Text>
          ) : null}
        </View>

        <AppButton
          label={loading ? 'Đang gửi mã OTP...' : registerCopy.submit}
          onPress={handleSubmit}
          disabled={loading || googleLoading}
        />

        <View style={styles.divider}>
          <OrDivider label={registerCopy.divider} />
        </View>

        <SocialButton
          label={googleLoading ? 'Đang kết nối Google...' : registerCopy.google}
          onPress={handleGoogleSignUp}
          disabled={loading || googleLoading}
        />
      </SurfaceCard>

      <FooterLink
        question={registerCopy.footerQuestion}
        action={registerCopy.footerAction}
        onPress={() => router.replace('/login')}
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
  terms: {
    marginVertical: Spacing.three,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    flexShrink: 1,
  },
  termsLink: {
    fontWeight: '600',
  },
  termsError: {
    fontSize: 12,
    marginTop: Spacing.one,
  },
  divider: {
    marginVertical: Spacing.four,
  },
});

import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { API_BASE_URL, apiClient, ENDPOINTS, resolveMediaUrl } from '@/api';
import { storage } from '@/storage';
import type { User } from '@/types/user';

function extractInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapRoleName(role?: string): string {
  if (!role) return 'Học viên';
  switch (role.toUpperCase()) {
    case 'ADMIN':
      return 'Quản trị viên';
    case 'INSTRUCTOR':
      return 'Giảng viên';
    case 'STUDENT':
    default:
      return 'Học viên';
  }
}

export interface OtpSentResponse {
  email: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
}

async function finalizeAuthSession(data: any, fallbackEmail = ''): Promise<User> {
  if (data.accessToken) {
    await storage.setItem('auth_token', data.accessToken);
  }
  if (data.refreshToken) {
    await storage.setItem('refresh_token', data.refreshToken);
  }

  const rawUser = data.user || {};
  const name = rawUser.fullName || rawUser.name || 'Người dùng';
  const resolvedAvatar = resolveMediaUrl(rawUser.avatarUrl);
  const roleLabel = mapRoleName(rawUser.role);

  let user: User = {
    id: rawUser.id,
    name,
    fullName: name,
    email: rawUser.email || fallbackEmail,
    role: roleLabel,
    avatar: resolvedAvatar,
    avatarUrl: resolvedAvatar,
    initials: extractInitials(name),
    location: 'Việt Nam',
    level: roleLabel,
    token: data.accessToken,
    refreshToken: data.refreshToken,
    stats: {
      saved: 0,
      inProgress: 0,
      completed: 0,
    },
  };

  try {
    const profile = await apiClient.get<any>(ENDPOINTS.USER.ME);
    if (profile) {
      const profileName = profile.fullName || user.fullName;
      const profileAvatar = resolveMediaUrl(profile.avatarUrl);
      const profileRole = mapRoleName(profile.role);
      user = {
        ...user,
        fullName: profileName,
        name: profileName,
        role: profileRole,
        level: profileRole,
        jobTitle: profile.jobTitle || undefined,
        bio: profile.bio || undefined,
        avatar: profileAvatar,
        avatarUrl: profileAvatar,
        initials: extractInitials(profileName),
        stats: {
          saved: profile.savedCount || 0,
          inProgress: profile.inProgressCount || 0,
          completed: profile.completedCount || 0,
        },
      };
    }
  } catch {
    // keep basic user if profile fails
  }

  await storage.setItem('current_user', user);
  return user;
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const data = await apiClient.post<any>(ENDPOINTS.AUTH.LOGIN, { email, password });
    return finalizeAuthSession(data, email);
  },

  async loginWithGoogle(): Promise<User | null> {
    const redirectUri = Linking.createURL('auth/google');
    const startUrl = `${API_BASE_URL}${ENDPOINTS.AUTH.GOOGLE_START}?redirectUri=${encodeURIComponent(redirectUri)}`;
    const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri);

    if (result.type !== 'success' || !result.url) {
      return null;
    }

    const parsed = Linking.parse(result.url);
    const rawError = parsed.queryParams?.error;
    const errorMsg = Array.isArray(rawError) ? rawError[0] : rawError;
    if (errorMsg) {
      throw new Error(String(errorMsg));
    }

    const rawCode = parsed.queryParams?.code;
    const code = Array.isArray(rawCode) ? rawCode[0] : rawCode;
    if (!code) {
      throw new Error('Không nhận được mã xác thực từ Google.');
    }

    const data = await apiClient.post<any>(ENDPOINTS.AUTH.GOOGLE_EXCHANGE, { code });
    return finalizeAuthSession(data);
  },

  async register(
    fullName: string,
    email: string,
    password: string,
    confirmPassword?: string,
    acceptedTerms = true,
  ): Promise<OtpSentResponse> {
    return apiClient.post<OtpSentResponse>(ENDPOINTS.AUTH.REGISTER, {
      fullName,
      email,
      password,
      confirmPassword: confirmPassword ?? password,
      acceptedTerms,
    });
  },

  async verifyOtp(email: string, otp: string): Promise<any> {
    return apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, {
      email,
      otp,
    });
  },

  async resendOtp(email: string, purpose: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER'): Promise<OtpSentResponse> {
    return apiClient.post<OtpSentResponse>(ENDPOINTS.AUTH.RESEND_OTP, {
      email,
      purpose,
    });
  },

  async forgotPassword(email: string): Promise<OtpSentResponse> {
    return apiClient.post<OtpSentResponse>(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async resetPassword(email: string, otp: string, newPassword: string): Promise<any> {
    return apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
      email,
      otp,
      newPassword,
    });
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await storage.getItem<string>('refresh_token');
      if (refreshToken) {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT, { refreshToken });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      await storage.removeItem('auth_token');
      await storage.removeItem('refresh_token');
      await storage.removeItem('current_user');
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const token = await storage.getItem<string>('auth_token');
    if (!token) return null;

    try {
      const profile = await apiClient.get<any>(ENDPOINTS.USER.ME);
      const name = profile.fullName || 'Người dùng';
      const resolvedAvatar = resolveMediaUrl(profile.avatarUrl);
      const roleLabel = mapRoleName(profile.role);
      const user: User = {
        id: profile.id,
        name,
        fullName: name,
        email: profile.email,
        role: roleLabel,
        jobTitle: profile.jobTitle || undefined,
        bio: profile.bio || undefined,
        avatar: resolvedAvatar,
        avatarUrl: resolvedAvatar,
        initials: extractInitials(name),
        location: 'Việt Nam',
        level: roleLabel,
        token,
        stats: {
          saved: profile.savedCount || 0,
          inProgress: profile.inProgressCount || 0,
          completed: profile.completedCount || 0,
        },
      };
      await storage.setItem('current_user', user);
      return user;
    } catch {
      return storage.getItem<User>('current_user');
    }
  },

  async uploadAvatar(asset: {
    uri: string;
    name?: string;
    mimeType?: string;
    file?: any;
  }): Promise<{ key: string; url: string }> {
    const mimeType = asset.mimeType || 'image/jpeg';
    const rawName = asset.name || `avatar-${Date.now()}.jpg`;
    const hasImageExt = /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(rawName);
    const extFromMime = mimeType.includes('png')
      ? 'png'
      : mimeType.includes('webp')
        ? 'webp'
        : mimeType.includes('gif')
          ? 'gif'
          : mimeType.includes('heic')
            ? 'heic'
            : mimeType.includes('heif')
              ? 'heif'
              : 'jpg';
    const safeName = hasImageExt ? rawName : `${rawName}.${extFromMime}`;

    const stored = await apiClient.uploadMultipart<{ key: string; url: string }>(
      `${ENDPOINTS.FILES.UPLOAD}?type=IMAGE`,
      {
        uri: asset.uri,
        name: safeName,
        mimeType,
        file: asset.file,
      },
    );
    return {
      key: stored.key,
      url: resolveMediaUrl(stored.url) || stored.url,
    };
  },

  async updateProfile(params: {
    fullName: string;
    jobTitle?: string;
    avatarUrl?: string | null;
    bio?: string;
  }): Promise<User> {
    const profile = await apiClient.put<any>(ENDPOINTS.USER.UPDATE_PROFILE, {
      fullName: params.fullName,
      jobTitle: params.jobTitle,
      avatarUrl: params.avatarUrl === null ? '' : params.avatarUrl,
      bio: params.bio,
    });
    const current = (await storage.getItem<User>('current_user')) || ({} as User);
    const nextName = profile.fullName || params.fullName || current.name;
    const resolvedAvatar = resolveMediaUrl(profile.avatarUrl);
    const roleLabel = profile.role ? mapRoleName(profile.role) : current.role;
    const updated: User = {
      ...current,
      name: nextName,
      fullName: nextName,
      role: roleLabel,
      level: roleLabel,
      jobTitle: profile.jobTitle || undefined,
      bio: profile.bio || undefined,
      avatar: resolvedAvatar,
      avatarUrl: resolvedAvatar,
      initials: extractInitials(nextName),
    };
    await storage.setItem('current_user', updated);
    return updated;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    const refreshToken = await storage.getItem<string>('refresh_token');
    return apiClient.put(ENDPOINTS.USER.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
      refreshToken: refreshToken || undefined,
    });
  },
};

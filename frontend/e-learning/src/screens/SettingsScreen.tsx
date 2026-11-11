import {
  ActivityIndicator,
  Alert,
  Appearance,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter } from '@/navigation/routerHook';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { Image } from 'expo-image';

import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SettingsRow } from '@/components/ui/settings-row';
import { FontSizes, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { accountSettings, defaultLanguageLabel, supportSettings } from '@/constants/settings';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { useAppStore } from '@/store';
import { authService } from '@/services/authService';
import { cartService } from '@/services/cartService';
import { isStrongEnoughPassword } from '@/utils/validation';

type OrderHistoryItem = {
  code: string;
  date: string;
  courses: string;
  total: string;
  status: string;
  rawStatus: string;
};

const FAQS = [
  {
    q: 'Làm sao để bắt đầu học trên ứng dụng?',
    a: 'Vào tab "Khóa học của tôi" ở thanh điều hướng, nhấn vào khóa học bạn đã đăng ký để mở trình phát bài giảng.',
  },
  {
    q: 'Làm sao để nộp dự án và tải tài liệu?',
    a: 'Trong trang chi tiết bài học của khóa học, chọn tab "Dự án": nhấn "Tải dự án lên" để chọn file từ điện thoại và nhấn "Tải về" ở danh sách tài liệu.',
  },
  {
    q: 'Làm sao để nhận chứng chỉ hoàn thành?',
    a: 'Khi bạn xem đủ 100% tất cả các bài học trong khóa, hệ thống sẽ cấp chứng chỉ hiển thị tại mục "Chứng chỉ" ở trang Hồ sơ.',
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const { user, setUser, clearCart } = useAppStore();

  const [darkMode, setDarkMode] = useState(scheme === 'dark');
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguageLabel);
  const [activeModal, setActiveModal] = useState<'profile' | 'password' | 'orders' | 'language' | 'help' | null>(null);

  // Change Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // Order History State
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Profile Edit State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileLocation, setProfileLocation] = useState(user?.location || 'Việt Nam');
  const [profileAvatarPreview, setProfileAvatarPreview] = useState<string | null>(
    user?.avatar || user?.avatarUrl || null,
  );
  const [profileAvatarKey, setProfileAvatarKey] = useState<string | null>(
    user?.avatar || user?.avatarUrl || null,
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const displayName = user?.name || 'Khách';
  const displayEmail = user?.email || 'Chưa đăng nhập';
  const displayAvatar = user?.avatar || user?.avatarUrl;
  const displayInitials = user ? (user.initials || user.name.slice(0, 2).toUpperCase()) : 'K';

  const requireLoginPrompt = (featureName: string) => {
    Alert.alert('Yêu cầu đăng nhập', `Vui lòng đăng nhập để xem ${featureName}.`, [
      { text: 'Để sau', style: 'cancel' },
      { text: 'Đăng nhập', onPress: () => router.push('/login') },
    ]);
  };

  const openProfileModal = useCallback(() => {
    if (!user) {
      requireLoginPrompt('thông tin cá nhân');
      return;
    }
    const currentAvatar = user.avatar || user.avatarUrl || null;
    setProfileName(user.name || '');
    setProfileEmail(user.email || '');
    setProfileLocation(user.location || 'Việt Nam');
    setProfileAvatarPreview(currentAvatar);
    setProfileAvatarKey(currentAvatar);
    setActiveModal('profile');
  }, [user]);

  const handlePickAvatar = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }
      const asset = result.assets[0];
      setUploadingAvatar(true);
      const uploaded = await authService.uploadAvatar({
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType,
        file: (asset as any).file,
      });
      setProfileAvatarPreview(uploaded.url);
      setProfileAvatarKey(uploaded.key);
    } catch (err: any) {
      Alert.alert('Lỗi tải ảnh', err?.message || 'Không thể tải ảnh đại diện lên lúc này.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) {
      requireLoginPrompt('chỉnh sửa thông tin cá nhân');
      return;
    }
    if (!profileName.trim()) {
      Alert.alert('Lỗi', 'Họ tên không được để trống.');
      return;
    }
    try {
      setSavingProfile(true);
      const savedUser = await authService.updateProfile({
        fullName: profileName.trim(),
        jobTitle: user.jobTitle,
        avatarUrl: profileAvatarKey,
        bio: user.bio,
      });
      setUser({
        ...savedUser,
        location: profileLocation.trim() || savedUser.location,
      });
      Alert.alert('Thành công', 'Thông tin cá nhân đã được lưu thành công!');
      setActiveModal(null);
    } catch (err: any) {
      Alert.alert('Lỗi', err?.message || 'Không thể lưu thông tin lúc này.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) {
      requireLoginPrompt('đổi mật khẩu');
      return;
    }
    if (!currentPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại.');
      return;
    }
    if (!isStrongEnoughPassword(newPassword)) {
      Alert.alert('Lỗi', 'Mật khẩu mới tối thiểu 8 ký tự, gồm cả chữ và số.');
      return;
    }
    if (confirmNewPassword !== newPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setChangingPassword(true);
      await authService.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setActiveModal(null);
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được cập nhật.');
    } catch (err: any) {
      Alert.alert('Lỗi đổi mật khẩu', err?.message || 'Không thể đổi mật khẩu lúc này.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleRowPress = useCallback(
    async (id: string, label: string) => {
      if (id === 'logout') {
        if (!user) {
          router.push('/login');
          return;
        }
        await authService.logout();
        setOrders([]);
        setUser(null);
        clearCart();
        router.replace('/welcome');
      } else if (id === 'personal-info') {
        openProfileModal();
      } else if (id === 'change-password') {
        if (!user) {
          requireLoginPrompt('đổi mật khẩu');
          return;
        }
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setActiveModal('password');
      } else if (id === 'order-history') {
        if (!user) {
          requireLoginPrompt('lịch sử đơn hàng');
          return;
        }
        setActiveModal('orders');
        setOrdersLoading(true);
        setOrdersError(null);
        try {
          const data = await cartService.getOrders();
          setOrders(data);
        } catch (err: any) {
          setOrders([]);
          setOrdersError(err?.message || 'Không thể tải lịch sử đơn hàng');
        } finally {
          setOrdersLoading(false);
        }
      } else if (id === 'help') {
        setActiveModal('help');
      } else if (id === 'notifications') {
        if (!user) {
          requireLoginPrompt('thông báo');
          return;
        }
        router.push('/notifications');
      } else if (id === 'payment-methods') {
        if (!user) {
          requireLoginPrompt('phương thức thanh toán');
          return;
        }
        router.push('/checkout');
      } else {
        Alert.alert(label, 'Tính năng đang hoạt động bình thường.');
      }
    },
    [router, user, setUser, clearCart, openProfileModal],
  );

  const handleToggleDarkMode = useCallback((value: boolean) => {
    setDarkMode(value);
    Appearance.setColorScheme(value ? 'dark' : 'light');
  }, []);

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.background, paddingTop: insets.top + Spacing.two },
      ]}>
      <View style={styles.content}>
        <ScreenHeader title="Cài đặt" />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.five }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.column}>
          <Card style={styles.profileCard}>
            {displayAvatar ? (
              <Image
                source={{ uri: displayAvatar }}
                style={styles.avatarImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#ffd6a3' }]}>
                <Text style={styles.avatarLabel}>{displayInitials}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text numberOfLines={1} style={[styles.profileName, { color: theme.text }]}>
                {displayName}
              </Text>
              <Text numberOfLines={1} style={[styles.profileEmail, { color: theme.textSecondary }]}>
                {displayEmail}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sửa thông tin cá nhân"
              hitSlop={Spacing.two}
              onPress={openProfileModal}>
              {({ pressed }) => (
                <Text style={[styles.editLabel, { color: theme.primary, opacity: pressed ? 0.6 : 1 }]}>
                  Sửa
                </Text>
              )}
            </Pressable>
          </Card>

          <Card padded={false}>
            {accountSettings.items.map((item, index) => (
              <SettingsRow
                key={item.id}
                label={item.label}
                tone={item.tone}
                showDivider={index !== accountSettings.items.length - 1}
                onPress={() => handleRowPress(item.id, item.label)}
              />
            ))}
          </Card>

          <Card padded={false}>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>Chế độ tối</Text>
              <Switch
                value={darkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor="#FFFFFF"
                accessibilityLabel="Bật hoặc tắt chế độ tối"
              />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setActiveModal('language')}
              style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>Ngôn ngữ</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.one }}>
                <Text style={[styles.rowValue, { color: theme.textSecondary }]}>
                  {selectedLanguage}
                </Text>
                <Text style={{ color: theme.icon, fontSize: 16 }}>›</Text>
              </View>
            </Pressable>
          </Card>

          <Card padded={false}>
            {supportSettings.items.map((item, index) => (
              <SettingsRow
                key={item.id}
                label={item.label}
                tone={item.tone}
                showDivider={index !== supportSettings.items.length - 1}
                onPress={() => handleRowPress(item.id, item.label)}
              />
            ))}
          </Card>
        </View>
      </ScrollView>

      {/* MODAL THÔNG TIN CÁ NHÂN */}
      <Modal visible={activeModal === 'profile'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Thông tin cá nhân</Text>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8}>
                <Text style={[styles.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingBottom: Spacing.four }}>
              <View style={styles.avatarPickerBlock}>
                <Text style={[styles.avatarPickerTitle, { color: theme.text }]}>Ảnh đại diện</Text>
                <View style={styles.avatarPickerRow}>
                  {profileAvatarPreview ? (
                    <Image
                      source={{ uri: profileAvatarPreview }}
                      style={styles.avatarPreview}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={[styles.avatarPreviewPlaceholder, { backgroundColor: '#ffd6a3' }]}>
                      <Text style={styles.avatarPreviewLabel}>{displayInitials}</Text>
                    </View>
                  )}
                  <View style={styles.avatarPickerActions}>
                    <Pressable
                      onPress={handlePickAvatar}
                      disabled={uploadingAvatar}
                      style={[
                        styles.avatarActionBtn,
                        { backgroundColor: theme.primarySoft, borderColor: theme.primary },
                      ]}>
                      <Text style={[styles.avatarActionText, { color: theme.primary }]}>
                        {uploadingAvatar
                          ? 'Đang tải ảnh lên...'
                          : profileAvatarPreview
                            ? 'Đổi ảnh đại diện'
                            : 'Tải ảnh đại diện'}
                      </Text>
                    </Pressable>
                    {profileAvatarPreview ? (
                      <Pressable
                        onPress={() => {
                          setProfileAvatarPreview(null);
                          setProfileAvatarKey(null);
                        }}
                        disabled={uploadingAvatar}
                        style={styles.removeAvatarBtn}>
                        <Text style={[styles.removeAvatarText, { color: theme.danger }]}>
                          Xóa ảnh hiện tại
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              </View>

              <FormField
                label="Họ và tên"
                placeholder="Nhập họ và tên"
                value={profileName}
                onChangeText={setProfileName}
              />
              <FormField
                label="Địa chỉ Email"
                placeholder="Nhập địa chỉ email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={profileEmail}
                onChangeText={setProfileEmail}
                editable={false}
              />
              <FormField
                label="Địa chỉ / Tỉnh thành"
                placeholder="Ví dụ: TP. Hồ Chí Minh"
                value={profileLocation}
                onChangeText={setProfileLocation}
              />
              <FormField
                label="Trình độ / Vai trò"
                placeholder="Ví dụ: Học viên"
                value={user?.role || 'Học viên'}
                onChangeText={() => {}}
                editable={false}
              />
              <PrimaryButton
                label={savingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                onPress={handleSaveProfile}
                disabled={savingProfile || uploadingAvatar}
                style={{ marginTop: Spacing.two }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal visible={activeModal === 'password'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Đổi mật khẩu</Text>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8}>
                <Text style={[styles.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingBottom: Spacing.four }}>
              <FormField
                label="Mật khẩu hiện tại"
                placeholder="Nhập mật khẩu hiện tại"
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <FormField
                label="Mật khẩu mới"
                placeholder="Tối thiểu 8 ký tự (gồm chữ và số)"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <FormField
                label="Xác nhận mật khẩu mới"
                placeholder="Nhập lại mật khẩu mới"
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <PrimaryButton
                label={changingPassword ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
                onPress={handleChangePassword}
                disabled={changingPassword}
                style={{ marginTop: Spacing.two }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL LỊCH SỬ ĐƠN HÀNG */}
      <Modal visible={activeModal === 'orders'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Lịch sử đơn hàng</Text>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8}>
                <Text style={[styles.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: Spacing.two, paddingBottom: Spacing.four }}>
              {ordersLoading ? (
                <View style={{ paddingVertical: Spacing.five, alignItems: 'center', gap: Spacing.two }}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={{ color: theme.textSecondary, fontSize: FontSizes.sm }}>
                    Đang tải lịch sử đơn hàng...
                  </Text>
                </View>
              ) : ordersError ? (
                <View style={{ paddingVertical: Spacing.five, alignItems: 'center' }}>
                  <Text style={{ color: theme.danger, fontSize: FontSizes.sm, textAlign: 'center' }}>
                    {ordersError}
                  </Text>
                </View>
              ) : orders.length === 0 ? (
                <View style={{ paddingVertical: Spacing.five, alignItems: 'center', gap: Spacing.one }}>
                  <Text style={{ color: theme.text, fontSize: FontSizes.base, fontWeight: '600' }}>
                    Chưa có đơn hàng nào
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontSize: FontSizes.sm, textAlign: 'center' }}>
                    Các khóa học bạn đã đặt mua sẽ xuất hiện tại đây.
                  </Text>
                </View>
              ) : (
                orders.map((order) => (
                  <View
                    key={order.code}
                    style={[styles.orderCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
                    <View style={styles.orderTop}>
                      <Text style={[styles.orderCode, { color: theme.primary }]}>{order.code}</Text>
                      <View
                        style={[
                          styles.badgePaid,
                          order.rawStatus !== 'PAID' && {
                            backgroundColor:
                              order.rawStatus === 'PENDING' ? '#fef3c7' : '#fee2e2',
                          },
                        ]}>
                        <Text
                          style={[
                            styles.badgePaidText,
                            order.rawStatus !== 'PAID' && {
                              color: order.rawStatus === 'PENDING' ? '#b45309' : '#b91c1c',
                            },
                          ]}>
                          {order.status}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.orderCourses, { color: theme.text }]}>{order.courses}</Text>
                    <View style={styles.orderBottom}>
                      <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                        {order.date ? `Ngày: ${order.date}` : ''}
                      </Text>
                      <Text style={[styles.orderTotal, { color: theme.primary }]}>{order.total}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL CHỌN NGÔN NGỮ */}
      <Modal visible={activeModal === 'language'} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.modalTitle, { color: theme.text, marginBottom: Spacing.three }]}>
              Chọn ngôn ngữ
            </Text>
            {['Tiếng Việt', 'English (US)'].map((lang) => {
              const active = selectedLanguage.startsWith(lang.slice(0, 5));
              return (
                <Pressable
                  key={lang}
                  onPress={() => {
                    setSelectedLanguage(lang);
                    setActiveModal(null);
                  }}
                  style={[
                    styles.langItem,
                    {
                      borderColor: active ? theme.primary : theme.border,
                      backgroundColor: active ? theme.primarySoft : 'transparent',
                    },
                  ]}>
                  <Text style={[styles.langText, { color: active ? theme.primary : theme.text }]}>
                    {lang}
                  </Text>
                  {active ? <Text style={{ color: theme.primary, fontWeight: '700' }}>✓</Text> : null}
                </Pressable>
              );
            })}
            <PrimaryButton
              label="Đóng"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: Spacing.two }}
            />
          </View>
        </View>
      </Modal>

      {/* MODAL TRỢ GIÚP & HỖ TRỢ */}
      <Modal visible={activeModal === 'help'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: theme.backgroundElement }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Trợ giúp & Hỗ trợ</Text>
              <Pressable onPress={() => setActiveModal(null)} hitSlop={8}>
                <Text style={[styles.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={{ gap: Spacing.three, paddingBottom: Spacing.four }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
                Câu hỏi thường gặp:
              </Text>
              {FAQS.map((faq, idx) => (
                <View
                  key={idx}
                  style={[styles.faqItem, { backgroundColor: theme.background, borderColor: theme.border }]}>
                  <Text style={[styles.faqQ, { color: theme.text }]}>❓ {faq.q}</Text>
                  <Text style={[styles.faqA, { color: theme.textSecondary }]}>👉 {faq.a}</Text>
                </View>
              ))}

              <View
                style={[
                  styles.contactCard,
                  { backgroundColor: theme.primarySoft, borderColor: theme.border },
                ]}>
                <Text style={[styles.contactTitle, { color: theme.primary }]}>
                  Tổng đài hỗ trợ 24/7
                </Text>
                <Text style={{ color: theme.text, fontSize: 13 }}>📞 Hotline: 1900 1234 (Miễn phí)</Text>
                <Text style={{ color: theme.text, fontSize: 13 }}>✉️ Email: hotro@elearning.fit.iuh.edu.vn</Text>
              </View>

              <PrimaryButton
                label="Đóng"
                onPress={() => setActiveModal(null)}
                style={{ marginTop: Spacing.two }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.three,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
  },
  column: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: Radius.pill,
  },
  avatarLabel: {
    color: '#181528',
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  avatarPickerBlock: {
    gap: Spacing.two,
  },
  avatarPickerTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarPreview: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
  },
  avatarPreviewPlaceholder: {
    width: 68,
    height: 68,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPreviewLabel: {
    color: '#181528',
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  avatarPickerActions: {
    flex: 1,
    gap: Spacing.one,
    alignItems: 'flex-start',
  },
  avatarActionBtn: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  avatarActionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  removeAvatarBtn: {
    paddingVertical: 2,
  },
  removeAvatarText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: FontSizes.sm,
  },
  editLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  rowValue: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.four,
    maxHeight: '85%',
  },
  modalBox: {
    margin: Spacing.four,
    borderRadius: Radius.xl,
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  modalClose: {
    fontSize: 20,
    fontWeight: '600',
    padding: Spacing.one,
  },
  orderCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderCode: {
    fontWeight: '700',
    fontSize: 14,
  },
  badgePaid: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  badgePaidText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: '700',
  },
  orderCourses: {
    fontSize: 13,
    fontWeight: '600',
  },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  orderTotal: {
    fontWeight: '700',
    fontSize: 14,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.two,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600',
  },
  faqItem: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 4,
  },
  faqQ: {
    fontWeight: '700',
    fontSize: 13,
  },
  faqA: {
    fontSize: 12,
    lineHeight: 18,
  },
  contactCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 4,
    marginTop: Spacing.one,
  },
  contactTitle: {
    fontWeight: '700',
    fontSize: 14,
  },
});

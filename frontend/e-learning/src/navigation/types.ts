import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  MyCourses: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  Home: undefined;
  Search: undefined;
  MyCourses: undefined;
  Profile: undefined;
  Welcome: undefined;
  Login: { email?: string } | undefined;
  Register: undefined;
  VerifyOtp: { email: string; expiresInSeconds?: number; resendAfterSeconds?: number };
  ForgotPassword: undefined;
  CourseDetail: { id: string };
  CourseCurriculum: { id: string };
  CourseReviews: { id: string };
  CoursePlayer: { id: string };
  CourseQa: { id: string };
  InstructorProfile: { id: string };
  Chat: { courseId?: string; lessonId?: string; conversationId?: string; prompt?: string } | undefined;
  Cart: undefined;
  Checkout: { ids?: string; couponCode?: string } | undefined;
  PaymentQr: {
    orderCode: string;
    provider: string;
    /** Các khóa học trong đơn, cách nhau bởi dấu phẩy (để dọn giỏ sau khi thanh toán). */
    ids?: string;
    total: string;
    paymentUrl?: string;
    expiresAt?: string;
    methodLabel?: string;
  };
  CheckoutSuccess: { orderId?: string; method?: string; total?: string } | undefined;
  Notifications: undefined;
  Settings: undefined;
  SearchFilter: undefined;
  SearchResults: { q?: string };
};

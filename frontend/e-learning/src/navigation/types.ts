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
  Checkout: undefined;
  CheckoutSuccess: undefined;
  Notifications: undefined;
  Settings: undefined;
  SearchFilter: undefined;
  SearchResults: { q?: string };
};

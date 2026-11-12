import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<RouteName extends keyof RootStackParamList>(
  name: RouteName,
  params?: any
) {
  if (navigationRef.isReady()) {
    if (name === ('Home' as any) || name === ('Search' as any) || name === ('MyCourses' as any) || name === ('Profile' as any)) {
      // @ts-ignore
      navigationRef.navigate('MainTabs', { screen: name });
      return;
    }
    // @ts-ignore
    navigationRef.navigate(name, params);
  }
}

export function goBack() {
  if (navigationRef.isReady()) {
    if (navigationRef.canGoBack()) {
      navigationRef.goBack();
    } else {
      // @ts-ignore
      navigationRef.navigate('MainTabs', { screen: 'Home' });
    }
  }
}

/** Sau khi thanh toán xong: bỏ các màn thanh toán khỏi ngăn xếp để nút Back không quay lại trả tiền lần nữa. */
export function resetToCheckoutSuccess(params: { orderId: string; method: string; total: string }) {
  if (!navigationRef.isReady()) return;
  navigationRef.reset({
    index: 1,
    routes: [{ name: 'MainTabs' }, { name: 'CheckoutSuccess', params }],
  });
}

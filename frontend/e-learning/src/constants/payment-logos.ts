import type { ImageSourcePropType } from 'react-native';

import type { PaymentProvider } from '@/types/payment';

/** Logo thương hiệu MoMo / ZaloPay (file nằm trong assets/images/payment/). Thiếu logo thì dùng ô chữ cái màu thương hiệu. */
export const PAYMENT_LOGOS: Partial<Record<PaymentProvider, ImageSourcePropType>> = {
  momo: require('../../assets/images/payment/MoMo_Logo_App.png'),
  zalopay: require('../../assets/images/payment/zalopay.jpg'),
};

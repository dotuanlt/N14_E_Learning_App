import { Image, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { PAYMENT_LOGOS } from '@/constants/payment-logos';
import { providerOf } from '@/constants/payment-providers';

type Props = {
  provider?: string | null;
  size?: number;
};

/** Logo nguồn thanh toán: ảnh thương hiệu nếu đã thêm file, nếu không thì ô chữ cái màu thương hiệu. */
export function BrandLogo({ provider, size = 44 }: Props) {
  const info = providerOf(provider);
  const source = PAYMENT_LOGOS[info.id];
  const radius = Math.round(size * 0.3);

  if (source) {
    // Logo là hình vuông kín nền: phủ đầy ô, bo góc, viền mảnh để logo nền trắng không "chìm" vào nền thẻ.
    return (
      <View style={[styles.box, { width: size, height: size, borderRadius: radius, backgroundColor: '#ffffff', borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e3f3' }]}>
        <Image source={source} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
    );
  }
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: radius, backgroundColor: info.color }]}>
      {info.kind === 'card' ? (
        <Icon name="card" weight="fill" size={size * 0.52} color="#ffffff" />
      ) : (
        <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: size * 0.48 }}>{info.monogram}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});

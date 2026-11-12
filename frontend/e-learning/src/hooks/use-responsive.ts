import { useWindowDimensions } from 'react-native';

import { useLayoutInfo } from './layout-context';

export type Breakpoint = 'compact' | 'medium' | 'expanded';

/** Ngưỡng: điện thoại < 600, máy tính bảng / cửa sổ hẹp 600–1023, máy tính ≥ 1024. */
export function breakpointOf(width: number): Breakpoint {
  if (width >= 1024) return 'expanded';
  if (width >= 600) return 'medium';
  return 'compact';
}

export type Responsive = {
  width: number;
  height: number;
  bp: Breakpoint;
  isCompact: boolean;
  isWide: boolean;
  /** Thanh điều hướng bên đang hiện (thanh tab dưới ẩn đi). */
  hasSidebar: boolean;
  /** Bề rộng tối đa cho màn hình đọc/biểu mẫu (chi tiết, giỏ hàng, chat...). */
  contentMax: number;
  /** Bề rộng tối đa cho màn hình duyệt (trang chủ, tìm kiếm, khóa học của tôi...). */
  wideMax: number;
  /** Lề ngang của nội dung. */
  gutter: number;
  /** Số cột cho lưới thẻ khóa học. */
  columns: number;
  /** Bề rộng thẻ khóa học trong hàng cuộn ngang. */
  cardWidth: number;
};

export function useResponsive(): Responsive {
  const win = useWindowDimensions();
  const layout = useLayoutInfo();
  // Trong AppShell, 'width' là bề rộng vùng nội dung (đã trừ sidebar) để bố cục co giãn đúng.
  const width = layout?.width ?? win.width;
  const height = win.height;
  const bp = breakpointOf(width);
  return {
    width,
    height,
    bp,
    isCompact: bp === 'compact',
    isWide: width >= 820,
    hasSidebar: layout?.hasSidebar ?? false,
    contentMax: bp === 'compact' ? 640 : 760,
    wideMax: bp === 'compact' ? 640 : bp === 'medium' ? 880 : 1180,
    gutter: 24,
    columns: bp === 'compact' ? 1 : bp === 'medium' ? 2 : 3,
    cardWidth: bp === 'compact' ? 220 : bp === 'medium' ? 240 : 260,
  };
}

/** Thêm ô trống để hàng cuối của lưới đủ cột (tránh thẻ cuối bị kéo giãn). */
export function padToColumns<T>(data: readonly T[], columns: number): (T | null)[] {
  if (columns <= 1) return [...data];
  const rest = data.length % columns;
  return rest === 0 ? [...data] : [...data, ...Array.from({ length: columns - rest }, () => null)];
}

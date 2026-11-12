import { createContext, useContext } from 'react';

export type LayoutInfo = {
  /** Bề rộng thực của vùng nội dung (đã trừ thanh điều hướng bên nếu có). */
  width: number;
  /** Thanh điều hướng bên đang hiện (màn rộng) -> thanh tab dưới tự ẩn. */
  hasSidebar: boolean;
};

export const LayoutContext = createContext<LayoutInfo | null>(null);

export function useLayoutInfo() {
  return useContext(LayoutContext);
}

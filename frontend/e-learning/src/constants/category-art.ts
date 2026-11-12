/**
 * Ảnh minh họa (sẽ được làm mờ) cho thẻ Danh mục, khóa theo slug của danh mục.
 * Sửa/đổi ảnh tại đây. Nếu backend trả sẵn `imageUrl` cho danh mục thì ưu tiên ảnh đó.
 * Ảnh lỗi/không tải được thì thẻ tự rơi về nền gradient + icon, không bị trống.
 */
const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=480&q=50`;

export const CATEGORY_ART: Record<string, string> = {
  business: u('photo-1460925895917-afdab827c52f'),
  design: u('photo-1561070791-2526d30994b8'),
  code: u('photo-1498050108023-c5249f4df085'),
  writing: u('photo-1455390582262-044cdead277a'),
  movie: u('photo-1485846234645-a62644f84728'),
  language: u('photo-1546410531-bb4caa6b424d'),
};

/** Màu nhấn đậm (đủ tương phản với chữ trắng) theo slug; danh mục lạ lấy theo thứ tự trong bảng dưới. */
export const CATEGORY_ACCENT: Record<string, string> = {
  business: '#4f46e5',
  design: '#ec4899',
  code: '#10b981',
  writing: '#f59e0b',
  movie: '#8b5cf6',
  language: '#0ea5e9',
};
export const ACCENT_FALLBACKS = ['#6366f1', '#14b8a6', '#f97316', '#e11d48', '#84cc16', '#0891b2'];

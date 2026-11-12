import { apiClient, ENDPOINTS } from '@/api';
import type { CartItem } from '@/types/cart';
import type { CouponOption, OrderInfo, PaymentProvider, Quote } from '@/types/payment';

const PASTEL_COLORS = ['#c9bcff', '#ffd6a3', '#b2eedf', '#ffbfd2', '#ffe8a3', '#d0e1fd'];

export const cartService = {
  async getCart(): Promise<{ items: CartItem[]; subtotal: number; savings: number; total: number }> {
    try {
      const data = await apiClient.get<any>(ENDPOINTS.CART.GET);
      const rawItems = data?.items || [];
      const items: CartItem[] = rawItems.map((item: any, idx: number) => {
        const c = item.course || {};
        const price = item.priceAtAdded ?? c.salePrice ?? c.originalPrice ?? 0;
        return {
          id: c.id,
          courseId: c.id,
          title: c.title || 'Khóa học',
          author: c.instructor?.fullName || 'Giảng viên',
          price: Number(price),
          thumbnailColor: PASTEL_COLORS[idx % PASTEL_COLORS.length],
          thumbnailLabel: (c.category?.name || 'Khóa học').slice(0, 3).toUpperCase(),
          image: c.thumbnailUrl || undefined,
        };
      });

      return {
        items,
        subtotal: Number(data?.originalTotal ?? 0),
        savings: Number(data?.savings ?? 0),
        total: Number(data?.subtotal ?? 0),
      };
    } catch (err) {
      console.warn('cartService.getCart error:', err);
      return { items: [], subtotal: 0, savings: 0, total: 0 };
    }
  },

  async addToCart(courseId: string): Promise<any> {
    return apiClient.post(ENDPOINTS.CART.ADD_ITEM, { courseId });
  },

  async removeFromCart(courseId: string): Promise<any> {
    return apiClient.delete(ENDPOINTS.CART.REMOVE_ITEM(courseId));
  },

  async validateCoupon(code: string, courseIds: string[]): Promise<any> {
    return apiClient.post(ENDPOINTS.COUPONS.VALIDATE, { code, courseIds });
  },

  /** Báo giá chính thức từ server (không tin số tiền tính ở client). */
  async quote(courseIds: string[], couponCode?: string): Promise<Quote> {
    return apiClient.post<Quote>(ENDPOINTS.ORDERS.QUOTE, { courseIds, couponCode: couponCode || undefined });
  },

  /** Khuyến mãi đang chạy kèm khả năng áp dụng cho các khóa đã chọn. */
  async availableCoupons(courseIds: string[]): Promise<CouponOption[]> {
    const res = await apiClient.post<CouponOption[]>(ENDPOINTS.COUPONS.AVAILABLE, { courseIds });
    return Array.isArray(res) ? res : [];
  },

  /** Tạo đơn (PENDING). Việc ghi nhận thanh toán chỉ xảy ra khi cổng xác nhận, không tự hoàn tất ở đây. */
  async createOrder(params: {
    courseIds: string[];
    provider: PaymentProvider;
    couponCode?: string;
  }): Promise<OrderInfo> {
    return apiClient.post<OrderInfo>(ENDPOINTS.ORDERS.CREATE, {
      courseIds: params.courseIds,
      method: 'MOCK',
      provider: params.provider.toUpperCase(),
      couponCode: params.couponCode || undefined,
    });
  },

  async getOrder(orderCode: string): Promise<OrderInfo> {
    return apiClient.get<OrderInfo>(ENDPOINTS.ORDERS.DETAIL(orderCode));
  },

  /** Giả lập phản hồi của ví / cổng thẻ: SUCCESS = xác nhận, FAILED = từ chối. */
  async mockPay(orderCode: string, result: 'SUCCESS' | 'FAILED'): Promise<OrderInfo> {
    return apiClient.post<OrderInfo>(`${ENDPOINTS.ORDERS.MOCK_PAY(orderCode)}?result=${result}`);
  },

  async getOrders(): Promise<
    {
      code: string;
      date: string;
      courses: string;
      total: string;
      status: string;
      rawStatus: string;
    }[]
  > {
    const data = await apiClient.get<any>(ENDPOINTS.ORDERS.LIST + '?page=0&size=50');
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    const statusMap: Record<string, string> = {
      PAID: 'Đã thanh toán',
      PENDING: 'Chờ thanh toán',
      FAILED: 'Thanh toán thất bại',
      CANCELLED: 'Đã hủy',
    };
    return items.map((order: any) => {
      const rawStatus = String(order.status || 'PENDING').toUpperCase();
      const rawDate = order.paidAt || order.createdAt;
      const dateStr = rawDate ? new Date(rawDate).toLocaleDateString('vi-VN') : '';
      const courseNames = Array.isArray(order.items)
        ? order.items.map((i: any) => i.courseTitle).filter(Boolean).join(', ')
        : '';
      return {
        code: order.orderCode || '',
        date: dateStr,
        courses: courseNames || 'Khóa học',
        total: `${Number(order.totalAmount ?? 0).toLocaleString('vi-VN')} đ`,
        status: statusMap[rawStatus] || rawStatus,
        rawStatus,
      };
    });
  },

  async getOrderDetail(orderCode: string): Promise<any> {
    return apiClient.get(ENDPOINTS.ORDERS.DETAIL(orderCode));
  },
};

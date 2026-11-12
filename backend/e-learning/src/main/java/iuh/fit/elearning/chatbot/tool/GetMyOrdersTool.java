package iuh.fit.elearning.chatbot.tool;

import iuh.fit.elearning.common.response.PageResponse;
import iuh.fit.elearning.order.dto.response.OrderItemResponse;
import iuh.fit.elearning.order.dto.response.OrderResponse;
import iuh.fit.elearning.order.entity.enums.OrderStatus;
import iuh.fit.elearning.order.service.OrderService;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Đơn hàng của chính người dùng. Không có paymentUrl nên không lộ link thanh toán. */
@Component
public class GetMyOrdersTool implements ChatTool {

    private final OrderService orderService;

    public GetMyOrdersTool(OrderService orderService) {
        this.orderService = orderService;
    }

    @Override
    public String name() {
        return "get_my_orders";
    }

    @Override
    public String description() {
        return "Tra cứu đơn hàng của chính người dùng: trạng thái (PENDING/PAID/FAILED/CANCELLED), tổng tiền, các khóa "
                + "trong đơn. Truyền order_code để xem một đơn; bỏ trống để xem 5 đơn gần nhất.";
    }

    @Override
    public Map<String, Object> parameters() {
        return ToolArgs.schema(new String[][]{
                {"order_code", "string", "Mã đơn hàng"}
        });
    }

    @Override
    public Object execute(ChatToolContext ctx, Map<String, Object> args) {
        String code = ToolArgs.string(args, "order_code");
        List<OrderResponse> orders;
        if (code != null) {
            orders = List.of(orderService.get(ctx.user().id(), code));
        } else {
            PageResponse<OrderResponse> page = orderService.list(ctx.user().id(), 0, 5);
            orders = page.items();
        }
        List<Map<String, Object>> items = orders.stream().map(o -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("order_code", o.orderCode());
            m.put("status", o.status());
            m.put("payment_method", o.method());
            m.put("subtotal_vnd", o.subtotal());
            m.put("discount_vnd", o.discountAmount());
            m.put("total_vnd", o.totalAmount());
            m.put("coupon", o.couponCode());
            m.put("created_at", o.createdAt());
            m.put("paid_at", o.paidAt());
            if (o.status() == OrderStatus.PENDING) {
                m.put("expires_at", o.expiresAt());
            }
            m.put("courses", o.items().stream().map(OrderItemResponse::courseTitle).toList());
            return m;
        }).toList();
        return Map.of("orders", items);
    }
}

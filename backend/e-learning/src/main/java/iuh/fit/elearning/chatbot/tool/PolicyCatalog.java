package iuh.fit.elearning.chatbot.tool;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Quy định nghiệp vụ của ứng dụng (nguồn: SRS mục 2.5 và SDS 7.8). Bot chỉ được trả lời về chính sách dựa trên nội
 * dung này, tránh bịa. Khi đổi quy tắc trong RefundService / LearningService... nhớ cập nhật tại đây.
 */
final class PolicyCatalog {

    static final Map<String, String> POLICIES = new LinkedHashMap<>();

    static {
        POLICIES.put("refund", "Hoàn tiền: học viên được yêu cầu hoàn tiền trong vòng 7 ngày kể từ khi mua và khi tiến độ "
                + "học dưới 20%. Số tiền hoàn = giá khóa học trừ phần giảm giá được phân bổ theo tỷ lệ giá. Khi hoàn tiền "
                + "thành công, quyền truy cập khóa học bị thu hồi. Khóa miễn phí không có hoàn tiền. Chỉ áp dụng cho khóa "
                + "đã thanh toán và còn đang học (chưa hoàn thành, chưa hoàn tiền trước đó).");
        POLICIES.put("payment", "Thanh toán: học viên chọn khóa học trong giỏ hàng, có thể áp một mã giảm giá rồi thanh toán "
                + "trực tuyến (cổng VNPay; ở môi trường thử nghiệm có trang thanh toán giả lập). Số tiền do hệ thống tính "
                + "theo giá hiện hành, không dùng số tiền do người dùng nhập. Đơn đang chờ thanh toán quá 15 phút sẽ tự "
                + "hủy. Thanh toán thành công thì tự động ghi danh. Khóa học 0 đồng được ghi danh ngay khi thêm vào giỏ.");
        POLICIES.put("coupon", "Mã giảm giá: mỗi đơn chỉ áp dụng tối đa một mã. Mã phải còn thời hạn, còn lượt sử dụng và đơn "
                + "đạt giá trị tối thiểu của mã. Mã theo phần trăm có thể bị giới hạn mức giảm tối đa; mã số tiền cố định "
                + "không vượt quá tạm tính của đơn. Lượt dùng mã được tính khi thanh toán thành công.");
        POLICIES.put("certificate", "Chứng chỉ: tự động cấp khi hoàn thành 100% bài giảng của khóa học (không cần duyệt), "
                + "mỗi học viên một chứng chỉ cho mỗi khóa, có mã dạng ELN-yyyyMM-xxxxxxxx. Xem trong Hồ sơ > Chứng chỉ; "
                + "có thể tra cứu công khai và tải PDF theo mã.");
        POLICIES.put("progress", "Tiến độ: một bài giảng được tính hoàn thành khi học viên xem tối thiểu 90% thời lượng video; "
                + "bài đã hoàn thành không bị bỏ đánh dấu. Tiến độ khóa học = số bài hoàn thành / tổng số bài x 100%. "
                + "Hệ thống nhớ vị trí xem gần nhất của từng bài.");
        POLICIES.put("review", "Đánh giá: chỉ học viên đã mua khóa và đạt tiến độ tối thiểu 20% mới được đánh giá; mỗi người "
                + "một đánh giá cho mỗi khóa và được chỉnh sửa.");
        POLICIES.put("access", "Truy cập nội dung: khách chưa đăng nhập vẫn tìm kiếm, xem chi tiết khóa học, bài học thử và hồ sơ "
                + "giảng viên. Lưu khóa học, thêm vào giỏ, mua, học bài, hỏi đáp, nộp dự án cần đăng nhập. Chỉ bài học "
                + "thử xem miễn phí; các bài còn lại cần mua khóa. Chỉ học viên đã mua và giảng viên của khóa mới đặt "
                + "câu hỏi, bình luận và nộp dự án.");
        POLICIES.put("account", "Tài khoản: đăng ký bằng email, xác thực bằng mã OTP 6 số có hiệu lực 5 phút (gửi lại sau 60 giây). "
                + "Đăng nhập sai 5 lần sẽ bị khóa 15 phút. Quên mật khẩu thì nhận OTP qua email để đặt lại. Tài khoản "
                + "mới là Học viên; quyền Giảng viên do quản trị viên cấp.");
    }

    private PolicyCatalog() {
    }
}

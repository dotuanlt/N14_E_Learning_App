# Báo cáo rà soát hệ thống (bảo mật, hiệu năng, độ ổn định)

Phạm vi: backend Spring Boot + frontend Expo/React Native. Mức độ: **Cao** / **Trung bình** / **Thấp**.
Trạng thái: ✅ đã sửa trong đợt này · ⚠️ cần bạn quyết định / cấu hình · 📝 đề xuất.

## 1. Bảo mật

| # | Mức | Phát hiện | Rủi ro | Phương án | Trạng thái |
|---|-----|-----------|--------|-----------|-----------|
| S1 | Cao | `/api/v1/payments/**` mở công khai; trang giả lập `/mock/{orderCode}/complete` đánh dấu đơn đã thanh toán mà không cần đăng nhập (`app.payment.mock-enabled=true` mặc định) | Ai biết mã đơn có thể "mua" khóa học miễn phí nếu chạy ngoài môi trường dev | Đặt `PAYMENT_MOCK_ENABLED=false` khi triển khai thật hoặc chỉ bật theo profile `dev` | ⚠️ |
| S2 | Cao | `app.jwt.secret` có giá trị mặc định công khai trong `application.properties`; `STORAGE_SIGNING_SECRET` lấy theo | Giả mạo token / URL tệp | Bắt buộc đặt `JWT_SECRET` ngẫu nhiên ≥ 32 ký tự; từ chối khởi động nếu còn giá trị mặc định ở prod | ⚠️ |
| S3 | Trung bình | CORS `app.cors.allowed-origins` mặc định `*` | Website lạ gọi được API | Đặt danh sách origin cụ thể ở production | ⚠️ |
| S4 | Trung bình | Token trước đây chỉ nằm trong RAM trên điện thoại (mất khi tắt app); web dùng `localStorage` | Mất đăng nhập; web dễ bị XSS đọc token | Native: `expo-secure-store` (Keychain/Keystore). Web: cân nhắc cookie HttpOnly nếu làm bản thương mại | ✅ native / 📝 web |
| S5 | Trung bình | Bộ lọc JWT truy vấn DB ở mỗi request | Chậm, nhưng khóa tài khoản phải có hiệu lực nhanh | `AuthUserCache` TTL 30 giây, tự xóa khi admin đổi trạng thái/vai trò (sau commit) | ✅ |
| S6 | Trung bình | Chatbot: prompt-injection, tool lộ dữ liệu người khác | Lộ dữ liệu | Tool lấy `AuthUser` từ phiên, không nhận userId từ mô hình; giới hạn 30 tin/giờ/người dùng; giới hạn độ dài | ✅ |
| S7 | Thấp | `.env` chứa khóa thật (Neon, Gmail, Google OAuth, Gemini) | Lộ khóa nếu đẩy lên git hoặc chia sẻ | Kiểm tra `.gitignore` có `.env`; **đổi/thu hồi khóa nếu từng chia sẻ ra ngoài** | ⚠️ |
| S8 | Thấp | `/api/v1/auth/google/mock-consent` công khai | Chỉ liên quan chế độ giả lập Google | Tắt khi dùng Google OAuth thật | ⚠️ |

## 2. Hiệu năng

| # | Mức | Nguyên nhân chậm | Giải pháp | Trạng thái |
|---|-----|------------------|-----------|-----------|
| P1 | Cao | Neon ở us-east-2, mỗi truy vấn ~250 ms từ Việt Nam; một API gọi 3–6 truy vấn tuần tự = 1–2 giây | Chuyển Neon sang vùng **Singapore (ap-southeast-1)** hoặc dùng Postgres cục bộ khi phát triển | ⚠️ cần bạn chọn |
| P2 | Cao | Mỗi request tốn 1 truy vấn để xác thực người dùng | `AuthUserCache` | ✅ |
| P3 | Cao | `ChatService` chạy tuần tự lịch sử → ngữ cảnh → mô hình → công cụ | Tải song song; công cụ chạy song song mỗi vòng (virtual threads) | ✅ |
| P4 | Trung bình | Pool mặc định, không log truy vấn chậm, JSON không nén | Cấu hình Hikari, log truy vấn chậm, nén phản hồi | ✅ |
| P5 | Cao | App không có cache: mỗi lần mở Trang chủ chờ 4 API, màn hình trắng | `queryCache` + `useQuery` (hiện dữ liệu cũ ngay, tải mới ở nền, lưu qua lần mở sau), kéo để làm mới | ✅ Trang chủ · 📝 các màn còn lại |
| P6 | Trung bình | `getCourseDetail` gọi chi tiết rồi mới gọi "khóa tương tự" | Gọi song song khi đã có UUID | ✅ |
| P7 | Trung bình | Bộ nhớ native chỉ là `Map` trong RAM | AsyncStorage + SecureStore | ✅ |
| P8 | Trung bình | Danh sách dùng `ScrollView + map`, không `memo` | `FlatList`/`FlashList`, `React.memo` cho thẻ khóa học | 📝 |
| P9 | Thấp | Chưa có skeleton khi tải | Thêm `Skeleton` thay vòng quay | 📝 |
| P10 | Thấp | Chat chờ mô hình trả lời xong mới hiện | Streaming SSE để chữ hiện dần | 📝 |

## 3. Độ ổn định / lỗi tiềm ẩn

| # | Mức | Vấn đề | Cách xử lý |
|---|-----|--------|-----------|
| R1 | Trung bình | Lịch sử chat nằm trong state màn hình → mất khi thoát | `ChatProvider` cấp ứng dụng, lưu theo người dùng, đồng bộ server ✅ |
| R2 | Trung bình | Gemini miễn phí có thể 429/timeout | Fallback Gemini → Groq → mock ✅; lỗi có nút "Thử lại" ✅ |
| R3 | Trung bình | `ChatRateLimiter`, `AuthUserCache` chỉ có hiệu lực trong 1 tiến trình | Nếu chạy nhiều bản sao, chuyển sang Redis |
| R4 | Thấp | Bảng chat tạo bằng script thủ công (`ddl-auto=validate`) → lỗi `missing table` nếu quên | Dùng Flyway/Liquibase |
| R5 | Thấp | `ChatToolContext` được tool dùng song song | Đã đồng bộ ✅ |
| R6 | Thấp | Chưa có kiểm thử tự động phía app | Thêm Jest cho `queryCache`, `ChatProvider` |

## 4. Việc cần làm sau khi nhận bản này

1. Frontend: `npm install` (thêm `phosphor-react-native`, `react-native-svg`, `expo-linear-gradient`, `@react-native-async-storage/async-storage`, `expo-secure-store`), rồi `npx expo start -c`. Bản điện thoại dùng development build cần build lại vì có thư viện native mới.
2. Backend: `./mvnw clean verify` rồi chạy lại. Mã Spring chưa biên dịch được trong môi trường của tôi; gửi lại log nếu có lỗi.
3. Quyết định các mục ⚠️.

# Hướng dẫn chạy ứng dụng bằng Docker

Toàn bộ ứng dụng (web + backend + Redis) chạy bằng **một lệnh**. Cơ sở dữ liệu là PostgreSQL trên **Neon** (cloud),
nên máy chạy cần có Internet.

```
Trình duyệt ──► http://localhost:3000  (nginx: giao diện web + chuyển tiếp /api)
                         │
                         ▼
                  backend :8080 (Spring Boot) ──► Redis (OTP)
                         │
                         ▼
                   Neon PostgreSQL (cloud)
```

## 1. Yêu cầu

- Docker Desktop (Windows/macOS) hoặc Docker Engine + Compose v2 (Linux). Kiểm tra: `docker compose version`.
- Trống các cổng **3000** và **8080**.
- Internet (tải thư viện lần build đầu và kết nối Neon).

## 2. Cấu hình (làm một lần)

```powershell
copy .env.example .env      # macOS/Linux: cp .env.example .env
```

Mở `.env` và điền tối thiểu:

| Biến | Ý nghĩa |
|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Thông tin kết nối Neon (copy từ file `.env` của backend đang dùng) |
| `JWT_SECRET` | Chuỗi bí mật ≥ 32 ký tự |
| `GEMINI_API_KEY` (và/hoặc `GROQ_API_KEY`) | Khóa trợ lý AI. Để trống thì đặt `CHAT_PROVIDER=mock` |
| `PUBLIC_BASE_URL` | `http://localhost:8080`; muốn quét QR bằng điện thoại thì dùng IP LAN, xem mục 5 |

`OTP_ALLOW_DEV_CODE=true` cho phép nhập mã OTP **123456** khi đăng ký / quên mật khẩu, nên không cần email thật.

## 3. Chạy

```powershell
docker compose up --build -d
```

Lần đầu mất khoảng 5-10 phút (build backend bằng Maven và build web bằng Expo). Các lần sau chạy gần như tức thì.

Theo dõi tiến trình:

```powershell
docker compose ps                 # backend phải ở trạng thái healthy (khoảng 1 phút sau khi start)
docker compose logs -f backend    # xem log; Ctrl+C để thoát
```

Sau đó mở **http://localhost:3000**.

| Địa chỉ | Nội dung |
|---|---|
| http://localhost:3000 | Ứng dụng web |
| http://localhost:8080/api/v1/categories | Kiểm tra nhanh API backend |

## 4. Các lệnh thường dùng

```powershell
docker compose stop                 # tạm dừng
docker compose start                # chạy lại
docker compose down                 # xóa container (giữ lại tệp đã upload)
docker compose down -v              # xóa luôn volume tệp upload
docker compose up --build -d        # build lại sau khi sửa mã nguồn
docker compose logs --tail=100 backend
```

## 5. Thanh toán MoMo / ZaloPay bằng điện thoại thật

Mã QR chứa đường dẫn tới backend. Điện thoại phải mở được đường dẫn đó:

1. Máy chạy Docker và điện thoại cùng Wi-Fi.
2. Lấy IP LAN của máy (Windows: `ipconfig`, dòng IPv4, ví dụ `192.168.1.10`).
3. Trong `.env` đặt `PUBLIC_BASE_URL=http://192.168.1.10:8080`, rồi chạy `docker compose up -d` để backend nạp lại.
4. Cho phép cổng 8080 qua Windows Firewall nếu được hỏi.

Không cấu hình bước này vẫn thử được bằng nút **"Mô phỏng quét mã"** ngay trên màn hình thanh toán.

## 6. Xử lý sự cố

| Triệu chứng | Cách xử lý |
|---|---|
| `port is already allocated` | Đổi cổng bên trái trong `ports:` của `docker-compose.yml` (ví dụ `"3001:80"`) |
| Backend khởi động rồi tắt, log báo lỗi database | Kiểm tra `DB_URL`, user, mật khẩu trong `.env`; Neon free có thể đang "ngủ", đợi vài giây rồi `docker compose restart backend` |
| Log báo `missing table` / `Schema-validation` | Database Neon chưa có schema; chạy script tạo bảng (`documents/database/e-learning.sql`) trên Neon |
| Trang web trắng hoặc lỗi mạng | `docker compose ps` xem backend đã healthy chưa; xem `docker compose logs backend` |
| Không nhận được email OTP | Bình thường khi chưa cấu hình SMTP; nhập mã **123456** hoặc xem mã trong log backend |
| Sửa `.env` nhưng không có hiệu lực | `docker compose up -d` (tạo lại container); sửa mã nguồn thì thêm `--build` |
| Build backend bị lỗi tải thư viện | Kiểm tra Internet / proxy rồi chạy lại `docker compose build backend` |

## 7. Chuẩn bị nộp bài

Nộp thư mục dự án (zip hoặc GitHub). **Không nộp** các thư mục nặng và tự sinh:
`node_modules/`, `backend/e-learning/target/`, `frontend/e-learning/.expo/`, `dist/`, `.git/`.

- File `.env` chứa mật khẩu Neon và khóa API. Nếu nộp kèm `.env` thật để giáo viên chạy được ngay, hãy **đổi mật khẩu
  Neon và thu hồi/đổi khóa API sau khi chấm xong**. Nếu không, chỉ nộp `.env.example` kèm hướng dẫn này.
- Gửi kèm tài khoản mẫu để giáo viên đăng nhập (hoặc để giáo viên tự đăng ký với OTP `123456`).

## 8. Chạy trên điện thoại (Expo Go)

Bản Expo Go không đóng gói vào Docker được. Muốn xem trên điện thoại:

```powershell
cd frontend\e-learning
npm install
npx expo start -c
```

Backend vẫn dùng bản trong Docker (cổng 8080); app tự dò IP máy chủ từ Metro.

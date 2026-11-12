# Trợ lý AI (chatbot)

Trợ lý trả lời bằng cách **gọi hàm tra cứu dữ liệu có sẵn** (không cần vector DB): mô hình AI quyết định gọi hàm nào,
backend chạy hàm (chỉ đọc) rồi trả kết quả lại cho mô hình để soạn câu trả lời.

## Kiến trúc

```
App (ChatScreen) -> POST /api/v1/chat -> ChatService
                                           |- ChatRateLimiter (30 tin/giờ/người dùng)
                                           |- ChatPromptBuilder (system prompt tiếng Việt + ngữ cảnh khóa/bài)
                                           |- vòng lặp: LlmClient.generate -> ChatToolRegistry.execute -> ...
                                           `- ChatHistoryService (lưu lịch sử, dựng thẻ khóa học)
LlmClient: GeminiLlmClient | OpenAiCompatibleLlmClient (Groq...) | MockLlmClient, bọc FallbackLlmClient
```

Các hàm (`chatbot/tool`): `search_courses`, `list_categories`, `get_course_detail`, `get_course_curriculum`,
`get_policies`, `get_my_learning`, `get_my_orders`, `get_course_qa`.

**Bảo mật**
* Hàm không nhận `userId` từ mô hình; luôn dùng người dùng trong JWT. Khóa học chưa công khai chỉ xem được nếu là chủ
  sở hữu/giảng viên/admin (`CourseService.requireViewable`).
* `courseId`/`lessonId` từ client được kiểm tra lại phía server; hội thoại chỉ truy cập được bởi chủ của nó.
* Nội dung khóa học/hỏi đáp được coi là dữ liệu, system prompt dặn mô hình không làm theo chỉ dẫn nằm trong đó.
* Bot không thực hiện thao tác ghi (mua, hoàn tiền, đổi mật khẩu).
* Dữ liệu gửi tới nhà cung cấp AI gồm câu hỏi và kết quả hàm; gói miễn phí của Google có thể dùng dữ liệu để cải thiện
  sản phẩm, nên đừng dùng dữ liệu thật nhạy cảm khi chạy thật.

## Cài đặt

1. Tạo bảng (chạy một lần, không xóa dữ liệu cũ; Hibernate `validate` sẽ báo lỗi nếu thiếu):
   `psql -U postgres -d e_learning -f db/chatbot-schema.sql`
2. Lấy khóa miễn phí tại <https://aistudio.google.com/apikey>, rồi trong `backend/e-learning/.env`:
   ```
   CHAT_PROVIDER=gemini
   GEMINI_API_KEY=...
   # tùy chọn: dự phòng khi hết hạn mức (khóa tại https://console.groq.com/keys)
   CHAT_FALLBACK_PROVIDER=openai
   GROQ_API_KEY=...
   ```
   Để `CHAT_PROVIDER=mock` (mặc định) thì chạy được ngay không cần khóa, bot trả lời mẫu để thử giao diện.
3. Build/chạy: `./mvnw clean verify` rồi `./mvnw spring-boot:run`.
4. Trong app: nút 🤖 ở Trang chủ, hoặc "Hỏi trợ lý AI về khóa học này" ở Chi tiết khóa học / Trình phát.

## Cấu hình (`app.chat.*`)

| Khóa | Mặc định | Ý nghĩa |
|---|---|---|
| `provider` / `fallback-provider` | `mock` / rỗng | `mock`, `gemini`, `openai` |
| `max-message-length` | 1000 | Số ký tự tối đa mỗi câu hỏi |
| `history-messages` | 12 | Số tin nhắn gần nhất gửi kèm cho mô hình |
| `max-tool-rounds` | 4 | Số vòng gọi hàm tối đa mỗi câu hỏi |
| `rate-limit-per-hour` | 30 | Giới hạn mỗi người dùng (0 = tắt) |
| `gemini.model` | `gemini-flash-latest` | Đổi nếu hạn mức/tên model thay đổi |
| `openai.base-url` / `model` | Groq / `llama-3.3-70b-versatile` | Mọi API chuẩn OpenAI (Groq, OpenRouter...) |

Giới hạn của gói miễn phí thay đổi theo thời gian; khi gặp 429 backend trả 503 và (nếu cấu hình) chuyển sang nhà dự phòng.

## Hạn chế đã biết
* Bot chưa xem được nội dung video/transcript; trả lời trợ giảng dựa trên mục lục, mô tả, hỏi đáp và kiến thức chung.
* Giới hạn tần suất lưu trong bộ nhớ (một instance); chạy nhiều instance cần chuyển sang Redis.
* Chưa streaming: app chờ trả lời đầy đủ (thường vài giây).

package iuh.fit.elearning.chatbot.service;

import iuh.fit.elearning.auth.security.AuthUser;
import iuh.fit.elearning.chatbot.dto.ChatMessageResponse;
import iuh.fit.elearning.chatbot.dto.ChatRequest;
import iuh.fit.elearning.chatbot.dto.ChatResponse;
import iuh.fit.elearning.chatbot.entity.ChatRole;
import iuh.fit.elearning.chatbot.llm.LlmClient;
import iuh.fit.elearning.chatbot.llm.LlmException;
import iuh.fit.elearning.chatbot.llm.LlmMessage;
import iuh.fit.elearning.chatbot.llm.LlmRequest;
import iuh.fit.elearning.chatbot.llm.LlmResponse;
import iuh.fit.elearning.chatbot.llm.LlmToolCall;
import iuh.fit.elearning.chatbot.tool.ChatToolContext;
import iuh.fit.elearning.chatbot.tool.ChatToolRegistry;
import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.config.ChatProperties;
import iuh.fit.elearning.course.dto.response.CourseSummaryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Supplier;

/**
 * Điều phối một lượt chat: dựng ngữ cảnh -> gọi mô hình -> (nếu mô hình yêu cầu) chạy hàm tra cứu và gọi lại ->
 * lưu lịch sử. Lớp này CỐ Ý không có @Transactional: lời gọi mô hình mất vài giây, không được giữ kết nối CSDL.
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final ExecutorService IO = Executors.newVirtualThreadPerTaskExecutor();
    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int MAX_CARDS = 5;
    private static final int MAX_REPLY_CHARS = 6000;
    private static final String EMPTY_REPLY =
            "Xin lỗi, mình chưa tìm được câu trả lời phù hợp. Bạn thử hỏi lại cụ thể hơn nhé!";

    private final LlmClient llm;
    private final ChatToolRegistry tools;
    private final ChatHistoryService history;
    private final ChatRateLimiter rateLimiter;
    private final ChatProperties props;

    public ChatService(LlmClient llm, ChatToolRegistry tools, ChatHistoryService history,
                       ChatRateLimiter rateLimiter, ChatProperties props) {
        this.llm = llm;
        this.tools = tools;
        this.history = history;
        this.rateLimiter = rateLimiter;
        this.props = props;
    }

    /**
     * Mỗi lượt DB mất một khoảng round-trip (đáng kể khi CSDL ở xa), nên các truy vấn độc lập được chạy SONG SONG
     * bằng virtual thread thay vì nối đuôi nhau: tải ngữ cảnh trước khi gọi mô hình, chạy nhiều hàm cùng lúc,
     * và lưu lịch sử song song với việc dựng thẻ khóa học.
     */
    public ChatResponse chat(AuthUser user, ChatRequest request) {
        long t0 = System.nanoTime();
        String message = request.message().strip();
        if (message.isEmpty()) {
            throw BusinessException.badRequest("Vui lòng nhập nội dung");
        }
        if (message.length() > props.maxMessageLength()) {
            throw BusinessException.badRequest(
                    "Câu hỏi quá dài (tối đa " + props.maxMessageLength() + " ký tự), vui lòng rút gọn");
        }
        rateLimiter.acquire(user.id());

        // --- 1) Tải ngữ cảnh song song (courseId/lessonId do client gửi được kiểm tra lại phía server)
        UUID conversationId = request.conversationId();
        CompletableFuture<String> nameF = async(() -> history.displayName(user.id()));
        CompletableFuture<ConversationContext> convF = async(() -> loadConversation(user, conversationId));
        CompletableFuture<CourseContext> directCourseF = request.courseId() == null ? null
                : async(() -> loadCourse(user, request.courseId(), request.lessonId()));

        ConversationContext conv = join(convF);
        CourseContext course;
        if (directCourseF != null) {
            course = join(directCourseF);
        } else if (conv.courseId() != null) {
            course = loadCourse(user, conv.courseId(), request.lessonId());
        } else {
            course = CourseContext.NONE;
        }
        String userName = join(nameF);
        long t1 = System.nanoTime();

        String system = ChatPromptBuilder.build(userName, LocalDate.now(VN), course.title(), course.lessonTitle());
        List<LlmMessage> messages = new ArrayList<>();
        for (ChatHistoryService.HistoryItem h : conv.history()) {
            if (messages.isEmpty() && h.role() != ChatRole.USER) {
                continue; // mô hình yêu cầu lượt đầu là của người dùng
            }
            messages.add(h.role() == ChatRole.USER ? LlmMessage.user(h.content()) : LlmMessage.assistant(h.content()));
        }
        messages.add(LlmMessage.user(message));

        // --- 2) Vòng lặp gọi mô hình + hàm
        ChatToolContext ctx = new ChatToolContext(user, course.contextCourseId());
        String reply = runModel(system, messages, ctx);
        long t2 = System.nanoTime();

        // --- 3) Dựng thẻ khóa học và lưu lịch sử song song
        List<UUID> referenced = ctx.referencedCourseIds().stream().limit(MAX_CARDS).toList();
        UUID savedCourseId = course.contextCourseId();
        CompletableFuture<List<CourseSummaryResponse>> cardsF = async(() -> history.cards(referenced, user.id()));
        CompletableFuture<ChatHistoryService.Saved> savedF = async(() -> history.saveExchange(
                user.id(), conversationId, savedCourseId, message, reply, referenced));
        List<CourseSummaryResponse> cards = join(cardsF);
        ChatHistoryService.Saved saved = join(savedF);
        long t3 = System.nanoTime();

        log.info("chat user={} ctx={}ms model={}ms save={}ms total={}ms", user.id(), ms(t0, t1), ms(t1, t2),
                ms(t2, t3), ms(t0, t3));
        return new ChatResponse(saved.conversationId(), saved.title(),
                new ChatMessageResponse(saved.replyId(), ChatRole.ASSISTANT.name(), reply, cards,
                        saved.replyCreatedAt()));
    }

    // ------------------------------------------------------------------ tải ngữ cảnh

    private record ConversationContext(UUID courseId, List<ChatHistoryService.HistoryItem> history) {
    }

    private record CourseContext(UUID contextCourseId, String title, String lessonTitle) {
        static final CourseContext NONE = new CourseContext(null, null, null);
    }

    private ConversationContext loadConversation(AuthUser user, UUID conversationId) {
        if (conversationId == null) {
            return new ConversationContext(null, List.of());
        }
        ChatHistoryService.ConversationRef ref = history.requireConversation(user.id(), conversationId);
        return new ConversationContext(ref.courseId(), history.recentMessages(conversationId, props.historyMessages()));
    }

    private CourseContext loadCourse(AuthUser user, UUID courseId, UUID lessonId) {
        String title = history.courseTitle(courseId, user);
        if (title == null) {
            return CourseContext.NONE;
        }
        return new CourseContext(courseId, title, history.lessonTitle(lessonId, courseId));
    }

    // ------------------------------------------------------------------ gọi mô hình

    private String runModel(String system, List<LlmMessage> messages, ChatToolContext ctx) {
        int maxRounds = Math.max(1, props.maxToolRounds());
        try {
            for (int round = 0; round <= maxRounds; round++) {
                boolean lastRound = round == maxRounds; // vòng cuối tắt hàm để buộc mô hình trả lời bằng chữ
                LlmResponse response = llm.generate(new LlmRequest(system, List.copyOf(messages),
                        lastRound ? List.of() : tools.specs()));
                if (!response.hasToolCalls() || lastRound) {
                    return finalizeReply(response.text());
                }
                messages.add(LlmMessage.assistant(response.text(), response.toolCalls()));
                // Các hàm trong cùng một vòng độc lập với nhau -> chạy song song, giữ nguyên thứ tự kết quả.
                List<CompletableFuture<String>> results = response.toolCalls().stream()
                        .map(call -> async(() -> tools.execute(ctx, call))).toList();
                for (int i = 0; i < results.size(); i++) {
                    LlmToolCall call = response.toolCalls().get(i);
                    messages.add(LlmMessage.tool(call.id(), call.name(), join(results.get(i))));
                }
            }
        } catch (LlmException e) {
            log.warn("Gọi mô hình AI ({}) thất bại: kind={}, status={}, {}", llm.name(), e.getKind(),
                    e.getHttpStatus(), e.getMessage());
            String text = e.getKind() == LlmException.Kind.RATE_LIMITED
                    ? "Trợ lý AI đang quá tải, vui lòng thử lại sau ít phút."
                    : "Trợ lý AI đang bận hoặc chưa được cấu hình, vui lòng thử lại sau.";
            throw new BusinessException(ErrorCode.SERVICE_UNAVAILABLE, text);
        }
        return EMPTY_REPLY;
    }

    // ------------------------------------------------------------------ tiện ích song song

    private static <T> CompletableFuture<T> async(Supplier<T> task) {
        return CompletableFuture.supplyAsync(task, IO);
    }

    /** Chờ kết quả; ném lại đúng ngoại lệ gốc (BusinessException...) thay vì CompletionException. */
    private static <T> T join(CompletableFuture<T> future) {
        try {
            return future.join();
        } catch (CompletionException e) {
            if (e.getCause() instanceof RuntimeException re) {
                throw re;
            }
            throw e;
        }
    }

    private static long ms(long fromNanos, long toNanos) {
        return (toNanos - fromNanos) / 1_000_000;
    }

    private static String finalizeReply(String text) {
        String t = text == null ? "" : text.strip();
        if (t.isEmpty()) {
            return EMPTY_REPLY;
        }
        return t.length() > MAX_REPLY_CHARS ? t.substring(0, MAX_REPLY_CHARS) + "…" : t;
    }
}

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

/**
 * Điều phối một lượt chat: dựng ngữ cảnh -> gọi mô hình -> (nếu mô hình yêu cầu) chạy hàm tra cứu và gọi lại ->
 * lưu lịch sử. Lớp này CỐ Ý không có @Transactional: lời gọi mô hình mất vài giây, không được giữ kết nối CSDL.
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
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

    public ChatResponse chat(AuthUser user, ChatRequest request) {
        String message = request.message().strip();
        if (message.isEmpty()) {
            throw BusinessException.badRequest("Vui lòng nhập nội dung");
        }
        if (message.length() > props.maxMessageLength()) {
            throw BusinessException.badRequest(
                    "Câu hỏi quá dài (tối đa " + props.maxMessageLength() + " ký tự), vui lòng rút gọn");
        }
        rateLimiter.acquire(user.id());

        // --- ngữ cảnh (kiểm tra quyền sở hữu hội thoại, courseId/lessonId do client gửi không được tin tưởng)
        UUID conversationId = request.conversationId();
        UUID conversationCourseId = null;
        List<ChatHistoryService.HistoryItem> past = List.of();
        if (conversationId != null) {
            ChatHistoryService.ConversationRef ref = history.requireConversation(user.id(), conversationId);
            conversationCourseId = ref.courseId();
            past = history.recentMessages(conversationId, props.historyMessages());
        }
        UUID wantedCourseId = request.courseId() != null ? request.courseId() : conversationCourseId;
        String courseTitle = history.courseTitle(wantedCourseId, user);
        UUID contextCourseId = courseTitle == null ? null : wantedCourseId;
        String lessonTitle = history.lessonTitle(request.lessonId(), contextCourseId);

        String system = ChatPromptBuilder.build(history.displayName(user.id()), LocalDate.now(VN),
                courseTitle, lessonTitle);

        List<LlmMessage> messages = new ArrayList<>();
        for (ChatHistoryService.HistoryItem h : past) {
            if (messages.isEmpty() && h.role() != ChatRole.USER) {
                continue; // mô hình yêu cầu lượt đầu là của người dùng
            }
            messages.add(h.role() == ChatRole.USER ? LlmMessage.user(h.content()) : LlmMessage.assistant(h.content()));
        }
        messages.add(LlmMessage.user(message));

        // --- vòng lặp gọi mô hình + hàm
        ChatToolContext ctx = new ChatToolContext(user, contextCourseId);
        String reply = runModel(system, messages, ctx);

        // --- lưu và trả về
        List<UUID> referenced = ctx.referencedCourseIds().stream().limit(MAX_CARDS).toList();
        List<CourseSummaryResponse> cards = history.cards(referenced, user.id());
        List<UUID> shownIds = cards.stream().map(CourseSummaryResponse::id).toList();

        ChatHistoryService.Saved saved = history.saveExchange(user.id(), conversationId, contextCourseId,
                message, reply, shownIds);
        return new ChatResponse(saved.conversationId(), saved.title(),
                new ChatMessageResponse(saved.replyId(), ChatRole.ASSISTANT.name(), reply, cards,
                        saved.replyCreatedAt()));
    }

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
                for (LlmToolCall call : response.toolCalls()) {
                    messages.add(LlmMessage.tool(call.id(), call.name(), tools.execute(ctx, call)));
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

    private static String finalizeReply(String text) {
        String t = text == null ? "" : text.strip();
        if (t.isEmpty()) {
            return EMPTY_REPLY;
        }
        return t.length() > MAX_REPLY_CHARS ? t.substring(0, MAX_REPLY_CHARS) + "…" : t;
    }
}

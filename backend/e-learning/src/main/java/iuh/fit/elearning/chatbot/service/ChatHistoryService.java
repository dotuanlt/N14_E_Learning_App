package iuh.fit.elearning.chatbot.service;

import iuh.fit.elearning.auth.security.AuthUser;
import iuh.fit.elearning.chatbot.dto.ChatMessageResponse;
import iuh.fit.elearning.chatbot.dto.ConversationResponse;
import iuh.fit.elearning.chatbot.entity.ChatConversation;
import iuh.fit.elearning.chatbot.entity.ChatMessage;
import iuh.fit.elearning.chatbot.entity.ChatRole;
import iuh.fit.elearning.chatbot.repository.ChatConversationRepository;
import iuh.fit.elearning.chatbot.repository.ChatMessageRepository;
import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.course.dto.response.CourseSummaryResponse;
import iuh.fit.elearning.course.entity.Course;
import iuh.fit.elearning.course.entity.Lesson;
import iuh.fit.elearning.course.repository.CourseRepository;
import iuh.fit.elearning.course.repository.LessonRepository;
import iuh.fit.elearning.course.service.CourseService;
import iuh.fit.elearning.user.entity.User;
import iuh.fit.elearning.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Mọi thao tác DB của chatbot nằm ở đây (mỗi phương thức một transaction ngắn), để ChatService có thể gọi mô hình
 * AI (chậm) mà không giữ kết nối CSDL.
 */
@Service
public class ChatHistoryService {

    private static final int TITLE_MAX = 60;
    private static final int MAX_CARDS = 5;

    /** Cuộc trò chuyện sẵn sàng dùng (id null nghĩa là sẽ tạo khi lưu lượt đầu tiên). */
    public record ConversationRef(UUID id, UUID courseId, String title) {
    }

    /** Tin nhắn dạng đơn giản đưa cho mô hình. */
    public record HistoryItem(ChatRole role, String content) {
    }

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CourseService courseService;

    public ChatHistoryService(ChatConversationRepository conversationRepository,
                              ChatMessageRepository messageRepository, UserRepository userRepository,
                              CourseRepository courseRepository, LessonRepository lessonRepository,
                              CourseService courseService) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.lessonRepository = lessonRepository;
        this.courseService = courseService;
    }

    // ------------------------------------------------------------------ đọc ngữ cảnh

    @Transactional(readOnly = true)
    public String displayName(UUID userId) {
        return userRepository.findById(userId).map(User::getFullName).orElse(null);
    }

    /** Cuộc trò chuyện thuộc về userId, hoặc 404. */
    @Transactional(readOnly = true)
    public ConversationRef requireConversation(UUID userId, UUID conversationId) {
        ChatConversation c = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy cuộc trò chuyện"));
        return new ConversationRef(c.getId(), c.getCourseId(), c.getTitle());
    }

    /** Tên khóa học nếu người dùng được phép xem; ngược lại null (không tin courseId từ client). */
    @Transactional(readOnly = true)
    public String courseTitle(UUID courseId, AuthUser viewer) {
        if (courseId == null) {
            return null;
        }
        try {
            return courseService.requireViewable(courseId, viewer).getTitle();
        } catch (BusinessException e) {
            return null;
        }
    }

    /** Tên bài học nếu bài đó thuộc khóa học courseId; ngược lại null (không tin lessonId từ client). */
    @Transactional(readOnly = true)
    public String lessonTitle(UUID lessonId, UUID courseId) {
        if (lessonId == null || courseId == null) {
            return null;
        }
        return lessonRepository.findById(lessonId)
                .filter((Lesson l) -> l.getSection().getCourse().getId().equals(courseId))
                .map(Lesson::getTitle).orElse(null);
    }

    /** N tin nhắn gần nhất theo thứ tự thời gian tăng dần. */
    @Transactional(readOnly = true)
    public List<HistoryItem> recentMessages(UUID conversationId, int limit) {
        List<ChatMessage> latest = new ArrayList<>(
                messageRepository.findByConversationIdOrderByCreatedAtDesc(conversationId, PageRequest.of(0, limit)));
        Collections.reverse(latest);
        return latest.stream().map(m -> new HistoryItem(m.getRole(), m.getContent())).toList();
    }

    // ------------------------------------------------------------------ ghi

    /**
     * Lưu một lượt hỏi - đáp. Tạo cuộc trò chuyện mới nếu conversationId null. Lưu cả hai tin nhắn cùng lúc để một
     * lượt bị lỗi AI không để lại câu hỏi "mồ côi".
     */
    @Transactional
    public Saved saveExchange(UUID userId, UUID conversationId, UUID courseId, String userText, String assistantText,
                              List<UUID> courseIds) {
        ChatConversation conversation;
        if (conversationId == null) {
            conversation = conversationRepository.save(ChatConversation.builder()
                    .user(userRepository.getReferenceById(userId))
                    .courseId(courseId)
                    .title(makeTitle(userText))
                    .build());
        } else {
            conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                    .orElseThrow(() -> BusinessException.notFound("Không tìm thấy cuộc trò chuyện"));
        }
        // saveAndFlush từng tin để created_at tăng dần chắc chắn (câu hỏi trước câu trả lời)
        messageRepository.saveAndFlush(ChatMessage.builder()
                .conversation(conversation).role(ChatRole.USER).content(userText).build());
        ChatMessage reply = messageRepository.saveAndFlush(ChatMessage.builder()
                .conversation(conversation).role(ChatRole.ASSISTANT).content(assistantText)
                .courseIds(courseIds.isEmpty() ? null : joinIds(courseIds)).build());
        conversation.setMessageCount(conversation.getMessageCount() + 2);
        return new Saved(conversation.getId(), conversation.getTitle(), reply.getId(), reply.getCreatedAt());
    }

    public record Saved(UUID conversationId, String title, UUID replyId, java.time.Instant replyCreatedAt) {
    }

    @Transactional
    public void deleteConversation(UUID userId, UUID conversationId) {
        ChatConversation c = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy cuộc trò chuyện"));
        messageRepository.deleteByConversationId(c.getId());
        conversationRepository.delete(c);
    }

    // ------------------------------------------------------------------ đọc cho API

    @Transactional(readOnly = true)
    public List<ConversationResponse> listConversations(UUID userId, int size) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId, PageRequest.of(0, size)).stream()
                .map(c -> new ConversationResponse(c.getId(), c.getTitle(), c.getCourseId(), c.getMessageCount(),
                        c.getUpdatedAt()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> messages(UUID userId, UUID conversationId) {
        ChatConversation c = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> BusinessException.notFound("Không tìm thấy cuộc trò chuyện"));
        List<ChatMessage> list = messageRepository.findByConversationIdOrderByCreatedAtAsc(c.getId());

        Set<UUID> all = new LinkedHashSet<>();
        for (ChatMessage m : list) {
            all.addAll(parseIds(m.getCourseIds()));
        }
        Map<UUID, CourseSummaryResponse> cards = new HashMap<>();
        for (CourseSummaryResponse s : cards(new ArrayList<>(all), userId)) {
            cards.put(s.id(), s);
        }
        return list.stream().map(m -> {
            List<CourseSummaryResponse> own = parseIds(m.getCourseIds()).stream()
                    .map(cards::get).filter(java.util.Objects::nonNull).limit(MAX_CARDS).toList();
            return new ChatMessageResponse(m.getId(), m.getRole().name(), m.getContent(), own, m.getCreatedAt());
        }).toList();
    }

    /** Thẻ khóa học cho danh sách id: chỉ khóa đang hiển thị công khai, giữ nguyên thứ tự id. */
    @Transactional(readOnly = true)
    public List<CourseSummaryResponse> cards(List<UUID> ids, UUID viewerId) {
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<UUID, Course> byId = new HashMap<>();
        for (Course c : courseRepository.findAllById(ids)) {
            if (CourseService.isPubliclyVisible(c)) {
                byId.put(c.getId(), c);
            }
        }
        List<Course> ordered = new ArrayList<>();
        for (UUID id : ids) {
            Course c = byId.get(id);
            if (c != null) {
                ordered.add(c);
            }
        }
        return courseService.summarize(ordered, viewerId);
    }

    // ------------------------------------------------------------------ tiện ích

    static String makeTitle(String text) {
        String t = text.strip().replaceAll("\\s+", " ");
        return t.length() <= TITLE_MAX ? t : t.substring(0, TITLE_MAX - 1) + "…";
    }

    private static String joinIds(List<UUID> ids) {
        StringBuilder sb = new StringBuilder();
        for (UUID id : ids) {
            if (sb.length() > 0) {
                sb.append(',');
            }
            sb.append(id);
        }
        return sb.toString();
    }

    static List<UUID> parseIds(String csv) {
        if (csv == null || csv.isBlank()) {
            return List.of();
        }
        List<UUID> out = new ArrayList<>();
        for (String part : csv.split(",")) {
            try {
                out.add(UUID.fromString(part.trim()));
            } catch (IllegalArgumentException ignored) {
                // bỏ qua giá trị hỏng
            }
        }
        return out;
    }
}

package iuh.fit.elearning.chatbot.controller;

import iuh.fit.elearning.auth.security.AuthUser;
import iuh.fit.elearning.chatbot.dto.ChatMessageResponse;
import iuh.fit.elearning.chatbot.dto.ChatRequest;
import iuh.fit.elearning.chatbot.dto.ChatResponse;
import iuh.fit.elearning.chatbot.dto.ConversationResponse;
import iuh.fit.elearning.chatbot.service.ChatHistoryService;
import iuh.fit.elearning.chatbot.service.ChatService;
import iuh.fit.elearning.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/** Trợ lý AI. Yêu cầu đăng nhập (SecurityConfig: anyRequest().authenticated()). */
@RestController
@RequestMapping("/api/v1/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatHistoryService historyService;

    public ChatController(ChatService chatService, ChatHistoryService historyService) {
        this.chatService = chatService;
        this.historyService = historyService;
    }

    @PostMapping
    public ApiResponse<ChatResponse> chat(@AuthenticationPrincipal AuthUser user,
                                          @Valid @RequestBody ChatRequest request) {
        return ApiResponse.ok(chatService.chat(user, request));
    }

    @GetMapping("/conversations")
    public ApiResponse<List<ConversationResponse>> conversations(
            @AuthenticationPrincipal AuthUser user, @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(historyService.listConversations(user.id(), Math.min(Math.max(size, 1), 50)));
    }

    @GetMapping("/conversations/{id}/messages")
    public ApiResponse<List<ChatMessageResponse>> messages(@AuthenticationPrincipal AuthUser user,
                                                           @PathVariable UUID id) {
        return ApiResponse.ok(historyService.messages(user.id(), id));
    }

    @DeleteMapping("/conversations/{id}")
    public ApiResponse<Void> delete(@AuthenticationPrincipal AuthUser user, @PathVariable UUID id) {
        historyService.deleteConversation(user.id(), id);
        return ApiResponse.ok("Đã xóa cuộc trò chuyện", null);
    }
}

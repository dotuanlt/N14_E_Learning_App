import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';

import { ScreenHeader } from '@/components/ui/screen-header';
import { FontSizes, MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { RootStackParamList } from '@/navigation/types';
import { useAppStore } from '@/store/AppContext';
import { useChat } from '@/store/ChatContext';
import { Icon } from '@/components/ui/icon';
import type { ChatCourseCard, ChatMessage } from '@/types/chat';

const MAX_LENGTH = 1000;

const GENERAL_SUGGESTIONS = [
  'Gợi ý khóa học lập trình',
  'Khóa học nào đang được đánh giá cao nhất?',
  'Mình đã mua những khóa nào, nên học gì tiếp?',
];
const COURSE_SUGGESTIONS = [
  'Khóa học này gồm những nội dung gì?',
  'Khóa này có phù hợp với người mới không?',
  'Giảng viên đã trả lời những câu hỏi nào?',
  'Gợi ý lộ trình học sau khóa này',
];

function formatVnd(amount: number): string {
  if (!amount) return 'Miễn phí';
  return `${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}đ`;
}

export default function ChatScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<RootStackParamList, 'Chat'>>();
  const { user } = useAppStore();

  const courseId = route.params?.courseId;
  const lessonId = route.params?.lessonId;
  const initialPrompt = route.params?.prompt;

  const { messages, conversationId, sending, hydrating, send: sendMessage, newChat: resetChat, openConversation, markRead } = useChat();
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const sentInitial = useRef(false);
  const loading = hydrating && messages.length === 0;

  // Mở lại một cuộc trò chuyện cũ (nếu được truyền vào)
  useEffect(() => {
    const id = route.params?.conversationId;
    if (!id || !user || id === conversationId) return;
    openConversation(id).catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.conversationId, user]);

  // Đang ở màn hình chat nghĩa là đã xem hết tin nhắn mới
  useEffect(() => {
    markRead();
  }, [messages.length, markRead]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
  }, []);

  const send = useCallback(
    async (raw: string, opts?: { retry?: boolean }) => {
      await sendMessage(raw, { courseId, lessonId, retry: opts?.retry });
      scrollToEnd();
    },
    [sendMessage, courseId, lessonId, scrollToEnd],
  );

  // Gửi sẵn câu hỏi được truyền từ màn hình khác
  useEffect(() => {
    if (initialPrompt && user && !sentInitial.current && !route.params?.conversationId) {
      sentInitial.current = true;
      send(initialPrompt);
      navigation.setParams({ prompt: undefined });
    }
  }, [initialPrompt, user, route.params?.conversationId, send, navigation]);

  const lastUserText = [...messages].reverse().find((m) => m.role === 'USER')?.content;

  const onSubmit = () => {
    const text = input;
    if (!text.trim()) return;
    setInput('');
    send(text);
  };

  const newChat = () => {
    if (sending) return;
    resetChat();
    navigation.setParams({ conversationId: undefined, prompt: undefined });
  };

  const openCourse = (id: string) => navigation.navigate('CourseDetail', { id });

  // ------------------------------------------------------------ khách chưa đăng nhập
  if (!user) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={[styles.column, { paddingHorizontal: Spacing.four }]}>
          <ScreenHeader title="Trợ lý AI" />
          <View style={styles.guestBox}>
            <Image
              source={require('../../assets/images/robot.png')}
              style={styles.guestAvatar}
              resizeMode="contain"
            />
            <Text style={[styles.guestTitle, { color: theme.text }]}>Đăng nhập để trò chuyện với trợ lý AI</Text>
            <Text style={[styles.guestBody, { color: theme.muted }]}>
              Trợ lý giúp bạn chọn khóa học, giải đáp khi học, tra cứu đơn hàng và gợi ý lộ trình học.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Login')}
              style={[styles.primaryBtn, { backgroundColor: theme.primary }]}>
              <Text style={[styles.primaryBtnText, { color: theme.onPrimary }]}>Đăng nhập</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const suggestions = courseId ? COURSE_SUGGESTIONS : GENERAL_SUGGESTIONS;

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    const mine = item.role === 'USER';
    const isLastError = item.error && index === messages.length - 1;
    return (
      <View style={[styles.row, mine ? styles.rowMine : styles.rowBot]}>
        <View
          style={[
            styles.bubble,
            mine
              ? { backgroundColor: theme.primary, borderBottomRightRadius: Radius.sm }
              : {
                  backgroundColor: item.error ? theme.card : theme.card,
                  borderColor: item.error ? theme.danger : theme.border,
                  borderWidth: StyleSheet.hairlineWidth,
                  borderBottomLeftRadius: Radius.sm,
                },
          ]}>
          <Text
            selectable
            style={[
              styles.bubbleText,
              { color: mine ? theme.onPrimary : item.error ? theme.danger : theme.text },
            ]}>
            {item.content}
          </Text>
          {isLastError && lastUserText ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Thử lại"
              onPress={() => send(lastUserText, { retry: true })}
              hitSlop={8}
              style={{ marginTop: Spacing.two }}>
              <Text style={{ color: theme.primary, fontWeight: '700', fontSize: FontSizes.sm }}>Thử lại</Text>
            </Pressable>
          ) : null}
        </View>
        {item.courses.length > 0 ? (
          <View style={styles.cards}>
            {item.courses.map((c) => (
              <CourseCard key={c.id} course={c} onPress={() => openCourse(c.id)} />
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={[styles.column, { paddingHorizontal: Spacing.four }]}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <ScreenHeader title="Trợ lý AI" />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cuộc trò chuyện mới"
              onPress={newChat}
              hitSlop={8}
              disabled={sending || messages.length === 0}
              style={{ opacity: sending || messages.length === 0 ? 0.4 : 1 }}>
              <Icon name="plus" weight="bold" size={22} color={theme.primary} />
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : (
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              onContentSizeChange={scrollToEnd}
              contentContainerStyle={{ paddingVertical: Spacing.three, gap: Spacing.three, flexGrow: 1 }}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Image
                    source={require('../../assets/images/robot.png')}
                    style={styles.guestAvatar}
                    resizeMode="contain"
                  />
                  <Text style={[styles.guestTitle, { color: theme.text }]}>
                    Xin chào{user.fullName || user.name ? `, ${user.fullName || user.name}` : ''}!
                  </Text>
                  <Text style={[styles.guestBody, { color: theme.muted }]}>
                    Mình có thể tư vấn khóa học, hỗ trợ khi học, tra cứu đơn hàng và gợi ý lộ trình. Bạn muốn hỏi gì?
                  </Text>
                  <View style={styles.chips}>
                    {suggestions.map((s) => (
                      <Pressable
                        key={s}
                        accessibilityRole="button"
                        onPress={() => send(s)}
                        style={[styles.chip, { backgroundColor: theme.chipBackground, borderColor: theme.border }]}>
                        <Text style={{ color: theme.primary, fontSize: FontSizes.sm, fontWeight: '600' }}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              }
              ListFooterComponent={
                sending ? (
                  <View style={[styles.row, styles.rowBot, { marginTop: Spacing.three }]}>
                    <View
                      style={[
                        styles.bubble,
                        styles.typing,
                        { backgroundColor: theme.card, borderColor: theme.border, borderWidth: StyleSheet.hairlineWidth },
                      ]}>
                      <ActivityIndicator size="small" color={theme.primary} />
                      <Text style={{ color: theme.muted, fontSize: FontSizes.sm }}>Đang trả lời…</Text>
                    </View>
                  </View>
                ) : undefined
              }
            />
          )}

          <View style={[styles.inputBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Nhập câu hỏi…"
              placeholderTextColor={theme.placeholder}
              multiline
              maxLength={MAX_LENGTH}
              editable={!sending}
              style={[styles.input, { color: theme.text }]}
              accessibilityLabel="Nhập câu hỏi cho trợ lý AI"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi"
              onPress={onSubmit}
              disabled={sending || !input.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: theme.primary, opacity: sending || !input.trim() ? 0.4 : 1 },
              ]}>
              <Icon name="arrowUp" weight="bold" size={20} color={theme.onPrimary} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CourseCard({ course, onPress }: { course: ChatCourseCard; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem khóa học ${course.title}`}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      {course.thumbnailUrl ? (
        <Image source={{ uri: course.thumbnailUrl }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: theme.primarySoft }]} />
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text numberOfLines={2} style={{ color: theme.text, fontWeight: '700', fontSize: FontSizes.sm }}>
          {course.title}
        </Text>
        {course.instructor ? (
          <Text numberOfLines={1} style={{ color: theme.muted, fontSize: FontSizes.xs }}>
            {course.instructor}
          </Text>
        ) : null}
        <View style={styles.cardMeta}>
          <Text style={{ color: theme.primary, fontWeight: '700', fontSize: FontSizes.sm }}>
            {course.owned ? 'Đã sở hữu' : formatVnd(course.price)}
          </Text>
          {course.rating > 0 ? (
            <Text style={{ color: theme.muted, fontSize: FontSizes.xs }}>
              {course.rating.toFixed(1)} ({course.reviewCount})
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  column: { flex: 1, width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { maxWidth: '100%', gap: Spacing.two },
  rowMine: { alignItems: 'flex-end' },
  rowBot: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '88%',
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  bubbleText: { fontSize: FontSizes.base, lineHeight: 22 },
  typing: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  cards: { width: '100%', gap: Spacing.two },
  card: {
    flexDirection: 'row',
    gap: Spacing.two + 2,
    padding: Spacing.two + 2,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumb: { width: 64, height: 64, borderRadius: Radius.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingVertical: Spacing.five },
  chips: { gap: Spacing.two, marginTop: Spacing.three, alignSelf: 'stretch' },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.xl,
    paddingLeft: Spacing.three,
    paddingRight: Spacing.two,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  input: { flex: 1, maxHeight: 120, fontSize: FontSizes.base, paddingVertical: Spacing.one + 2 },
  sendBtn: { width: 38, height: 38, borderRadius: Radius.pill, alignItems: 'center', justifyContent: 'center' },
  guestBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingBottom: Spacing.six },
  guestAvatar: { width: 48, height: 48, borderRadius: 24},
  guestTitle: { fontSize: FontSizes.xl, fontWeight: '700', textAlign: 'center' },
  guestBody: { fontSize: FontSizes.base, textAlign: 'center', lineHeight: 22 },
  primaryBtn: { borderRadius: Radius.pill, paddingHorizontal: Spacing.five, paddingVertical: Spacing.three },
  primaryBtnText: { fontSize: FontSizes.base, fontWeight: '700' },
});

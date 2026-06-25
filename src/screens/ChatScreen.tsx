import React, { useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useStore } from '@/utils/store';
import { APIService, setAPIKeys } from '@/services/api';
import { Storage } from '@/services/storage';
import { Spacing, FontSize, BorderRadius } from '@/theme';

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState<{ uri: string; base64: string; mimeType: string } | null>(null);
  const sendBtnAnim = useRef(new Animated.Value(1)).current;

  const colors = useStore((s) => s.colors);
  const messages = useStore((s) => s.messages);
  const isProcessing = useStore((s) => s.isProcessing);
  const currentModel = useStore((s) => s.currentModel);
  const addMessage = useStore((s) => s.addMessage);
  const setProcessing = useStore((s) => s.setProcessing);

  React.useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    const [openai, anthropic, gemini] = await Promise.all([
      Storage.getOpenAIKey(),
      Storage.getAnthropicKey(),
      Storage.getGeminiKey(),
    ]);
    setAPIKeys({ openaiKey: openai, anthropicKey: anthropic, geminiKey: gemini });
  };

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = asset.uri;
      let base64 = asset.base64;

      if (!base64) {
        base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      setAttachedImage({
        uri,
        base64,
        mimeType: asset.mimeType || 'image/jpeg',
      });
    }
  }, []);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text && !attachedImage) return;

    const userMsg = {
      id: generateId(),
      text: text || (attachedImage ? 'Analyze this image' : ''),
      type: 'user' as const,
      timestamp: Date.now(),
      image: attachedImage || undefined,
    };

    addMessage(userMsg);
    setInputText('');
    setAttachedImage(null);
    setProcessing(true);

    Animated.sequence([
      Animated.timing(sendBtnAnim, { toValue: 0.7, duration: 100, useNativeDriver: true }),
      Animated.timing(sendBtnAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    try {
      const history = messages.map((m) => ({
        role: m.type === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
      }));

      const response = await APIService.sendMessage(
        currentModel,
        [...history, { role: 'user', content: userMsg.text }],
        attachedImage || undefined,
      );

      addMessage({
        id: generateId(),
        text: response,
        type: 'ai',
        timestamp: Date.now(),
      });
    } catch (err: any) {
      addMessage({
        id: generateId(),
        text: `Error: ${err.message}`,
        type: 'error',
        timestamp: Date.now(),
      });
    } finally {
      setProcessing(false);
    }
  }, [inputText, attachedImage, messages, currentModel, addMessage, setProcessing, sendBtnAnim]);

  const renderMessage = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <Animated.View
        style={[
          styles.messageBubble,
          item.type === 'user'
            ? [styles.userBubble, { backgroundColor: colors.userBubble, borderColor: colors.accent + '20' }]
            : [styles.aiBubble, { backgroundColor: colors.aiBubble, borderColor: colors.glassBorder }],
          item.type === 'error' && { borderColor: '#ff4444' },
        ]}
      >
        {item.image && (
          <Image source={{ uri: item.image.uri }} style={styles.attachedImage} resizeMode="cover" />
        )}
        <Text style={[styles.messageText, { color: colors.text }]}>{item.text}</Text>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </Animated.View>
    ),
    [colors],
  );

  const modelBadge = {
    'gpt-4o': 'GPT-4o',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4-turbo': 'GPT-4 Turbo',
    'gpt-4': 'GPT-4',
    'claude-3.5-sonnet': 'Claude 3.5',
    'claude-3-opus': 'Claude Opus',
    'claude-3-haiku': 'Claude Haiku',
    'gemini-2.0-flash': 'Gemini Flash',
    'gemini-2.0-pro': 'Gemini Pro',
    'gemini-2.0-ultra': 'Gemini Ultra',
  }[currentModel] || currentModel;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <LinearGradient colors={[colors.bg, colors.accent + '08', colors.bg]} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <View style={[styles.headerGlass, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
          <View style={styles.headerLeft}>
            <View style={[styles.logoSmall, { backgroundColor: 'rgba(255,255,255,0.04)' }]}>
              {[0, 1, 2].map((r) => (
                <View key={r} style={[styles.logoRowSmall, { opacity: 0.8 - r * 0.15 }]}>
                  {[0, 1, 2, 3].map((c) => (
                    <View key={c} style={[styles.logoCellSmall, { backgroundColor: r >= 1 ? (r === 1 && c === 3 ? '#211E1E' : '#656363') : '#CFCECD' }]} />
                  ))}
                </View>
              ))}
            </View>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>OPEN CODE</Text>
              <Text style={[styles.headerModel, { color: colors.accent2 }]}>{modelBadge}</Text>
            </View>
          </View>
          <View style={styles.statusDot} />
        </View>
      </View>

      {/* Messages */}
      {messages.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>How can I help you code today?</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Ask me anything about coding, debugging, or development.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Typing Indicator */}
      {isProcessing && (
        <View style={styles.typingRow}>
          <View style={[styles.typingBubble, { backgroundColor: colors.aiBubble, borderColor: colors.glassBorder }]}>
            <View style={styles.typingDots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.typingDot, { backgroundColor: colors.accent }]} />
              ))}
            </View>
            <Text style={[styles.typingLabel, { color: colors.textSecondary }]}>Thinking...</Text>
          </View>
        </View>
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom + Spacing.sm }]}>
        {attachedImage && (
          <View style={styles.attachPreview}>
            <Image source={{ uri: attachedImage.uri }} style={styles.attachThumb} />
            <TouchableOpacity onPress={() => setAttachedImage(null)} style={styles.removeAttach}>
              <Text style={styles.removeAttachText}>×</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={[styles.inputRow, { backgroundColor: colors.glassBg, borderColor: colors.glassBorder }]}>
          <TouchableOpacity onPress={pickImage} style={styles.attachBtn}>
            <Text style={[styles.attachBtnText, { color: colors.textSecondary }]}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder="Message OPEN CODE..."
            placeholderTextColor={colors.textSecondary + '80'}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={10000}
          />
          <Animated.View style={{ transform: [{ scale: sendBtnAnim }] }}>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                { backgroundColor: colors.accent, opacity: inputText.trim() || attachedImage ? 1 : 0.4 },
              ]}
              onPress={sendMessage}
              disabled={!inputText.trim() && !attachedImage}
            >
              <Text style={styles.sendBtnText}>↑</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs },
  headerGlass: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: Spacing.md, borderRadius: BorderRadius.xl, borderWidth: 1,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  logoSmall: { padding: 6, borderRadius: BorderRadius.sm, gap: 2 },
  logoRowSmall: { flexDirection: 'row', gap: 2 },
  logoCellSmall: { width: 8, height: 8, borderRadius: 1 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: '700', letterSpacing: -0.3 },
  headerModel: { fontSize: FontSize.xs, fontWeight: '600', marginTop: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2ecc71' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxxl },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: '700', textAlign: 'center', marginBottom: Spacing.sm },
  emptySubtitle: { fontSize: FontSize.md, textAlign: 'center', lineHeight: 22 },
  messageList: { flex: 1, paddingHorizontal: Spacing.md },
  messageListContent: { paddingVertical: Spacing.md },
  messageBubble: { maxWidth: '88%', padding: Spacing.lg, borderRadius: BorderRadius.xxl, marginBottom: Spacing.sm },
  userBubble: { alignSelf: 'flex-end', borderWidth: 1, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: 'flex-start', borderWidth: 1, borderBottomLeftRadius: 4 },
  messageText: { fontSize: FontSize.md, lineHeight: 22 },
  timeText: { fontSize: FontSize.xs, marginTop: Spacing.xs, textAlign: 'right', opacity: 0.6 },
  attachedImage: { width: '100%', height: 180, borderRadius: BorderRadius.md, marginBottom: Spacing.sm },
  typingRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.xs },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    alignSelf: 'flex-start', padding: Spacing.sm + 2, borderRadius: BorderRadius.xl, borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  typingDots: { flexDirection: 'row', gap: 3 },
  typingDot: { width: 6, height: 6, borderRadius: 3, opacity: 0.5 },
  typingLabel: { fontSize: FontSize.sm, fontWeight: '500' },
  inputContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.xs },
  attachPreview: { flexDirection: 'row', marginBottom: Spacing.xs, paddingHorizontal: 4 },
  attachThumb: { width: 48, height: 48, borderRadius: BorderRadius.sm },
  removeAttach: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: '#ff4444', alignItems: 'center', justifyContent: 'center' },
  removeAttachText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  inputRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm,
    padding: Spacing.xs, paddingLeft: Spacing.md,
    borderRadius: BorderRadius.xxl, borderWidth: 1,
  },
  attachBtn: { paddingBottom: Spacing.xs },
  attachBtnText: { fontSize: 20 },
  textInput: { flex: 1, fontSize: FontSize.md, maxHeight: 100, paddingVertical: Spacing.xs },
  sendBtn: { width: 40, height: 40, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: '#fff', fontSize: 20, fontWeight: '700' },
});

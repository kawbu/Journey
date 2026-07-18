import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import ChatBubble from '../components/ChatBubble';
import ChatTypingIndicator from '../components/ChatTypingIndicator';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { sendSupportMessage } from '../lib/supportChat';
import type { RootStackParamList } from '../navigation/types';
import type { ChatMessage } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function makeMessage(role: ChatMessage['role'], content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

const GREETING =
  "Hi there! I'm the Our Journey support bot. Having trouble with your account or found a bug? I'm here to help you get back to your journey.";

export default function SupportChatScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [makeMessage('assistant', GREETING)]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError(null);
    const userMessage = makeMessage('user', text);
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setSending(true);

    try {
      const reply = await sendSupportMessage(history);
      setMessages((prev) => [...prev, makeMessage('assistant', reply)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.screen}>
        <AppHeader title="Support Center" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListHeaderComponent={
            <View style={styles.dateDividerWrap}>
              <Text style={styles.dateDivider}>Today</Text>
            </View>
          }
          renderItem={({ item }) => <ChatBubble message={item} />}
          ListFooterComponent={sending ? <ChatTypingIndicator /> : null}
        />

        {error && (
          <View style={styles.errorBanner}>
            <MaterialIcons name="error-outline" size={16} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Describe your issue..."
            placeholderTextColor={theme.colors.outlineVariant}
            value={input}
            onChangeText={setInput}
            multiline
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[styles.sendButton, (sending || !input.trim()) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending || !input.trim()}
          >
            <MaterialIcons name="send" size={20} color={theme.colors.onPrimary} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    listContent: {
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: theme.spacing.stackLg,
      paddingBottom: 24,
    },
    dateDividerWrap: {
      alignItems: 'center',
      marginBottom: theme.spacing.stackLg,
    },
    dateDivider: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 12,
      color: theme.colors.outline,
      backgroundColor: theme.colors.surfaceContainerLow,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: theme.radii.full,
    },
    errorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginHorizontal: theme.spacing.marginMobile,
      marginBottom: 8,
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.radii.lg,
      padding: 10,
    },
    errorText: {
      flex: 1,
      fontFamily: theme.fonts.body,
      fontSize: 12,
      color: theme.colors.onErrorContainer,
    },
    composer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: 12,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.surfaceContainerHigh,
      backgroundColor: theme.colors.background,
    },
    input: {
      flex: 1,
      maxHeight: 120,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.full,
      paddingHorizontal: 18,
      paddingVertical: 12,
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sunsetGlow,
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });

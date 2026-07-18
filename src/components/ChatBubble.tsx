import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import type { ChatMessage } from '../types';

interface ChatBubbleProps {
  message: ChatMessage;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const isUser = message.role === 'user';

  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
        <MaterialIcons
          name={isUser ? 'person' : 'support-agent'}
          size={16}
          color={isUser ? theme.colors.onSecondaryContainer : theme.colors.primary}
        />
      </View>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.text, isUser && styles.textUser]}>{message.content}</Text>
        <Text style={[styles.timestamp, isUser && styles.timestampUser]}>
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      maxWidth: '85%',
      alignSelf: 'flex-start',
      marginBottom: 16,
    },
    rowUser: {
      alignSelf: 'flex-end',
      flexDirection: 'row-reverse',
    },
    avatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      ...theme.shadows.sunsetGlow,
    },
    avatarAssistant: {
      backgroundColor: theme.colors.primaryFixed,
      borderWidth: 1,
      borderColor: theme.colors.primaryContainer,
    },
    avatarUser: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    bubble: {
      borderRadius: theme.radii.xl,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    bubbleAssistant: {
      backgroundColor: theme.colors.surfaceContainerHigh,
      borderWidth: 1,
      borderColor: theme.colors.surfaceContainerHighest,
      borderBottomLeftRadius: theme.radii.sm,
    },
    bubbleUser: {
      backgroundColor: theme.colors.primary,
      borderBottomRightRadius: theme.radii.sm,
    },
    text: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors.onSurfaceVariant,
    },
    textUser: {
      color: theme.colors.onPrimary,
    },
    timestamp: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 10,
      letterSpacing: 0.5,
      color: theme.colors.outline,
      textAlign: 'right',
      marginTop: 6,
      textTransform: 'uppercase',
    },
    timestampUser: {
      color: 'rgba(255,255,255,0.75)',
    },
  });

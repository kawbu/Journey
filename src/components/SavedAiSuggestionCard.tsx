import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import type { SavedAiSuggestion } from '../types';

interface SavedAiSuggestionCardProps {
  suggestion: SavedAiSuggestion;
  onPlan: () => void;
  onRemove: () => void;
}

export default function SavedAiSuggestionCard({ suggestion, onPlan, onRemove }: SavedAiSuggestionCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <MaterialIcons name="auto-awesome" size={12} color={theme.colors.onTertiaryFixed} />
          <Text style={styles.badgeText}>AI IDEA</Text>
        </View>
        <Pressable hitSlop={8} onPress={onRemove}>
          <MaterialIcons name="close" size={18} color={theme.colors.outline} />
        </Pressable>
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {suggestion.title}
      </Text>
      {suggestion.description ? (
        <Text style={styles.description} numberOfLines={2}>
          {suggestion.description}
        </Text>
      ) : null}
      <Pressable style={styles.planButton} onPress={onPlan}>
        <Text style={styles.planButtonText}>Plan This</Text>
      </Pressable>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      width: 220,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 14,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      ...theme.shadows.sunsetGlow,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.tertiaryFixed,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    badgeText: {
      fontFamily: theme.fonts.bodyBold,
      fontSize: 9,
      letterSpacing: 0.5,
      color: theme.colors.onTertiaryFixed,
    },
    title: {
      fontFamily: theme.fonts.display,
      fontSize: 15,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    description: {
      fontFamily: theme.fonts.body,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 12,
    },
    planButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 999,
      paddingVertical: 8,
      alignItems: 'center',
    },
    planButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.onPrimary,
    },
  });

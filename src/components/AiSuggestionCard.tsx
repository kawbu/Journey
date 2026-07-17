import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import type { AiSuggestion } from '../types';

interface AiSuggestionCardProps {
  suggestion: AiSuggestion;
  saved: boolean;
  onSave: () => void;
  onPlan: () => void;
}

export default function AiSuggestionCard({ suggestion, saved, onSave, onPlan }: AiSuggestionCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{suggestion.suggestedCategory}</Text>
        </View>
        <MaterialIcons name="auto-awesome" size={16} color={theme.colors.outline} />
      </View>
      <Text style={styles.title}>{suggestion.title}</Text>
      <Text style={styles.description}>{suggestion.description}</Text>
      <View style={styles.actions}>
        <Pressable style={[styles.saveButton, saved && styles.saveButtonSaved]} onPress={onSave} disabled={saved}>
          <MaterialIcons
            name={saved ? 'bookmark' : 'bookmark-border'}
            size={16}
            color={saved ? theme.colors.onPrimary : theme.colors.primary}
          />
          <Text style={[styles.saveButtonText, saved && styles.saveButtonTextSaved]}>
            {saved ? 'Saved' : 'Save'}
          </Text>
        </Pressable>
        <Pressable style={styles.planButton} onPress={onPlan}>
          <Text style={styles.planButtonText}>Plan This</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 16,
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
    categoryChip: {
      backgroundColor: theme.colors.tertiaryFixed,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    categoryChipText: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: theme.colors.onTertiaryFixed,
    },
    title: {
      fontFamily: theme.fonts.display,
      fontSize: 18,
      color: theme.colors.onSurface,
      marginBottom: 4,
    },
    description: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      marginBottom: 14,
    },
    actions: {
      flexDirection: 'row',
      gap: 10,
    },
    saveButton: {
      flexDirection: 'row',
      gap: 6,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 999,
      paddingVertical: 9,
      paddingHorizontal: 16,
    },
    saveButtonSaved: {
      backgroundColor: theme.colors.primary,
    },
    saveButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.primary,
    },
    saveButtonTextSaved: {
      color: theme.colors.onPrimary,
    },
    planButton: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      borderRadius: 999,
      paddingVertical: 9,
      alignItems: 'center',
    },
    planButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.onPrimary,
    },
  });

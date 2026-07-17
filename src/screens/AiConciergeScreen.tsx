import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import AiSuggestionCard from '../components/AiSuggestionCard';
import { useTheme } from '../context/ThemeContext';
import { useDates } from '../context/DatesContext';
import { useBucketList } from '../context/BucketListContext';
import { askConcierge } from '../lib/aiConcierge';
import type { Theme } from '../theme/theme';
import type { RootStackParamList } from '../navigation/types';
import type { AiSuggestion, BucketCategory } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AiConciergeScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { pastDates } = useDates();
  const { items, checkedItemIds, saveSuggestion } = useBucketList();

  const [freeText, setFreeText] = useState('');
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedClientIds, setSavedClientIds] = useState<Set<string>>(new Set());

  const checkedCategories: BucketCategory[] = useMemo(() => {
    const cats = new Set<BucketCategory>();
    for (const id of checkedItemIds) {
      const item = items.find((i) => i.id === id);
      if (item) cats.add(item.category);
    }
    return [...cats];
  }, [items, checkedItemIds]);

  const handleAsk = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSavedClientIds(new Set());
    try {
      const results = await askConcierge({ pastDates, checkedCategories, freeText });
      setSuggestions(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (suggestion: AiSuggestion) => {
    await saveSuggestion(suggestion);
    setSavedClientIds((prev) => new Set(prev).add(suggestion.clientId));
  };

  const handlePlan = (suggestion: AiSuggestion) => {
    navigation.navigate('PlanDate', {
      prefillTitle: suggestion.title,
      prefillActivity: suggestion.suggestedActivity,
    });
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="AI Concierge"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="autorenew"
        onRightPress={suggestions.length > 0 ? handleAsk : undefined}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <MaterialIcons name="auto-awesome" size={28} color={theme.colors.primary} />
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroTitle}>Ask the Concierge</Text>
            <View style={styles.plusBadge}>
              <MaterialIcons name="stars" size={11} color={theme.colors.onPrimary} />
              <Text style={styles.plusBadgeText}>Journey+</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Personalized date ideas based on your journey together — plus anything you're in the mood for.
          </Text>
        </View>

        <View style={styles.promptCard}>
          <TextInput
            style={styles.freeTextInput}
            placeholder="Optional — e.g. 'something outdoorsy and cheap this weekend'"
            placeholderTextColor={theme.colors.outlineVariant}
            multiline
            numberOfLines={4}
            value={freeText}
            onChangeText={setFreeText}
          />
          <Pressable
            style={[styles.askButton, loading && styles.askButtonDisabled]}
            onPress={handleAsk}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <>
                <MaterialIcons name="auto-awesome" size={16} color={theme.colors.onPrimary} />
                <Text style={styles.askButtonText}>Ask the Concierge</Text>
              </>
            )}
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <MaterialIcons name="error-outline" size={20} color={theme.colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {suggestions.length > 0 && (
          <View>
            <Text style={styles.sectionLabel}>SUGGESTED FOR YOU</Text>
            <View style={styles.suggestionsList}>
              {suggestions.map((s) => (
                <AiSuggestionCard
                  key={s.clientId}
                  suggestion={s}
                  saved={savedClientIds.has(s.clientId)}
                  onSave={() => handleSave(s)}
                  onPlan={() => handlePlan(s)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: theme.spacing.stackLg,
      paddingBottom: 48,
      gap: theme.spacing.stackLg,
    },
    hero: {
      alignItems: 'center',
      gap: 6,
    },
    heroTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    heroTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 24,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    plusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    plusBadgeText: {
      fontFamily: theme.fonts.bodyBold,
      fontSize: 10,
      letterSpacing: 0.3,
      color: theme.colors.onPrimary,
    },
    heroSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      opacity: 0.85,
    },
    promptCard: {
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.xl,
      padding: 20,
      gap: 16,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      ...theme.shadows.sunsetGlow,
    },
    freeTextInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      padding: 14,
      minHeight: 100,
      textAlignVertical: 'top',
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: theme.colors.onSurface,
    },
    askButton: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    askButtonDisabled: {
      opacity: 0.6,
    },
    askButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onPrimary,
    },
    errorCard: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
      backgroundColor: theme.colors.errorContainer,
      borderRadius: theme.radii.lg,
      padding: 14,
    },
    errorText: {
      flex: 1,
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.onErrorContainer,
    },
    sectionLabel: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.primary,
      letterSpacing: 1,
      marginBottom: 8,
      marginLeft: 4,
    },
    suggestionsList: {
      gap: 12,
    },
  });

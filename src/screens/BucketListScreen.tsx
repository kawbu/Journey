import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import MenuSheet from '../components/MenuSheet';
import BucketCard from '../components/BucketCard';
import { spacing } from '../theme/theme';
import type { Theme } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { useBucketList } from '../context/BucketListContext';
import type { RootStackParamList } from '../navigation/types';
import type { BucketCategory, BucketItem } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: (BucketCategory | 'All Ideas')[] = ['All Ideas', 'Outdoors', 'Creative', 'Fine Dining', 'Staycation'];

export default function BucketListScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('All Ideas');
  const { items, checkedItemIds, isLoaded, toggleChecked } = useBucketList();

  const filtered = useMemo(
    () => (category === 'All Ideas' ? items : items.filter((i) => i.category === category)),
    [category, items]
  );

  const handlePlan = (item: BucketItem) => {
    navigation.navigate('PlanDate', { prefillTitle: item.title, prefillActivity: item.suggestedActivity });
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Our Journey"
        onLeftPress={() => setMenuVisible(true)}
        onRightPress={() => navigation.navigate('PlanDate')}
      />
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <ScrollView contentContainerStyle={styles.listContent}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>The Bucket List</Text>
          <Text style={styles.heroSubtitle}>
            Curate your next chapter. Discover intentional dates designed to spark connection.
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filters}
          contentContainerStyle={styles.filtersContent}
        >
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {!isLoaded ? (
          <ActivityIndicator style={{ marginTop: 40 }} color={theme.colors.primary} />
        ) : (
          <View style={styles.grid}>
            {filtered.map((item) => (
              <BucketCard
                key={item.id}
                item={item}
                onPlan={handlePlan}
                checked={checkedItemIds.has(item.id)}
                onToggleChecked={() => toggleChecked(item.id)}
              />
            ))}
          </View>
        )}

        <View style={styles.quote}>
          <Text style={styles.quoteText}>&ldquo;Adventure is better when shared.&rdquo;</Text>
          <View style={styles.quoteRule} />
        </View>
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
    listContent: {
      paddingHorizontal: spacing.marginMobile,
      paddingBottom: 40,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    hero: {
      marginTop: 24,
      marginBottom: 20,
    },
    heroTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 28,
      color: theme.colors.primary,
    },
    heroSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
    },
    filters: {
      flexGrow: 0,
      marginBottom: 20,
      marginHorizontal: -spacing.marginMobile,
    },
    filtersContent: {
      paddingHorizontal: spacing.marginMobile,
      gap: 10,
    },
    filterChip: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: theme.colors.surfaceContainerHigh,
      marginRight: 10,
    },
    filterChipActive: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    filterChipText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
    },
    filterChipTextActive: {
      color: theme.colors.onSecondaryContainer,
    },
    quote: {
      marginTop: 16,
      marginBottom: 32,
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    quoteText: {
      fontFamily: theme.fonts.display,
      fontSize: 22,
      fontStyle: 'italic',
      color: 'rgba(151,66,42,0.6)',
      textAlign: 'center',
      marginBottom: 12,
    },
    quoteRule: {
      width: 48,
      height: 3,
      borderRadius: 2,
      backgroundColor: 'rgba(151,66,42,0.2)',
    },
  });

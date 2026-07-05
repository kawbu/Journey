import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MemoryCard from '../components/MemoryCard';
import DateRangeFilterModal, { type DateRange } from '../components/DateRangeFilterModal';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { activityLabel } from '../theme/activityIcons';
import { useDates } from '../context/DatesContext';
import type { RootStackParamList } from '../navigation/types';
import type { ActivityType, DateEntry } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// A stable, deterministic "hand-placed" tilt per card so the scrapbook feel
// doesn't jitter between re-renders.
function rotationForIndex(index: number): number {
  const pattern = [-1.5, 2, -2, 1, -1, 1.5];
  return pattern[index % pattern.length];
}

function primaryActivityFor(entry: DateEntry): ActivityType | null {
  return entry.stops[0]?.activity ?? null;
}

export default function PastDatesScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const { pastDates } = useDates();
  const [search, setSearch] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | 'All'>('All');
  const [rangeVisible, setRangeVisible] = useState(false);
  const [range, setRange] = useState<DateRange>({ start: null, end: null });

  const availableActivities = useMemo(() => {
    const set = new Set<ActivityType>();
    pastDates.forEach((entry) => {
      const activity = primaryActivityFor(entry);
      if (activity) set.add(activity);
    });
    return Array.from(set);
  }, [pastDates]);

  const filteredDates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return pastDates.filter((entry) => {
      if (query && !entry.title.toLowerCase().includes(query)) return false;
      if (selectedActivity !== 'All' && primaryActivityFor(entry) !== selectedActivity) return false;
      if (range.start && entry.date < range.start) return false;
      if (range.end && entry.date > range.end) return false;
      return true;
    });
  }, [pastDates, search, selectedActivity, range]);

  const hasActiveRange = Boolean(range.start || range.end);

  const handleOpenDate = (dateId: string) => {
    navigation.navigate('PlanDate', { editDateId: dateId });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={() => navigation.goBack()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Past Memories</Text>
          <View style={styles.iconButton} />
        </View>
      </SafeAreaView>

      <FlatList
        data={filteredDates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.stackMd }} />}
        ListHeaderComponent={
          <View style={styles.intro}>
            <View style={styles.introTitleRow}>
              <Text style={styles.introTitle}>Our Shared Journey</Text>
              <Pressable
                hitSlop={8}
                onPress={() => setRangeVisible(true)}
                style={[styles.calendarButton, hasActiveRange && styles.calendarButtonActive]}
              >
                <MaterialIcons
                  name="calendar-month"
                  size={22}
                  color={hasActiveRange ? theme.colors.onPrimary : theme.colors.primary}
                />
              </Pressable>
            </View>
            <Text style={styles.introSubtitle}>
              A collection of every meaningful moment we've shared, preserved in the warm glow of our digital
              scrapbook.
            </Text>

            <View style={styles.searchWrap}>
              <MaterialIcons name="search" size={20} color={theme.colors.outline} style={styles.searchIcon} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search memories..."
                placeholderTextColor={theme.colors.outlineVariant}
                style={styles.searchInput}
              />
            </View>

            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={['All' as const, ...availableActivities]}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.chipRow}
              renderItem={({ item }) => {
                const active = item === selectedActivity;
                const label = item === 'All' ? 'All' : activityLabel[item];
                return (
                  <Pressable
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setSelectedActivity(item)}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
                  </Pressable>
                );
              }}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <MemoryCard
            entry={item}
            primaryActivity={primaryActivityFor(item)}
            rotation={rotationForIndex(index)}
            onPress={handleOpenDate}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="auto-awesome" size={28} color={theme.colors.outlineVariant} />
            <Text style={styles.emptyText}>
              {pastDates.length === 0
                ? "No past dates yet — your memories will appear here once they've happened."
                : 'No memories match your search or filters.'}
            </Text>
          </View>
        }
      />

      <DateRangeFilterModal
        visible={rangeVisible}
        range={range}
        onChange={setRange}
        onClose={() => setRangeVisible(false)}
      />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerSafe: {
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.surfaceTint,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 4,
      zIndex: 10,
    },
    headerRow: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 22,
      color: theme.colors.primary,
      flex: 1,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: theme.spacing.stackLg,
      paddingBottom: 40,
    },
    intro: {
      marginBottom: theme.spacing.stackLg,
    },
    introTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    introTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 28,
      color: theme.colors.primary,
      flexShrink: 1,
    },
    calendarButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    calendarButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    introSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      marginTop: 8,
    },
    searchWrap: {
      marginTop: theme.spacing.stackMd,
      position: 'relative',
      justifyContent: 'center',
    },
    searchIcon: {
      position: 'absolute',
      left: 14,
      zIndex: 1,
    },
    searchInput: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.full,
      paddingVertical: 10,
      paddingLeft: 40,
      paddingRight: 16,
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    chipRow: {
      gap: 8,
      marginTop: theme.spacing.stackSm,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.secondaryContainer,
    },
    chipActive: {
      backgroundColor: theme.colors.secondary,
    },
    chipText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.onSecondaryContainer,
    },
    chipTextActive: {
      color: theme.colors.onSecondary,
    },
    empty: {
      paddingVertical: 60,
      alignItems: 'center',
      gap: 12,
    },
    emptyText: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      paddingHorizontal: 30,
    },
  });

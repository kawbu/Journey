import React, { useState } from 'react';
import { FlatList, Share, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import MenuSheet from '../components/MenuSheet';
import DateCard from '../components/DateCard';
import { colors, fonts, spacing } from '../theme/theme';
import { useDates } from '../context/DatesContext';
import type { RootStackParamList } from '../navigation/types';
import type { DateEntry } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DatesScreen() {
  const navigation = useNavigation<Nav>();
  const { upcomingDates } = useDates();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleViewMap = (dateId: string) => {
    navigation.navigate('Tabs', { screen: 'Map', params: { dateId } });
  };

  const handleEdit = (dateId: string) => {
    navigation.navigate('PlanDate', { editDateId: dateId });
  };

  const handleShare = async (entry: DateEntry) => {
    const lines = entry.stops
      .map((s) => `${s.time} — ${s.title}`)
      .join('\n');
    try {
      await Share.share({
        message: `${entry.title} (${entry.date})\n${entry.subtitle}\n\n${lines}`,
      });
    } catch (err) {
      console.warn('Share failed', err);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Our Journey"
        onLeftPress={() => setMenuVisible(true)}
        onRightPress={() => navigation.navigate('PlanDate')}
      />
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <FlatList
        data={upcomingDates}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.heroTitle}>Upcoming Dates</Text>
            <Text style={styles.heroSubtitle}>Every moment together is a treasure waiting to happen.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.stackLg }} />}
        renderItem={({ item }) => (
          <DateCard entry={item} onViewMap={handleViewMap} onShare={handleShare} onEdit={handleEdit} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No dates planned yet. Tap + to create your first story.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: spacing.stackLg,
    paddingBottom: 40,
  },
  hero: {
    marginBottom: spacing.stackLg,
  },
  heroTitle: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.onSurface,
  },
  heroSubtitle: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 8,
  },
  empty: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});

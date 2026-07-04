import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radii, shadows } from '../theme/theme';
import { activityIcon, activityLabel } from '../theme/activityIcons';
import { formatFriendlyDate } from '../utils/format';
import type { ActivityType, DateEntry } from '../types';

interface MemoryCardProps {
  entry: DateEntry;
  primaryActivity: ActivityType | null;
  rotation: number;
  onPress: (dateId: string) => void;
}

export default function MemoryCard({ entry, primaryActivity, rotation, onPress }: MemoryCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { transform: [{ rotate: `${rotation}deg` }, { scale: pressed ? 0.97 : 1 }] },
      ]}
      onPress={() => onPress(entry.id)}
    >
      <View style={styles.imageWrap}>
        {entry.coverImage ? (
          <Image source={{ uri: entry.coverImage }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imageFallback]}>
            <MaterialIcons name="photo" size={32} color={colors.outlineVariant} />
          </View>
        )}
        <View style={styles.imageOverlay} />
        {primaryActivity && (
          <View style={styles.pill}>
            <MaterialIcons name={activityIcon[primaryActivity]} size={12} color={colors.primary} />
            <Text style={styles.pillText}>{activityLabel[primaryActivity]}</Text>
          </View>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {entry.title}
        </Text>
        <View style={styles.dateRow}>
          <MaterialIcons name="calendar-today" size={12} color={colors.outline} />
          <Text style={styles.dateText}>{formatFriendlyDate(entry.date)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xl,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...shadows.sunsetGlow,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  pillText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 11,
    color: colors.primary,
  },
  body: {
    paddingHorizontal: 4,
    paddingBottom: 2,
    gap: 4,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.onSurface,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.outline,
  },
});

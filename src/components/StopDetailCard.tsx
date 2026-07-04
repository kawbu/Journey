import React from 'react';
import { Image, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radii, shadows } from '../theme/theme';
import { formatTime12h } from '../utils/format';
import { activityIcon, activityLabel } from '../theme/activityIcons';
import type { Stop } from '../types';

interface StopDetailCardProps {
  stop: Stop;
  index: number;
  total: number;
  isCurrent: boolean;
}

function openDirections(stop: Stop) {
  const { latitude, longitude } = stop.location;
  const url = Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}`,
    android: `google.navigation:q=${latitude},${longitude}`,
    default: `https://maps.google.com/?daddr=${latitude},${longitude}`,
  });
  if (url) Linking.openURL(url).catch(() => undefined);
}

export default function StopDetailCard({ stop, index, total, isCurrent }: StopDetailCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.thumbWrap}>
        <View style={styles.thumbIconBg}>
          <MaterialIcons name={activityIcon[stop.activity]} size={32} color={colors.primary} />
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isCurrent ? styles.badgeCurrent : styles.badgeUpcoming]}>
            <Text style={[styles.badgeText, isCurrent && styles.badgeTextCurrent]}>
              {isCurrent ? 'CURRENT' : stop.completed ? 'DONE' : 'UPCOMING'}
            </Text>
          </View>
          <Text style={styles.spotOf}>
            Spot {index} of {total}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {stop.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {activityLabel[stop.activity]} · {stop.description}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialIcons name="schedule" size={14} color={colors.secondary} />
            <Text style={styles.metaText}>{formatTime12h(stop.time)}</Text>
          </View>
          {!!stop.durationLabel && (
            <View style={styles.metaItem}>
              <MaterialIcons name="directions" size={14} color={colors.secondary} />
              <Text style={styles.metaText}>{stop.durationLabel}</Text>
            </View>
          )}
          {!!stop.rating && (
            <View style={styles.metaItem}>
              <MaterialIcons name="star" size={14} color={colors.secondary} />
              <Text style={styles.metaText}>{stop.rating}</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable style={styles.navButton} onPress={() => openDirections(stop)} hitSlop={8}>
        <MaterialIcons name="near-me" size={20} color={colors.onSecondaryContainer} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radii.xxl,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHigh,
    ...shadows.sunsetGlow,
  },
  thumbWrap: {
    width: 76,
    height: 76,
    borderRadius: radii.xl,
    overflow: 'hidden',
  },
  thumbIconBg: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondaryFixed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 36,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeCurrent: {
    backgroundColor: colors.primaryFixed,
  },
  badgeUpcoming: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.onSurfaceVariant,
  },
  badgeTextCurrent: {
    color: colors.primary,
  },
  spotOf: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.outline,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.onSurface,
  },
  navButton: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

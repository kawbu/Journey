import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { formatFriendlyDate, formatTime12h } from '../utils/format';
import type { DateEntry, Stop } from '../types';
import { useDates } from '../context/DatesContext';

interface DateCardProps {
  entry: DateEntry;
  onViewMap: (dateId: string) => void;
  onShare: (entry: DateEntry) => void;
  onEdit: (dateId: string) => void;
}

function TimelineRow({
  stop,
  isLast,
  onToggle,
}: {
  stop: Stop;
  isLast: boolean;
  onToggle: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Pressable style={styles.timelineRow} onPress={onToggle}>
      <View style={styles.timelineRail}>
        <View style={[styles.circle, stop.completed && styles.circleCompleted]} />
        {!isLast && <View style={styles.connector} />}
      </View>
      <View style={styles.timelineContent}>
        <Text style={[styles.stopTime, stop.completed && styles.stopTimeCompleted]}>
          {formatTime12h(stop.time)}
        </Text>
        <Text style={[styles.stopTitle, stop.completed && styles.stopTitleMuted]}>{stop.title}</Text>
        <Text style={styles.stopDescription}>{stop.description}</Text>
      </View>
    </Pressable>
  );
}

export default function DateCard({ entry, onViewMap, onShare, onEdit }: DateCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { sortedStops, toggleStopCompleted } = useDates();
  const stops = sortedStops(entry);
  const allDone = stops.every((s) => s.completed);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: entry.coverImage }} style={styles.image} />
        <View style={styles.imageOverlay} />
        <View style={styles.datePill}>
          <Text style={styles.datePillText}>{formatFriendlyDate(entry.date)}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{entry.title}</Text>
            <Text style={styles.subtitle}>{entry.subtitle.toUpperCase()}</Text>
          </View>
          <Pressable
            style={styles.editButton}
            onPress={() => onEdit(entry.id)}
            hitSlop={8}
            accessibilityLabel="Edit this date"
          >
            <MaterialIcons name="edit" size={18} color={theme.colors.primary} />
          </Pressable>
        </View>
        <View style={styles.timeline}>
          {stops.map((stop, idx) => (
            <TimelineRow
              key={stop.id}
              stop={stop}
              isLast={idx === stops.length - 1}
              onToggle={() => toggleStopCompleted(entry.id, stop.id)}
            />
          ))}
        </View>
        <Pressable
          style={[styles.actionButton, allDone ? styles.actionButtonMuted : styles.actionButtonPrimary]}
          onPress={() => (allDone ? onShare(entry) : onViewMap(entry.id))}
        >
          <Text style={[styles.actionText, allDone ? styles.actionTextMuted : styles.actionTextPrimary]}>
            {allDone ? 'Share Itinerary' : 'View Complete Map'}
          </Text>
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
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.surfaceContainerHigh,
      ...theme.shadows.sunsetGlow,
    },
    imageWrap: {
      height: 192,
      width: '100%',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    imageOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.1)',
    },
    datePill: {
      position: 'absolute',
      bottom: 16,
      left: 16,
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 999,
    },
    datePillText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.primary,
    },
    body: {
      padding: 16,
      gap: 16,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    editButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceContainerLow,
    },
    title: {
      fontFamily: theme.fonts.display,
      fontSize: 24,
      color: theme.colors.onSurface,
    },
    subtitle: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 12,
      color: theme.colors.outline,
      letterSpacing: 1,
      marginTop: 2,
    },
    timeline: {
      marginTop: 4,
    },
    timelineRow: {
      flexDirection: 'row',
      gap: 14,
    },
    timelineRail: {
      width: 16,
      alignItems: 'center',
    },
    circle: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: theme.colors.outlineVariant,
      backgroundColor: theme.colors.background,
    },
    circleCompleted: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary,
    },
    connector: {
      flex: 1,
      width: 1,
      minHeight: 30,
      backgroundColor: theme.colors.outlineVariant,
      marginTop: 2,
    },
    timelineContent: {
      flex: 1,
      paddingBottom: 16,
    },
    stopTime: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 12,
      color: theme.colors.outline,
    },
    stopTimeCompleted: {
      color: theme.colors.tertiary,
    },
    stopTitle: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 16,
      color: theme.colors.onSurface,
      marginTop: 2,
    },
    stopTitleMuted: {
      color: theme.colors.onSurfaceVariant,
    },
    stopDescription: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    actionButton: {
      paddingVertical: 14,
      borderRadius: theme.radii.xl,
      alignItems: 'center',
    },
    actionButtonPrimary: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    actionButtonMuted: {
      backgroundColor: theme.colors.surfaceContainerHighest,
    },
    actionText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      letterSpacing: 0.5,
    },
    actionTextPrimary: {
      color: theme.colors.onSecondaryContainer,
    },
    actionTextMuted: {
      color: theme.colors.onSurfaceVariant,
    },
  });

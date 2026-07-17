import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { activityIcon, activityLabel } from '../theme/activityIcons';
import PickerField from './PickerField';
import ActivityPickerModal from './ActivityPickerModal';
import LocationPickerModal from './LocationPickerModal';
import { formatTime12h } from '../utils/format';
import type { ActivityType, Coordinates } from '../types';

export interface StopDraft {
  key: string;
  id?: string;
  time: Date;
  title: string;
  description: string;
  activity: ActivityType;
  location: Coordinates | null;
  completed?: boolean;
}

interface StopEditorCardProps {
  stop: StopDraft;
  index: number;
  isLast: boolean;
  canDelete: boolean;
  mapDefaultCenter: Coordinates;
  onChange: (next: StopDraft) => void;
  onDelete: () => void;
  drag: () => void;
  isActive: boolean;
}

export default function StopEditorCard({
  stop,
  index,
  isLast,
  canDelete,
  mapDefaultCenter,
  onChange,
  onDelete,
  drag,
  isActive,
}: StopEditorCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [activityModalVisible, setActivityModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);

  const timeString = `${String(stop.time.getHours()).padStart(2, '0')}:${String(stop.time.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={[styles.wrap, !isLast && styles.wrapWithConnector]}>
      <View style={styles.railColumn}>
        <View style={styles.iconBadge}>
          <MaterialIcons name={activityIcon[stop.activity]} size={20} color={theme.colors.onSecondaryContainer} />
        </View>
        {!isLast && <View style={styles.connector} />}
      </View>

      <View style={[styles.card, isActive && styles.cardActive]}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Pressable onLongPress={drag} disabled={isActive} hitSlop={8} style={styles.dragHandle}>
              <MaterialIcons name="drag-indicator" size={20} color={theme.colors.outline} />
            </Pressable>
            <Text style={styles.stopHeading}>Stop {index + 1}</Text>
          </View>
          <PickerField mode="time" value={stop.time} onChange={(time) => onChange({ ...stop, time })}>
            <View style={styles.timeChip}>
              <MaterialIcons name="schedule" size={14} color={theme.colors.outline} />
              <Text style={styles.timeChipText}>{formatTime12h(timeString)}</Text>
            </View>
          </PickerField>
        </View>

        <Text style={styles.fieldLabel}>WHERE</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter location name..."
          placeholderTextColor={theme.colors.outlineVariant}
          value={stop.title}
          onChangeText={(title) => onChange({ ...stop, title })}
        />

        <Pressable style={styles.locationRow} onPress={() => setLocationModalVisible(true)}>
          <MaterialIcons
            name={stop.location ? 'location-on' : 'add-location-alt'}
            size={16}
            color={stop.location ? theme.colors.primary : theme.colors.outline}
          />
          <Text style={[styles.locationText, stop.location && styles.locationTextSet]}>
            {stop.location ? 'Pin set on map — tap to adjust' : 'Set pin on map'}
          </Text>
        </Pressable>

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>ACTIVITY</Text>
            <Pressable style={styles.selectRow} onPress={() => setActivityModalVisible(true)}>
              <Text style={styles.selectText}>{activityLabel[stop.activity]}</Text>
              <MaterialIcons name="expand-more" size={18} color={theme.colors.outline} />
            </Pressable>
          </View>
          {canDelete && (
            <Pressable style={styles.deleteButton} onPress={onDelete} hitSlop={8}>
              <MaterialIcons name="delete-outline" size={20} color={theme.colors.error} />
            </Pressable>
          )}
        </View>

        <Text style={styles.fieldLabel}>NOTES (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="A small detail worth remembering..."
          placeholderTextColor={theme.colors.outlineVariant}
          value={stop.description}
          onChangeText={(description) => onChange({ ...stop, description })}
          multiline
        />
      </View>

      <ActivityPickerModal
        visible={activityModalVisible}
        selected={stop.activity}
        onSelect={(activity) => onChange({ ...stop, activity })}
        onClose={() => setActivityModalVisible(false)}
      />
      <LocationPickerModal
        visible={locationModalVisible}
        initialCoordinate={stop.location ?? mapDefaultCenter}
        onConfirm={(coordinate) => {
          onChange({ ...stop, location: coordinate });
          setLocationModalVisible(false);
        }}
        onClose={() => setLocationModalVisible(false)}
      />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      gap: 12,
    },
    wrapWithConnector: {
      paddingBottom: 4,
    },
    railColumn: {
      width: 40,
      alignItems: 'center',
    },
    iconBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    connector: {
      flex: 1,
      width: 1,
      minHeight: 24,
      backgroundColor: theme.colors.outlineVariant,
      marginTop: 4,
    },
    card: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      borderWidth: 1,
      borderColor: 'rgba(219,193,186,0.4)',
      padding: 16,
      marginBottom: 20,
      gap: 4,
      ...theme.shadows.sunsetGlow,
    },
    cardActive: {
      borderColor: theme.colors.primary,
      ...theme.shadows.bottomSheet,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dragHandle: {
      paddingVertical: 4,
      paddingRight: 2,
    },
    stopHeading: {
      fontFamily: theme.fonts.display,
      fontSize: 20,
      color: theme.colors.onSurface,
    },
    timeChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.surfaceVariant,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: theme.radii.sm,
    },
    timeChipText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.outline,
    },
    fieldLabel: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: theme.colors.outlineVariant,
      letterSpacing: 0.5,
      marginTop: 8,
      marginBottom: 4,
    },
    input: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurface,
      paddingVertical: 4,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 8,
      paddingVertical: 4,
    },
    locationText: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 12,
      color: theme.colors.outline,
    },
    locationTextSet: {
      color: theme.colors.primary,
    },
    fieldRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      marginTop: 4,
    },
    selectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    selectText: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    deleteButton: {
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
  });

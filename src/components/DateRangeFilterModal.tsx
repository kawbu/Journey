import React, { useMemo } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PickerField from './PickerField';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { formatShortDate } from '../utils/format';

export interface DateRange {
  start: string | null;
  end: string | null;
}

interface DateRangeFilterModalProps {
  visible: boolean;
  range: DateRange;
  onChange: (range: DateRange) => void;
  onClose: () => void;
}

function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function DateRangeFilterModal({ visible, range, onChange, onClose }: DateRangeFilterModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const startDate = range.start ? new Date(`${range.start}T00:00:00`) : new Date();
  const endDate = range.end ? new Date(`${range.end}T00:00:00`) : new Date();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.heading}>Filter by Date Range</Text>

          <Text style={styles.label}>From</Text>
          <PickerField mode="date" value={startDate} onChange={(d) => onChange({ ...range, start: toIso(d) })}>
            <View style={styles.field}>
              <MaterialIcons name="calendar-today" size={18} color={theme.colors.primary} />
              <Text style={styles.fieldText}>{range.start ? formatShortDate(range.start) : 'Any'}</Text>
            </View>
          </PickerField>

          <Text style={styles.label}>To</Text>
          <PickerField mode="date" value={endDate} onChange={(d) => onChange({ ...range, end: toIso(d) })}>
            <View style={styles.field}>
              <MaterialIcons name="calendar-today" size={18} color={theme.colors.primary} />
              <Text style={styles.fieldText}>{range.end ? formatShortDate(range.end) : 'Any'}</Text>
            </View>
          </PickerField>

          <View style={styles.actionsRow}>
            <Pressable
              style={styles.clearButton}
              onPress={() => {
                onChange({ start: null, end: null });
                onClose();
              }}
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
            <Pressable style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(28,28,25,0.35)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radii.xxl,
      borderTopRightRadius: theme.radii.xxl,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 32,
      ...theme.shadows.bottomSheet,
    },
    heading: {
      fontFamily: theme.fonts.display,
      fontSize: 20,
      color: theme.colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    label: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.outline,
      letterSpacing: 0.5,
      marginBottom: 6,
      marginTop: 12,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    fieldText: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    clearButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      backgroundColor: theme.colors.surfaceContainerHighest,
    },
    clearText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    doneButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: theme.radii.full,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    doneText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onPrimary,
    },
  });

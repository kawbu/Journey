import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import PickerField from './PickerField';
import { colors, fonts, radii, shadows } from '../theme/theme';
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
              <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
              <Text style={styles.fieldText}>{range.start ? formatShortDate(range.start) : 'Any'}</Text>
            </View>
          </PickerField>

          <Text style={styles.label}>To</Text>
          <PickerField mode="date" value={endDate} onChange={(d) => onChange({ ...range, end: toIso(d) })}>
            <View style={styles.field}>
              <MaterialIcons name="calendar-today" size={18} color={colors.primary} />
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

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,28,25,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xxl,
    borderTopRightRadius: radii.xxl,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    ...shadows.bottomSheet,
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.outline,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.full,
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHighest,
  },
  clearText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurfaceVariant,
  },
  doneButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radii.full,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  doneText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onPrimary,
  },
});

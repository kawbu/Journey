import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';

interface PickerFieldProps {
  mode: 'date' | 'time';
  value: Date;
  onChange: (date: Date) => void;
  children: React.ReactNode;
  minimumDate?: Date;
}

export default function PickerField({ mode, value, onChange, children, minimumDate }: PickerFieldProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [visible, setVisible] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      setVisible(false);
      if (event.type === 'set' && selected) onChange(selected);
      return;
    }
    if (selected) onChange(selected);
  };

  return (
    <>
      <Pressable onPress={() => setVisible(true)}>{children}</Pressable>
      {visible && Platform.OS === 'android' && (
        <DateTimePicker value={value} mode={mode} display="default" onChange={handleChange} minimumDate={minimumDate} />
      )}
      {visible && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade" onRequestClose={() => setVisible(false)}>
          <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
            <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
              <DateTimePicker
                value={value}
                mode={mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                textColor={theme.colors.onSurface}
              />
              <Pressable style={styles.doneButton} onPress={() => setVisible(false)}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      )}
      {visible && Platform.OS === 'web' && (
        <DateTimePicker value={value} mode={mode} display="default" onChange={handleChange} minimumDate={minimumDate} />
      )}
    </>
  );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,28,25,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    paddingBottom: 24,
    paddingTop: 8,
  },
  doneButton: {
    marginTop: 4,
    marginHorizontal: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneText: {
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
    color: theme.colors.onPrimary,
  },
});

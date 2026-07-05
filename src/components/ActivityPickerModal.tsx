import React, { useMemo } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { activityIcon, activityLabel, activityOptions } from '../theme/activityIcons';
import type { ActivityType } from '../types';

interface ActivityPickerModalProps {
  visible: boolean;
  selected: ActivityType;
  onSelect: (activity: ActivityType) => void;
  onClose: () => void;
}

export default function ActivityPickerModal({ visible, selected, onSelect, onClose }: ActivityPickerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.heading}>Choose an Activity</Text>
          <FlatList
            data={activityOptions}
            keyExtractor={(item) => item}
            numColumns={3}
            columnWrapperStyle={styles.row}
            renderItem={({ item }) => {
              const active = item === selected;
              return (
                <Pressable
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <MaterialIcons
                    name={activityIcon[item]}
                    size={22}
                    color={active ? theme.colors.onPrimary : theme.colors.primary}
                  />
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]} numberOfLines={1}>
                    {activityLabel[item]}
                  </Text>
                </Pressable>
              );
            }}
          />
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
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 32,
      maxHeight: '70%',
    },
    heading: {
      fontFamily: theme.fonts.display,
      fontSize: 20,
      color: theme.colors.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    row: {
      gap: 10,
      marginBottom: 10,
    },
    option: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 14,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surfaceContainerLow,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    optionActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionLabel: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: theme.colors.onSurface,
    },
    optionLabelActive: {
      color: theme.colors.onPrimary,
    },
  });

import React from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../theme/theme';
import { activityIcon, activityLabel, activityOptions } from '../theme/activityIcons';
import type { ActivityType } from '../types';

interface ActivityPickerModalProps {
  visible: boolean;
  selected: ActivityType;
  onSelect: (activity: ActivityType) => void;
  onClose: () => void;
}

export default function ActivityPickerModal({ visible, selected, onSelect, onClose }: ActivityPickerModalProps) {
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
                    color={active ? colors.onPrimary : colors.primary}
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  heading: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.primary,
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
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.onSurface,
  },
  optionLabelActive: {
    color: colors.onPrimary,
  },
});

import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts } from '../theme/theme';
import InvitePartnerModal from './InvitePartnerModal';
import NotificationsSettingsModal from './NotificationsSettingsModal';

interface MenuSheetProps {
  visible: boolean;
  onClose: () => void;
}

type ItemKey = 'invite' | 'reminders' | 'settings' | 'help';

const items: { key: ItemKey; icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string }[] = [
  { key: 'invite', icon: 'favorite', label: 'Invite Your Partner' },
  { key: 'reminders', icon: 'notifications-none', label: 'Reminders' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
  { key: 'help', icon: 'help-outline', label: 'Help & Feedback' },
];

export default function MenuSheet({ visible, onClose }: MenuSheetProps) {
  const [inviteVisible, setInviteVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

  const handlePress = (key: ItemKey) => {
    if (key === 'invite') {
      onClose();
      setInviteVisible(true);
      return;
    }
    if (key === 'reminders') {
      onClose();
      setNotifVisible(true);
      return;
    }
    onClose();
  };

  return (
    <>
      <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable style={styles.panelWrapper} onPress={(e) => e.stopPropagation()}>
            <SafeAreaView edges={['top', 'bottom']} style={styles.panel}>
              <Text style={styles.brand}>Our Journey</Text>
              <Text style={styles.tagline}>Every moment together, planned with care.</Text>
              <View style={styles.divider} />
              {items.map((item) => (
                <Pressable key={item.key} style={styles.row} onPress={() => handlePress(item.key)}>
                  <MaterialIcons name={item.icon} size={20} color={colors.primary} />
                  <Text style={styles.rowLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </SafeAreaView>
          </Pressable>
        </Pressable>
      </Modal>
      <InvitePartnerModal visible={inviteVisible} onClose={() => setInviteVisible(false)} />
      <NotificationsSettingsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(28,28,25,0.35)',
    flexDirection: 'row',
  },
  panelWrapper: {
    width: '78%',
    height: '100%',
  },
  panel: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.primary,
    marginTop: 12,
  },
  tagline: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 6,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: colors.outlineVariant,
    opacity: 0.4,
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  rowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 16,
    color: colors.onSurface,
  },
});

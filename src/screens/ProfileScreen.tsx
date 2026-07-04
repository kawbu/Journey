import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import AppHeader from '../components/AppHeader';
import MenuSheet from '../components/MenuSheet';
import InvitePartnerModal from '../components/InvitePartnerModal';
import NotificationsSettingsModal from '../components/NotificationsSettingsModal';
import { colors, fonts, radii, shadows, spacing } from '../theme/theme';
import { useDates } from '../context/DatesContext';
import { useAuth } from '../context/AuthContext';
import { friendlyNameFromEmail } from '../utils/format';

type SettingKey = 'relationship' | 'notifications' | 'privacy' | 'help';

const SETTINGS: { key: SettingKey; icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string }[] = [
  { key: 'relationship', icon: 'favorite-border', label: 'Relationship Details' },
  { key: 'notifications', icon: 'notifications-none', label: 'Notifications' },
  { key: 'privacy', icon: 'lock-outline', label: 'Privacy' },
  { key: 'help', icon: 'help-outline', label: 'Help & Feedback' },
];

export default function ProfileScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const { dates } = useDates();
  const { userId, userEmail, signOut, partner, journeyMembers, isPartnered } = useAuth();

  const selfMember = journeyMembers.find((m) => m.profileId === userId);
  const selfName = selfMember?.displayName || friendlyNameFromEmail(userEmail) || 'You';
  const partnerName = partner
    ? partner.displayName || friendlyNameFromEmail(partner.email) || 'Your Partner'
    : null;

  const handleSettingPress = (key: SettingKey) => {
    if (key === 'relationship') {
      setInviteVisible(true);
    }
    if (key === 'notifications') {
      setNotifVisible(true);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'You can always sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const stats = useMemo(() => {
    const totalStops = dates.reduce((sum, d) => sum + d.stops.length, 0);
    const completedStops = dates.reduce((sum, d) => sum + d.stops.filter((s) => s.completed).length, 0);
    return {
      totalDates: dates.length,
      totalStops,
      completedStops,
    };
  }, [dates]);

  return (
    <View style={styles.screen}>
      <AppHeader title="Our Journey" onLeftPress={() => setMenuVisible(true)} onRightPress={() => undefined} rightIcon="settings" />
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <InvitePartnerModal visible={inviteVisible} onClose={() => setInviteVisible(false)} />
      <NotificationsSettingsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarRow}>
          <View style={[styles.avatar, { marginRight: -16, backgroundColor: colors.secondaryContainer }]}>
            <MaterialIcons name="person" size={28} color={colors.onSecondaryContainer} />
          </View>
          <View style={[styles.avatar, { backgroundColor: colors.tertiaryContainer }]}>
            <MaterialIcons name="person" size={28} color={colors.onTertiaryContainer} />
          </View>
        </View>
        <Text style={styles.names}>{isPartnered ? `${selfName} & ${partnerName}` : 'You & Your Person'}</Text>
        <Text style={styles.since}>
          {isPartnered ? userEmail : 'Invite your partner to start sharing your journey'}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalDates}</Text>
            <Text style={styles.statLabel}>Dates Planned</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStops}</Text>
            <Text style={styles.statLabel}>Total Stops</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.completedStops}</Text>
            <Text style={styles.statLabel}>Memories Made</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.settingsCard}>
          {SETTINGS.map((item, idx) => (
            <Pressable
              key={item.key}
              style={[styles.settingRow, idx !== SETTINGS.length - 1 && styles.settingRowDivider]}
              onPress={() => handleSettingPress(item.key)}
            >
              <MaterialIcons name={item.icon} size={20} color={colors.primary} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.outlineVariant} />
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.marginMobile,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  names: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.onSurface,
    marginTop: 16,
  },
  since: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
    width: '100%',
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    paddingVertical: 16,
    alignItems: 'center',
    ...shadows.sunsetGlow,
  },
  statNumber: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.primary,
  },
  statLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionLabel: {
    alignSelf: 'flex-start',
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.outline,
    letterSpacing: 1,
    marginTop: 36,
    marginBottom: 12,
  },
  settingsCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  settingLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: colors.onSurface,
  },
  signOutButton: {
    marginTop: 32,
    width: '100%',
    paddingVertical: 16,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.error,
  },
});

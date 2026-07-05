import React, { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import MenuSheet from '../components/MenuSheet';
import InvitePartnerModal from '../components/InvitePartnerModal';
import NotificationsSettingsModal from '../components/NotificationsSettingsModal';
import JourneyPlusModal from '../components/JourneyPlusModal';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { useDates } from '../context/DatesContext';
import { useAuth } from '../context/AuthContext';
import { friendlyNameFromEmail } from '../utils/format';
import { pickAndUploadImage } from '../lib/imageUpload';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type SettingKey = 'relationship' | 'notifications' | 'settings' | 'help';

const SETTINGS: { key: SettingKey; icon: React.ComponentProps<typeof MaterialIcons>['name']; label: string }[] = [
  { key: 'relationship', icon: 'favorite-border', label: 'Relationship Details' },
  { key: 'notifications', icon: 'notifications-none', label: 'Notifications' },
  { key: 'settings', icon: 'settings', label: 'Settings' },
  { key: 'help', icon: 'help-outline', label: 'Help & Feedback' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [inviteVisible, setInviteVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [journeyPlusVisible, setJourneyPlusVisible] = useState(false);
  const { dates } = useDates();
  const { userId, userEmail, signOut, partner, journeyMembers, isPartnered, updateAvatar } = useAuth();

  const selfMember = journeyMembers.find((m) => m.profileId === userId);
  const selfName = selfMember?.displayName || friendlyNameFromEmail(userEmail) || 'You';
  const partnerName = partner
    ? partner.displayName || friendlyNameFromEmail(partner.email) || 'Your Partner'
    : null;

  const handlePickAvatar = async () => {
    if (!userId) return;
    const url = await pickAndUploadImage('avatars', `${userId}/avatar.jpg`);
    if (!url) return;
    const errorMessage = await updateAvatar(url);
    if (errorMessage) Alert.alert('Could not update photo', errorMessage);
  };

  const handleSettingPress = (key: SettingKey) => {
    if (key === 'relationship') {
      setInviteVisible(true);
    }
    if (key === 'notifications') {
      setNotifVisible(true);
    }
    if (key === 'settings') {
      navigation.navigate('Settings');
    }
    if (key === 'help') {
      navigation.navigate('HelpFeedback');
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
      <AppHeader
        title="Our Journey"
        onLeftPress={() => setMenuVisible(true)}
        onRightPress={() => navigation.navigate('Settings')}
        rightIcon="settings"
      />
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <InvitePartnerModal visible={inviteVisible} onClose={() => setInviteVisible(false)} />
      <NotificationsSettingsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
      <JourneyPlusModal visible={journeyPlusVisible} onClose={() => setJourneyPlusVisible(false)} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarRow}>
          <Pressable
            style={[styles.avatarWrap, { marginRight: -16 }]}
            onPress={handlePickAvatar}
            accessibilityLabel="Change your profile picture"
          >
            <View style={[styles.avatar, { backgroundColor: theme.colors.secondaryContainer }]}>
              {selfMember?.avatarUrl ? (
                <Image source={{ uri: selfMember.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <MaterialIcons name="person" size={28} color={theme.colors.onSecondaryContainer} />
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <MaterialIcons name="edit" size={12} color={theme.colors.onPrimary} />
            </View>
          </Pressable>
          <View style={[styles.avatar, { backgroundColor: theme.colors.tertiaryContainer }]}>
            {partner?.avatarUrl ? (
              <Image source={{ uri: partner.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <MaterialIcons name="person" size={28} color={theme.colors.onTertiaryContainer} />
            )}
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

        <Pressable style={styles.journeyPlusBanner} onPress={() => setJourneyPlusVisible(true)}>
          <View style={styles.journeyPlusIcon}>
            <MaterialIcons name="workspace-premium" size={24} color={theme.colors.onPrimary} />
          </View>
          <View style={styles.journeyPlusText}>
            <Text style={styles.journeyPlusTitle}>Journey+</Text>
            <Text style={styles.journeyPlusSubtitle}>Unlock deeper connection tools</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color={theme.colors.onPrimary} />
        </Pressable>

        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.settingsCard}>
          {SETTINGS.map((item, idx) => (
            <Pressable
              key={item.key}
              style={[styles.settingRow, idx !== SETTINGS.length - 1 && styles.settingRowDivider]}
              onPress={() => handleSettingPress(item.key)}
            >
              <MaterialIcons name={item.icon} size={20} color={theme.colors.primary} />
              <Text style={styles.settingLabel}>{item.label}</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.outlineVariant} />
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

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: 32,
      paddingBottom: 48,
      alignItems: 'center',
    },
    avatarRow: {
      flexDirection: 'row',
    },
    avatarWrap: {
      width: 64,
      height: 64,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: theme.colors.background,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarEditBadge: {
      position: 'absolute',
      top: -4,
      left: -4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    names: {
      fontFamily: theme.fonts.display,
      fontSize: 24,
      color: theme.colors.onSurface,
      marginTop: 16,
    },
    since: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
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
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
      paddingVertical: 16,
      alignItems: 'center',
      ...theme.shadows.sunsetGlow,
    },
    statNumber: {
      fontFamily: theme.fonts.display,
      fontSize: 24,
      color: theme.colors.primary,
    },
    statLabel: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
      marginTop: 4,
      textAlign: 'center',
    },
    journeyPlusBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      width: '100%',
      marginTop: 16,
      padding: 16,
      borderRadius: theme.radii.xl,
      backgroundColor: theme.colors.primary,
      ...theme.shadows.sunsetGlow,
    },
    journeyPlusIcon: {
      width: 52,
      height: 52,
      borderRadius: theme.radii.lg,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    journeyPlusText: {
      flex: 1,
    },
    journeyPlusTitle: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 17,
      color: theme.colors.onPrimary,
    },
    journeyPlusSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    sectionLabel: {
      alignSelf: 'flex-start',
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.outline,
      letterSpacing: 1,
      marginTop: 36,
      marginBottom: 12,
    },
    settingsCard: {
      width: '100%',
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.lg,
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
      borderBottomColor: theme.colors.surfaceContainerHigh,
    },
    settingLabel: {
      flex: 1,
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    signOutButton: {
      marginTop: 32,
      width: '100%',
      paddingVertical: 16,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: theme.colors.error,
      alignItems: 'center',
    },
    signOutText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.error,
    },
  });

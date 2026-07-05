import React, { useMemo, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import InvitePartnerModal from '../components/InvitePartnerModal';
import NotificationsSettingsModal from '../components/NotificationsSettingsModal';
import { useTheme, useThemeSettings, type ColorSchemePreference } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { useAuth } from '../context/AuthContext';
import { friendlyNameFromEmail } from '../utils/format';
import { pickAndUploadImage } from '../lib/imageUpload';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

const SCHEME_OPTIONS: { key: ColorSchemePreference; label: string; icon: IconName }[] = [
  { key: 'light', label: 'Light', icon: 'light-mode' },
  { key: 'dark', label: 'Dark', icon: 'dark-mode' },
  { key: 'system', label: 'System', icon: 'smartphone' },
];

function formatJoinDate(iso: string | undefined): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View>
      <Text style={styles.sectionLabel}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function NavRow({
  icon,
  label,
  value,
  disabled,
  external,
  isLast,
  onPress,
}: {
  icon: IconName;
  label: string;
  value?: string;
  disabled?: boolean;
  external?: boolean;
  isLast?: boolean;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <Pressable
      style={[styles.navRow, !isLast && styles.navRowDivider]}
      onPress={onPress}
      disabled={disabled || !onPress}
    >
      <View style={styles.navRowLeft}>
        <MaterialIcons name={icon} size={20} color={theme.colors.secondary} />
        <Text style={[styles.navRowLabel, disabled && styles.navRowLabelDisabled]}>{label}</Text>
      </View>
      <View style={styles.navRowRight}>
        {value && <Text style={styles.navRowValue}>{value}</Text>}
        <MaterialIcons
          name={external ? 'open-in-new' : 'chevron-right'}
          size={18}
          color={theme.colors.outline}
        />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { preference, setPreference } = useThemeSettings();
  const { userId, session, signOut, partner, journeyMembers, isPartnered, updateAvatar } = useAuth();
  const [inviteVisible, setInviteVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);

  const selfMember = journeyMembers.find((m) => m.profileId === userId);
  const selfName = selfMember?.displayName || friendlyNameFromEmail(session?.user.email) || 'You';
  const partnerName = partner
    ? partner.displayName || friendlyNameFromEmail(partner.email) || 'Your Partner'
    : null;
  const joinDate = formatJoinDate(session?.user.created_at);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const handlePickAvatar = async () => {
    if (!userId) return;
    const url = await pickAndUploadImage('avatars', `${userId}/avatar.jpg`);
    if (!url) return;
    const errorMessage = await updateAvatar(url);
    if (errorMessage) Alert.alert('Could not update photo', errorMessage);
  };

  const handleSignOut = () => {
    Alert.alert('Log out?', 'You can always sign back in.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <View style={styles.screen}>
      <AppHeader title="Settings" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} rightIcon="close" onRightPress={() => navigation.goBack()} />
      <InvitePartnerModal visible={inviteVisible} onClose={() => setInviteVisible(false)} />
      <NotificationsSettingsModal visible={notifVisible} onClose={() => setNotifVisible(false)} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <Pressable
            style={styles.avatarWrap}
            onPress={handlePickAvatar}
            accessibilityLabel="Change your profile picture"
          >
            <View style={styles.avatar}>
              {selfMember?.avatarUrl ? (
                <Image source={{ uri: selfMember.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <MaterialIcons name="person" size={36} color={theme.colors.onSecondaryContainer} />
              )}
            </View>
            <View style={styles.avatarEditBadge}>
              <MaterialIcons name="edit" size={14} color={theme.colors.onPrimary} />
            </View>
          </Pressable>
          <Text style={styles.profileName}>{isPartnered ? `${selfName} & ${partnerName}` : selfName}</Text>
          {joinDate && <Text style={styles.profileJoinDate}>JOINED {joinDate.toUpperCase()}</Text>}
        </View>

        <SectionCard title="Account">
          <NavRow icon="favorite-border" label="Relationship Details" onPress={() => setInviteVisible(true)} isLast />
        </SectionCard>

        <SectionCard title="Preferences">
          <View style={[styles.navRow, styles.navRowDivider]}>
            <View style={styles.navRowLeft}>
              <MaterialIcons name="palette" size={20} color={theme.colors.secondary} />
              <Text style={styles.navRowLabel}>Appearance</Text>
            </View>
            <View style={styles.schemeToggle}>
              {SCHEME_OPTIONS.map((option) => {
                const active = preference === option.key;
                return (
                  <Pressable
                    key={option.key}
                    style={[styles.schemeOption, active && styles.schemeOptionActive]}
                    onPress={() => setPreference(option.key)}
                  >
                    <Text style={[styles.schemeOptionLabel, active && styles.schemeOptionLabelActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <NavRow icon="notifications-none" label="Notifications" onPress={() => setNotifVisible(true)} isLast />
        </SectionCard>

        <SectionCard title="Support">
          <NavRow icon="help-outline" label="Help & Feedback" onPress={() => navigation.navigate('HelpFeedback')} isLast />
        </SectionCard>

        <SectionCard title="Legal">
          <NavRow icon="description" label="Terms of Service" disabled external />
          <NavRow icon="shield" label="Privacy Policy" disabled external isLast />
        </SectionCard>

        <View style={styles.footer}>
          <Pressable style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
          <Text style={styles.versionText}>v{appVersion} — Crafted for connection</Text>
        </View>
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
      paddingTop: theme.spacing.stackMd,
      paddingBottom: 48,
      gap: theme.spacing.stackLg,
    },
    profileSection: {
      alignItems: 'center',
      gap: 4,
    },
    avatarWrap: {
      width: 88,
      height: 88,
      marginBottom: 8,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: theme.colors.secondaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 4,
      borderColor: theme.colors.surfaceContainerHighest,
      overflow: 'hidden',
      ...theme.shadows.sunsetGlow,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarEditBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.colors.background,
    },
    profileName: {
      fontFamily: theme.fonts.display,
      fontSize: 22,
      color: theme.colors.onBackground,
      textAlign: 'center',
    },
    profileJoinDate: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: theme.colors.outline,
      letterSpacing: 1,
    },
    sectionLabel: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.primary,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: 8,
      marginLeft: 4,
    },
    card: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.xl,
      overflow: 'hidden',
    },
    navRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    navRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(219,193,186,0.3)',
    },
    navRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    navRowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    navRowLabel: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurface,
    },
    navRowLabelDisabled: {
      color: theme.colors.outline,
    },
    navRowValue: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 13,
      color: theme.colors.outline,
    },
    schemeToggle: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceContainerHigh,
      borderRadius: theme.radii.full,
      padding: 3,
      gap: 2,
    },
    schemeOption: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: theme.radii.full,
    },
    schemeOptionActive: {
      backgroundColor: theme.colors.primary,
    },
    schemeOptionLabel: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.outline,
    },
    schemeOptionLabelActive: {
      color: theme.colors.onPrimary,
    },
    footer: {
      alignItems: 'center',
      gap: 12,
      paddingTop: 8,
    },
    logoutButton: {
      paddingHorizontal: 32,
      paddingVertical: 12,
      borderRadius: theme.radii.full,
      borderWidth: 1,
      borderColor: 'rgba(219,193,186,0.5)',
    },
    logoutText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.outline,
    },
    versionText: {
      fontFamily: theme.fonts.body,
      fontSize: 12,
      color: theme.colors.outline,
      opacity: 0.7,
      fontStyle: 'italic',
    },
  });

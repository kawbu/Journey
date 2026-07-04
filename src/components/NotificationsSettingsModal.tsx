import React, { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, fonts, radii, shadows } from '../theme/theme';
import { useNotifications, type NotificationPreferences } from '../context/NotificationsContext';

interface NotificationsSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

function ToggleRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleTextWrap}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.outlineVariant, true: colors.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

function SectionCard({
  icon,
  iconBackground,
  title,
  children,
}: {
  icon: IconName;
  iconBackground: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconCircle, { backgroundColor: iconBackground }]}>
          <MaterialIcons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.toggleList}>{children}</View>
    </View>
  );
}

export default function NotificationsSettingsModal({ visible, onClose }: NotificationsSettingsModalProps) {
  const { preferences, permissionGranted, isSupported, ensurePermission, updatePreference } = useNotifications();

  useEffect(() => {
    if (visible && isSupported) ensurePermission();
  }, [visible, isSupported, ensurePermission]);

  const handleToggle = (key: keyof NotificationPreferences) => (value: boolean) => {
    updatePreference(key, value);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={onClose} style={styles.headerButton}>
            <MaterialIcons name="close" size={22} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>
            Manage how you and your partner stay connected. Choose when you'd like to be reminded of your
            shared moments and future plans.
          </Text>

          {!isSupported && (
            <View style={styles.permissionBanner}>
              <MaterialIcons name="info-outline" size={18} color={colors.error} />
              <Text style={styles.permissionBannerText}>
                Local notifications aren't available in Expo Go on Android. Your preferences below will still
                save, but you won't receive alerts on this device until the app is installed as a standalone
                build.
              </Text>
            </View>
          )}

          {isSupported && !permissionGranted && (
            <View style={styles.permissionBanner}>
              <MaterialIcons name="notifications-off" size={18} color={colors.error} />
              <Text style={styles.permissionBannerText}>
                Notifications are turned off for this app. Enable them in system settings to receive alerts.
              </Text>
            </View>
          )}

          <SectionCard icon="calendar-today" iconBackground={colors.primaryFixed} title="Date Planning">
            <ToggleRow
              title="New Date Plans"
              description="Instant alert when your partner adds a new date idea."
              value={preferences.newDatePlans}
              onValueChange={handleToggle('newDatePlans')}
            />
            <ToggleRow
              title="Anniversary Reminders"
              description="Special notifications for milestones and anniversaries."
              value={preferences.anniversaryReminders}
              onValueChange={handleToggle('anniversaryReminders')}
            />
          </SectionCard>

          <SectionCard icon="alarm" iconBackground={colors.secondaryContainer} title="Upcoming Alerts">
            <ToggleRow
              title="24h Before Date"
              description="Get a gentle nudge a day before your scheduled plan."
              value={preferences.reminder24h}
              onValueChange={handleToggle('reminder24h')}
            />
            <ToggleRow
              title="1h Before Date"
              description="A final nudge to help you transition into quality time."
              value={preferences.reminder1h}
              onValueChange={handleToggle('reminder1h')}
            />
          </SectionCard>

          <SectionCard icon="favorite" iconBackground={colors.tertiaryContainer} title="Bucket List">
            <ToggleRow
              title="Shared Bucket List Updates"
              description="Get notified when your partner adds or checks off an experience."
              value={preferences.bucketListUpdates}
              onValueChange={handleToggle('bucketListUpdates')}
            />
          </SectionCard>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.primary,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 20,
  },
  intro: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.onSurfaceVariant,
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.errorContainer,
    borderRadius: radii.lg,
    padding: 14,
  },
  permissionBannerText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.onErrorContainer,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.xxl,
    padding: 20,
    ...shadows.sunsetGlow,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 19,
    color: colors.onSurface,
  },
  toggleList: {
    gap: 18,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleTextWrap: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.onSurface,
  },
  toggleDescription: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
});

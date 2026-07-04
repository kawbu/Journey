import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notifications, NOTIFICATIONS_SUPPORTED } from '../lib/pushNotifications';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useBucketList } from './BucketListContext';
import type { Database } from '../lib/database.types';
import type { DateEntry } from '../types';

type PreferencesRow = Database['public']['Tables']['notification_preferences']['Row'];

export interface NotificationPreferences {
  newDatePlans: boolean;
  anniversaryReminders: boolean;
  reminder24h: boolean;
  reminder1h: boolean;
  bucketListUpdates: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  newDatePlans: true,
  anniversaryReminders: true,
  reminder24h: true,
  reminder1h: false,
  bucketListUpdates: true,
};

function mapPreferencesRow(row: PreferencesRow): NotificationPreferences {
  return {
    newDatePlans: row.new_date_plans,
    anniversaryReminders: row.anniversary_reminders,
    reminder24h: row.reminder_24h,
    reminder1h: row.reminder_1h,
    bucketListUpdates: row.bucket_list_updates,
  };
}

const PREF_COLUMN_BY_KEY: Record<keyof NotificationPreferences, string> = {
  newDatePlans: 'new_date_plans',
  anniversaryReminders: 'anniversary_reminders',
  reminder24h: 'reminder_24h',
  reminder1h: 'reminder_1h',
  bucketListUpdates: 'bucket_list_updates',
};

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// All direct expo-notifications calls are funneled through these helpers so
// the rest of the file never has to think about the null/unsupported case
// (Android + Expo Go — see src/lib/pushNotifications.ts).
async function getPermissionGranted(): Promise<boolean> {
  if (!Notifications) return false;
  return (await Notifications.getPermissionsAsync()).granted;
}

async function requestPermissionGranted(): Promise<boolean> {
  if (!Notifications) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function scheduleNotification(title: string, body: string, triggerDate: Date | null): Promise<string | null> {
  if (!Notifications) return null;
  if (triggerDate) {
    return Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: triggerDate },
    });
  }
  return Notifications.scheduleNotificationAsync({ content: { title, body }, trigger: null });
}

async function cancelNotification(id: string): Promise<void> {
  if (!Notifications) return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => undefined);
}

interface NotificationsContextValue {
  preferences: NotificationPreferences;
  isLoaded: boolean;
  permissionGranted: boolean;
  isSupported: boolean;
  ensurePermission: () => Promise<boolean>;
  updatePreference: (key: keyof NotificationPreferences, value: boolean) => Promise<void>;
  scheduleForDate: (entry: DateEntry) => Promise<void>;
  cancelForDate: (dateEntryId: string) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

async function cancelIfScheduled(key: string) {
  const id = await AsyncStorage.getItem(key);
  if (id) {
    await cancelNotification(id);
    await AsyncStorage.removeItem(key);
  }
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { userId, journeyId, anniversaryDate, isLoaded: isAuthLoaded } = useAuth();
  const { getItemById } = useBucketList();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  // Kept in a ref so realtime callbacks (set up once per journeyId) always
  // see the latest preference values without needing to resubscribe.
  const preferencesRef = useRef(preferences);
  preferencesRef.current = preferences;

  useEffect(() => {
    if (!isAuthLoaded || !userId) {
      setIsLoaded(false);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('profile_id', userId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn('Failed to load notification preferences', error);
        setIsLoaded(true);
        return;
      }

      if (data) {
        setPreferences(mapPreferencesRow(data));
      } else {
        // Defensive fallback — the sign-up trigger normally creates this row.
        const { data: inserted, error: insertError } = await supabase
          .from('notification_preferences')
          .insert({ profile_id: userId })
          .select()
          .single();
        if (insertError) {
          console.warn('Failed to create notification preferences', insertError);
        } else if (inserted) {
          setPreferences(mapPreferencesRow(inserted));
        }
      }
      setIsLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, isAuthLoaded]);

  useEffect(() => {
    getPermissionGranted().then(setPermissionGranted);
  }, []);

  const ensurePermission = useCallback(async () => {
    const current = await getPermissionGranted();
    if (current) {
      setPermissionGranted(true);
      return true;
    }
    const requested = await requestPermissionGranted();
    setPermissionGranted(requested);
    return requested;
  }, []);

  const updatePreference = useCallback(
    async (key: keyof NotificationPreferences, value: boolean) => {
      if (!userId) return;
      const previous = preferences;
      setPreferences((prev) => ({ ...prev, [key]: value }));
      const update: Database['public']['Tables']['notification_preferences']['Update'] = {
        [PREF_COLUMN_BY_KEY[key]]: value,
      };
      const { error } = await supabase.from('notification_preferences').update(update).eq('profile_id', userId);
      if (error) {
        console.warn('Failed to update notification preference', error);
        setPreferences(previous);
      }
    },
    [userId, preferences]
  );

  const cancelForDate = useCallback(async (dateEntryId: string) => {
    await cancelIfScheduled(`notif:${dateEntryId}:24h`);
    await cancelIfScheduled(`notif:${dateEntryId}:1h`);
  }, []);

  const scheduleForDate = useCallback(
    async (entry: DateEntry) => {
      await cancelForDate(entry.id);

      if (!(await getPermissionGranted())) return;

      const sortedStops = [...entry.stops].sort((a, b) => a.time.localeCompare(b.time));
      const firstStop = sortedStops[0];
      if (!firstStop) return;

      const [hours, minutes] = firstStop.time.split(':').map(Number);
      const startsAt = new Date(`${entry.date}T00:00:00`);
      startsAt.setHours(hours, minutes, 0, 0);

      const plans: { key: string; offsetMs: number; body: string }[] = [
        {
          key: `notif:${entry.id}:24h`,
          offsetMs: 24 * 60 * 60 * 1000,
          body: `${entry.title} is tomorrow — time to finalize the details.`,
        },
        {
          key: `notif:${entry.id}:1h`,
          offsetMs: 60 * 60 * 1000,
          body: `${entry.title} starts in an hour. Time to get ready!`,
        },
      ];

      for (const plan of plans) {
        const isEnabled = plan.key.endsWith('24h') ? preferencesRef.current.reminder24h : preferencesRef.current.reminder1h;
        if (!isEnabled) continue;
        const triggerDate = new Date(startsAt.getTime() - plan.offsetMs);
        if (triggerDate.getTime() <= Date.now()) continue;

        const id = await scheduleNotification('Our Journey', plan.body, triggerDate);
        if (id) await AsyncStorage.setItem(plan.key, id);
      }
    },
    [cancelForDate]
  );

  const scheduleAnniversaryReminder = useCallback(async () => {
    await cancelIfScheduled('notif:anniversary');
    if (!preferencesRef.current.anniversaryReminders || !anniversaryDate) return;
    if (!(await getPermissionGranted())) return;

    const [, month, day] = anniversaryDate.split('-').map(Number);
    const now = new Date();
    let next = new Date(now.getFullYear(), month - 1, day, 9, 0, 0, 0);
    if (next.getTime() <= now.getTime()) {
      next = new Date(now.getFullYear() + 1, month - 1, day, 9, 0, 0, 0);
    }

    const id = await scheduleNotification(
      'Our Journey',
      "Happy anniversary! Today's a good day to celebrate.",
      next
    );
    if (id) await AsyncStorage.setItem('notif:anniversary', id);
  }, [anniversaryDate]);

  useEffect(() => {
    scheduleAnniversaryReminder();
  }, [scheduleAnniversaryReminder]);

  // Realtime-triggered local notifications: fires only while this device's
  // app is open and subscribed — see the module-level "what this does NOT
  // do" note in the implementation plan for the true-remote-push limitation.
  useEffect(() => {
    if (!journeyId) return;
    const channel = supabase
      .channel(`notifications-${journeyId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'date_entries', filter: `journey_id=eq.${journeyId}` },
        (payload) => {
          const row = payload.new as { created_by: string | null; title: string };
          if (!preferencesRef.current.newDatePlans) return;
          if (row.created_by === userId) return;
          scheduleNotification('New date plan', `Your partner added "${row.title}" to your journey.`, null);
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'journey_bucket_status', filter: `journey_id=eq.${journeyId}` },
        (payload) => {
          const row = payload.new as { checked_by: string | null; bucket_item_id: string };
          if (!preferencesRef.current.bucketListUpdates) return;
          if (row.checked_by === userId) return;
          const item = getItemById(row.bucket_item_id);
          scheduleNotification(
            'Bucket list update',
            item ? `Your partner checked off "${item.title}"! 🎉` : 'Your partner checked off a bucket list item!',
            null
          );
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [journeyId, userId, getItemById]);

  const value = useMemo(
    () => ({
      preferences,
      isLoaded,
      permissionGranted,
      isSupported: NOTIFICATIONS_SUPPORTED,
      ensurePermission,
      updatePreference,
      scheduleForDate,
      cancelForDate,
    }),
    [preferences, isLoaded, permissionGranted, ensurePermission, updatePreference, scheduleForDate, cancelForDate]
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}

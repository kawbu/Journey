import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';

// expo-notifications throws (not just warns) the instant it's imported when
// running on Android inside Expo Go — a side-effect module it loads
// internally calls addPushTokenListener() at import time, which throws on
// that exact platform/environment combo (SDK 53+). iOS Expo Go only warns.
// Guarding the import itself (not just calls into it) is the only way to
// avoid the crash, since the throw happens before any of our code runs.
export const NOTIFICATIONS_SUPPORTED = !(Platform.OS === 'android' && isRunningInExpoGo());

// eslint-disable-next-line @typescript-eslint/no-require-imports
export const Notifications: typeof import('expo-notifications') | null = NOTIFICATIONS_SUPPORTED
  ? require('expo-notifications')
  : null;

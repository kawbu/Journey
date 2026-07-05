import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type Theme } from '../theme/theme';

export type ColorSchemePreference = 'light' | 'dark' | 'system';
export type ActiveScheme = 'light' | 'dark';

interface ThemeContextValue {
  preference: ColorSchemePreference;
  scheme: ActiveScheme;
  theme: Theme;
  isLoaded: boolean;
  setPreference: (pref: ColorSchemePreference) => Promise<void>;
}

const STORAGE_KEY = '@theme_preference';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ColorSchemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const setPreference = useCallback(async (pref: ColorSchemePreference) => {
    setPreferenceState(pref);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, pref);
    } catch (err) {
      console.warn('Failed to persist theme preference', err);
    }
  }, []);

  const scheme: ActiveScheme = useMemo(() => {
    if (preference === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return preference;
  }, [preference, systemScheme]);

  const theme = useMemo(() => (scheme === 'dark' ? darkTheme : lightTheme), [scheme]);

  const value = useMemo(
    () => ({ preference, scheme, theme, isLoaded, setPreference }),
    [preference, scheme, theme, isLoaded, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Returns the active Theme object directly — the common case for every
// screen/component that just needs to read colors/fonts/etc. Call
// useThemeSettings() instead for the raw preference/setter (only needed by
// the Settings screen's Appearance control).
export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx.theme;
}

export function useThemeSettings() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeSettings must be used within a ThemeProvider');
  return ctx;
}

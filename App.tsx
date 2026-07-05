import 'react-native-gesture-handler';
import React, { useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useFonts as useLibreCaslonFonts, LibreCaslonText_400Regular, LibreCaslonText_400Regular_Italic, LibreCaslonText_700Bold } from '@expo-google-fonts/libre-caslon-text';
import {
  useFonts as useBeVietnamFonts,
  BeVietnamPro_400Regular,
  BeVietnamPro_500Medium,
  BeVietnamPro_600SemiBold,
  BeVietnamPro_700Bold,
} from '@expo-google-fonts/be-vietnam-pro';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { BucketListProvider } from './src/context/BucketListContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import { DatesProvider } from './src/context/DatesContext';
import { ThemeProvider, useThemeSettings } from './src/context/ThemeContext';

function AppContent() {
  const { theme, scheme, isLoaded: themeLoaded } = useThemeSettings();

  const navigationTheme = useMemo(() => {
    const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: theme.colors.background,
        card: theme.colors.background,
        primary: theme.colors.primary,
        text: theme.colors.onSurface,
        border: theme.colors.outlineVariant,
      },
    };
  }, [theme, scheme]);

  if (!themeLoaded) return null;

  return (
    <AuthProvider>
      <BucketListProvider>
        <NotificationsProvider>
          <DatesProvider>
            <NavigationContainer theme={navigationTheme}>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <RootNavigator />
            </NavigationContainer>
          </DatesProvider>
        </NotificationsProvider>
      </BucketListProvider>
    </AuthProvider>
  );
}

export default function App() {
  const [libreLoaded] = useLibreCaslonFonts({
    LibreCaslonText_400Regular,
    LibreCaslonText_400Regular_Italic,
    LibreCaslonText_700Bold,
  });
  const [beVietnamLoaded] = useBeVietnamFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
  });

  if (!libreLoaded || !beVietnamLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

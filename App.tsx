import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
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
import { colors } from './src/theme/theme';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    primary: colors.primary,
    text: colors.onSurface,
    border: colors.outlineVariant,
  },
};

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
        <AuthProvider>
          <BucketListProvider>
            <NotificationsProvider>
              <DatesProvider>
                <NavigationContainer theme={navigationTheme}>
                  <StatusBar style="dark" />
                  <RootNavigator />
                </NavigationContainer>
              </DatesProvider>
            </NotificationsProvider>
          </BucketListProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

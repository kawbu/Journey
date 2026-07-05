import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';

const ICONS: Record<string, React.ComponentProps<typeof MaterialIcons>['name']> = {
  Dates: 'calendar-today',
  Map: 'map',
  BucketList: 'favorite',
  Profile: 'person',
};

const LABELS: Record<string, string> = {
  Dates: 'Dates',
  Map: 'Map',
  BucketList: 'Bucket List',
  Profile: 'Profile',
};

export default function TabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const label = LABELS[route.name] ?? route.name;
          const icon = ICONS[route.name] ?? 'circle';

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, focused && styles.tabItemActive]}
            >
              <MaterialIcons
                name={icon}
                size={22}
                color={focused ? theme.colors.onSecondaryContainer : theme.colors.onSurfaceVariant}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.surfaceTint,
      shadowOffset: { width: 0, height: -6 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 12,
    },
    bar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: 10,
      paddingHorizontal: 8,
      paddingBottom: 6,
    },
    tabItem: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      minWidth: 64,
    },
    tabItemActive: {
      backgroundColor: theme.colors.secondaryContainer,
    },
    label: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: theme.colors.onSurfaceVariant,
    },
    labelActive: {
      color: theme.colors.onSecondaryContainer,
      fontFamily: theme.fonts.bodySemiBold,
    },
  });

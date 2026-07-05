import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

interface AppHeaderProps {
  title?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onLeftPress?: () => void;
  onRightPress?: () => void;
}

export default function AppHeader({
  title = 'Our Journey',
  leftIcon = 'menu',
  rightIcon = 'add-circle',
  onLeftPress,
  onRightPress,
}: AppHeaderProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.container}>
        <Pressable hitSlop={10} onPress={onLeftPress} style={styles.iconButton}>
          <MaterialIcons name={leftIcon} size={24} color={theme.colors.primary} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Pressable hitSlop={10} onPress={onRightPress} style={styles.iconButton}>
          <MaterialIcons name={rightIcon} size={24} color={theme.colors.primary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    safe: {
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.surfaceTint,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 4,
      zIndex: 10,
    },
    container: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: theme.fonts.display,
      fontSize: 22,
      color: theme.colors.primary,
      flex: 1,
      textAlign: 'center',
    },
  });

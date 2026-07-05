import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';

interface MapPinProps {
  index: number;
  active: boolean;
  completed: boolean;
}

export default function MapPin({ index, active, completed }: MapPinProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.badge,
          active ? styles.badgeActive : completed ? styles.badgeCompleted : styles.badgeDefault,
          active && { transform: [{ scale: pulse }] },
        ]}
      >
        <Text style={[styles.number, active && styles.numberActive]}>{index}</Text>
      </Animated.View>
      <View style={[styles.stem, active && styles.stemActive]} />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'center',
    },
    badge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
    },
    badgeDefault: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
    },
    badgeCompleted: {
      backgroundColor: theme.colors.outlineVariant,
      borderColor: theme.colors.outline,
    },
    badgeActive: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    number: {
      fontFamily: theme.fonts.display,
      fontSize: 16,
      color: theme.colors.primary,
    },
    numberActive: {
      color: theme.colors.onPrimary,
      fontSize: 18,
    },
    stem: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginTop: 3,
    },
    stemActive: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
  });

import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';

interface JourneyPlusModalProps {
  visible: boolean;
  onClose: () => void;
}

type IconName = React.ComponentProps<typeof MaterialIcons>['name'];

const BENEFITS: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'auto-awesome',
    title: 'AI-Enhanced Planning',
    description: 'Personal date ideas tailored to your preferences and past memories.',
  },
  {
    icon: 'rocket-launch',
    title: 'Early Access',
    description: 'Be the first to try new romantic tools and features.',
  },
  {
    icon: 'bookmark',
    title: 'Shared Diary',
    description: 'Collaborative space for private notes and voice memos.',
  },
  {
    icon: 'support-agent',
    title: 'Priority Support',
    description: 'Direct line to our journey concierges.',
  },
];

export default function JourneyPlusModal({ visible, onClose }: JourneyPlusModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(progress, { toValue: 1, useNativeDriver: true, damping: 16, mass: 0.9 }).start();
    }
  }, [visible, progress]);

  const handleClose = () => {
    Animated.timing(progress, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => onClose());
  };

  const backdropStyle = { opacity: progress };
  const cardStyle = {
    opacity: progress,
    transform: [
      {
        translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
      },
    ],
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.backdropWrap}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View style={[styles.card, cardStyle]}>
          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="stars" size={40} color={theme.colors.onPrimary} />
            </View>
            <Text style={styles.headerTitle}>Unlock Your Journey+</Text>
            <Text style={styles.headerPrice}>$1.99 / MONTH</Text>
          </View>

          <View style={styles.body}>
            {BENEFITS.map((benefit) => (
              <View key={benefit.title} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <MaterialIcons name={benefit.icon} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDescription}>{benefit.description}</Text>
                </View>
              </View>
            ))}

            <Pressable style={styles.trialButton} onPress={handleClose}>
              <Text style={styles.trialButtonText}>Start Free Trial</Text>
              <MaterialIcons name="chevron-right" size={20} color={theme.colors.onPrimary} />
            </Pressable>
            <Pressable style={styles.laterButton} onPress={handleClose}>
              <Text style={styles.laterButtonText}>Maybe Later</Text>
            </Pressable>

            <Text style={styles.disclaimer}>
              Subscription automatically renews monthly. Cancel anytime in settings. By continuing, you
              agree to our Terms of Service.
            </Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdropWrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(28,20,16,0.45)',
    },
    card: {
      width: '100%',
      maxWidth: 420,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: 32,
      overflow: 'hidden',
      ...theme.shadows.bottomSheet,
    },
    header: {
      backgroundColor: theme.colors.primary,
      paddingTop: 40,
      paddingBottom: 56,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    iconCircle: {
      width: 76,
      height: 76,
      borderRadius: 38,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    headerTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 26,
      color: theme.colors.onPrimary,
      textAlign: 'center',
      marginBottom: 8,
    },
    headerPrice: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: 'rgba(255,255,255,0.9)',
      letterSpacing: 3,
    },
    body: {
      paddingHorizontal: 28,
      paddingTop: 32,
      paddingBottom: 32,
      marginTop: -24,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
    },
    benefitRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 24,
    },
    benefitIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
    },
    benefitText: {
      flex: 1,
    },
    benefitTitle: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 15,
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    benefitDescription: {
      fontFamily: theme.fonts.body,
      fontSize: 13,
      color: theme.colors.onSurfaceVariant,
      lineHeight: 18,
    },
    trialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.colors.primary,
      borderRadius: 18,
      paddingVertical: 16,
      marginTop: 8,
      ...theme.shadows.sunsetGlow,
    },
    trialButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 15,
      color: theme.colors.onPrimary,
    },
    laterButton: {
      alignItems: 'center',
      paddingVertical: 14,
    },
    laterButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    disclaimer: {
      fontFamily: theme.fonts.body,
      fontSize: 10,
      color: theme.colors.outline,
      textAlign: 'center',
      lineHeight: 15,
      marginTop: 8,
      paddingHorizontal: 8,
    },
  });

import React, { useMemo } from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import type { BucketItem } from '../types';

interface BucketCardProps {
  item: BucketItem;
  onPlan: (item: BucketItem) => void;
  checked: boolean;
  onToggleChecked: () => void;
}

export default function BucketCard({ item, onPlan, checked, onToggleChecked }: BucketCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const isFullWidth = item.layout === 'large' || item.layout === 'wide';
  const height = item.layout === 'large' ? 340 : item.layout === 'wide' ? 140 : 208;

  return (
    <View style={[styles.wrap, isFullWidth ? styles.fullWidth : styles.halfWidth]}>
      <ImageBackground
        source={{ uri: item.image }}
        style={[styles.image, { height }]}
        imageStyle={styles.imageRadius}
      >
        <View style={styles.overlay} />
        <Pressable
          style={[styles.checkBadge, checked && styles.checkBadgeChecked]}
          onPress={onToggleChecked}
          hitSlop={8}
        >
          <MaterialIcons
            name={checked ? 'check-circle' : 'check-circle-outline'}
            size={22}
            color={checked ? theme.colors.primary : '#ffffff'}
          />
        </Pressable>
        {item.layout === 'wide' ? (
          <View style={styles.wideContent}>
            <View>
              {item.featured && <Text style={styles.featuredLabel}>FEATURED</Text>}
              <Text style={styles.wideTitle}>{item.title}</Text>
            </View>
            <Pressable style={styles.planButtonSolid} onPress={() => onPlan(item)}>
              <Text style={styles.planButtonSolidText}>Plan</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.content}>
            {item.layout === 'large' && (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{item.category}</Text>
              </View>
            )}
            <Text style={item.layout === 'large' ? styles.largeTitle : styles.standardTitle}>
              {item.title}
            </Text>
            {item.layout === 'large' && item.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <Pressable
              style={item.layout === 'large' ? styles.planButtonSolid : styles.planButtonGhost}
              onPress={() => onPlan(item)}
            >
              <Text
                style={item.layout === 'large' ? styles.planButtonSolidText : styles.planButtonGhostText}
              >
                Plan This
              </Text>
            </Pressable>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      borderRadius: theme.radii.xl,
      overflow: 'hidden',
      ...theme.shadows.sunsetGlow,
      marginBottom: 16,
    },
    fullWidth: {
      width: '100%',
    },
    halfWidth: {
      width: '48%',
    },
    image: {
      width: '100%',
      justifyContent: 'flex-end',
      backgroundColor: theme.colors.surfaceContainer,
    },
    imageRadius: {
      borderRadius: theme.radii.xl,
    },
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.28)',
    },
    checkBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.25)',
    },
    checkBadgeChecked: {
      backgroundColor: '#ffffff',
    },
    content: {
      padding: 14,
    },
    wideContent: {
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    categoryChip: {
      backgroundColor: theme.colors.tertiaryFixed,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: 10,
    },
    categoryChipText: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: theme.colors.onTertiaryFixed,
    },
    featuredLabel: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 11,
      color: 'rgba(255,255,255,0.75)',
      letterSpacing: 1.5,
      marginBottom: 2,
    },
    largeTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 24,
      color: '#ffffff',
      marginBottom: 6,
    },
    wideTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 20,
      color: '#ffffff',
    },
    standardTitle: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 15,
      color: '#ffffff',
      marginBottom: 10,
    },
    description: {
      fontFamily: theme.fonts.body,
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      marginBottom: 14,
    },
    planButtonSolid: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 999,
      alignItems: 'center',
    },
    planButtonSolidText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 13,
      color: theme.colors.onPrimary,
    },
    planButtonGhost: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.3)',
      paddingVertical: 7,
      borderRadius: 999,
      alignItems: 'center',
    },
    planButtonGhostText: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 12,
      color: '#ffffff',
    },
  });

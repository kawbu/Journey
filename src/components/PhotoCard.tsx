import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import type { DatePhoto } from '../types';

interface PhotoCardProps {
  photo: DatePhoto;
  rotation: number;
  onPress: () => void;
  onDelete: () => void;
}

export default function PhotoCard({ photo, rotation, onPress, onDelete }: PhotoCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.card, { transform: [{ rotate: `${rotation}deg` }] }]}>
      <Pressable hitSlop={8} onPress={onDelete} style={styles.deleteButton}>
        <MaterialIcons name="close" size={14} color={theme.colors.onPrimary} />
      </Pressable>
      <Pressable style={styles.imageWrap} onPress={onPress}>
        <Image source={{ uri: photo.url }} style={styles.image} />
      </Pressable>
      {photo.caption ? (
        <Text style={styles.caption} numberOfLines={1}>
          {photo.caption}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flex: 1,
      aspectRatio: 1,
      backgroundColor: theme.colors.surfaceContainerLowest,
      borderRadius: theme.radii.sm,
      padding: 10,
      paddingBottom: 28,
      margin: 6,
      ...theme.shadows.sunsetGlow,
    },
    imageWrap: {
      flex: 1,
      overflow: 'hidden',
      borderRadius: theme.radii.sm,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    caption: {
      position: 'absolute',
      bottom: 8,
      left: 10,
      right: 10,
      textAlign: 'center',
      fontFamily: theme.fonts.displayItalic,
      fontSize: 13,
      color: theme.colors.primary,
    },
    deleteButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      ...theme.shadows.sunsetGlow,
    },
  });

import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import PhotoCard from '../components/PhotoCard';
import PhotoViewerModal from '../components/PhotoViewerModal';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { useDates } from '../context/DatesContext';
import { useAuth } from '../context/AuthContext';
import { useDatePhotos, type LoadedDatePhoto } from '../context/useDatePhotos';
import { pickAndUploadImage } from '../lib/imageUpload';
import { formatFriendlyDate } from '../utils/format';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type MemoriesRoute = RouteProp<RootStackParamList, 'DateMemories'>;

type GridItem = { kind: 'add' } | { kind: 'photo'; photo: LoadedDatePhoto };

// A stable, deterministic "hand-placed" tilt per card so the scrapbook feel
// doesn't jitter between re-renders.
function rotationForIndex(index: number): number {
  const pattern = [1, -2, 2, -1, 1.5, -1.5];
  return pattern[index % pattern.length];
}

export default function DateMemoriesScreen() {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<Nav>();
  const route = useRoute<MemoriesRoute>();
  const { dateId } = route.params;
  const { getDateById } = useDates();
  const { journeyId } = useAuth();
  const entry = getDateById(dateId);
  const { photos, isLoaded, addPhoto, removePhoto } = useDatePhotos(dateId);
  const [uploading, setUploading] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<LoadedDatePhoto | null>(null);

  const gridData: GridItem[] = useMemo(
    () => [{ kind: 'add' }, ...photos.map((photo) => ({ kind: 'photo' as const, photo }))],
    [photos]
  );

  const handleAddPhoto = async () => {
    if (!journeyId || uploading) return;
    setUploading(true);
    try {
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
      const storagePath = `${journeyId}/${dateId}/${filename}`;
      const url = await pickAndUploadImage('date-photos', storagePath);
      if (url) await addPhoto(url, storagePath);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = (photo: LoadedDatePhoto) => {
    Alert.alert('Delete this photo?', 'This will remove it from your gallery for good.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => removePhoto(photo) },
    ]);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.headerRow}>
          <Pressable hitSlop={10} onPress={() => navigation.goBack()} style={styles.iconButton}>
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.primary} />
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {entry?.title ?? 'Memory'}
            </Text>
            {entry && <Text style={styles.headerSubtitle}>{formatFriendlyDate(entry.date)}</Text>}
          </View>
          <View style={styles.iconButton} />
        </View>
      </SafeAreaView>

      <FlatList
        data={gridData}
        keyExtractor={(item) => (item.kind === 'add' ? 'add' : item.photo.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.gridContent}
        ListHeaderComponent={
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>The Gallery</Text>
            <Text style={styles.galleryCount}>
              {photos.length} {photos.length === 1 ? 'Moment' : 'Moments'} Captured
            </Text>
          </View>
        }
        renderItem={({ item, index }) =>
          item.kind === 'add' ? (
            <Pressable
              style={[styles.addTile, uploading && styles.addTileDisabled]}
              onPress={handleAddPhoto}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={theme.colors.outline} />
              ) : (
                <>
                  <MaterialIcons name="add-a-photo" size={24} color={theme.colors.outlineVariant} />
                  <Text style={styles.addTileText}>Add Photo</Text>
                </>
              )}
            </Pressable>
          ) : (
            <PhotoCard
              photo={item.photo}
              rotation={rotationForIndex(index)}
              onPress={() => setViewingPhoto(item.photo)}
              onDelete={() => handleDeletePhoto(item.photo)}
            />
          )
        }
        ListEmptyComponent={
          isLoaded ? (
            <View style={styles.empty}>
              <MaterialIcons name="photo-camera" size={28} color={theme.colors.outlineVariant} />
              <Text style={styles.emptyText}>No photos yet — add the first moment from this day.</Text>
            </View>
          ) : (
            <ActivityIndicator style={styles.loading} color={theme.colors.primary} />
          )
        }
      />

      <PhotoViewerModal photo={viewingPhoto} onClose={() => setViewingPhoto(null)} />
    </View>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerSafe: {
      backgroundColor: theme.colors.background,
      shadowColor: theme.colors.surfaceTint,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      elevation: 4,
      zIndex: 10,
    },
    headerRow: {
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
    headerTitleWrap: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 20,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    headerSubtitle: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
      marginTop: 2,
    },
    gridContent: {
      paddingHorizontal: theme.spacing.marginMobile - 6,
      paddingTop: theme.spacing.stackLg,
      paddingBottom: 40,
    },
    row: {
      justifyContent: 'flex-start',
    },
    galleryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.stackMd,
      paddingHorizontal: 6,
    },
    galleryTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 22,
      color: theme.colors.primary,
    },
    galleryCount: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 12,
      color: theme.colors.onSurfaceVariant,
    },
    addTile: {
      flex: 1,
      aspectRatio: 1,
      margin: 6,
      borderRadius: theme.radii.sm,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.colors.surfaceContainerLowest,
    },
    addTileDisabled: {
      opacity: 0.6,
    },
    addTileText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.outlineVariant,
    },
    empty: {
      paddingVertical: 60,
      alignItems: 'center',
      gap: 12,
    },
    emptyText: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      paddingHorizontal: 30,
    },
    loading: {
      marginTop: 40,
    },
  });

import React, { useMemo, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import PickerField from '../components/PickerField';
import StopEditorCard, { type StopDraft } from '../components/StopEditorCard';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';
import { useDates } from '../context/DatesContext';
import { useAuth } from '../context/AuthContext';
import { coverImageFor } from '../data/mockData';
import { pickAndUploadImage } from '../lib/imageUpload';
import type { RootStackParamList } from '../navigation/types';
import type { DateEntry } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'PlanDate'>;
type PlanRoute = RouteProp<RootStackParamList, 'PlanDate'>;

const SF_CENTER = { latitude: 37.7749, longitude: -122.4194 };

let draftKeySeed = 0;
function nextKey() {
  draftKeySeed += 1;
  return `draft-${Date.now()}-${draftKeySeed}`;
}

function makeDefaultStop(hour: number, prefillTitle?: string): StopDraft {
  const time = new Date();
  time.setHours(hour, 0, 0, 0);
  return {
    key: nextKey(),
    time,
    title: prefillTitle ?? '',
    description: '',
    activity: 'dinner',
    location: null,
  };
}

function stopDraftFromStop(stop: DateEntry['stops'][number]): StopDraft {
  const [h, m] = stop.time.split(':').map(Number);
  const time = new Date();
  time.setHours(h, m, 0, 0);
  return {
    key: nextKey(),
    id: stop.id,
    time,
    title: stop.title,
    description: stop.description,
    activity: stop.activity,
    location: stop.location,
    completed: stop.completed,
  };
}

export default function PlanDateScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<PlanRoute>();
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { addDate, updateDate, removeDate, getDateById } = useDates();
  const { journeyId } = useAuth();

  const editDateId = route.params?.editDateId;
  const editingEntry = editDateId ? getDateById(editDateId) : undefined;
  const isEditing = !!editingEntry;

  // Stable across re-renders (and known before save) so the cover image
  // upload path always agrees with the eventual date_entries.id.
  const [entryId] = useState(() => editingEntry?.id ?? `date-${Date.now()}`);
  const [coverImage, setCoverImage] = useState<string | null>(editingEntry?.coverImage ?? null);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [title, setTitle] = useState(editingEntry?.title ?? route.params?.prefillTitle ?? '');
  const [date, setDate] = useState(() => {
    if (editingEntry) return new Date(`${editingEntry.date}T00:00:00`);
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  });
  const [stops, setStops] = useState<StopDraft[]>(() => {
    if (editingEntry) {
      return editingEntry.stops
        .slice()
        .sort((a, b) => a.time.localeCompare(b.time))
        .map(stopDraftFromStop);
    }
    return [
      {
        ...makeDefaultStop(18, route.params?.prefillTitle),
        activity: route.params?.prefillActivity ?? 'dinner',
      },
    ];
  });
  const [saving, setSaving] = useState(false);

  const updateStop = (key: string, next: StopDraft) => {
    setStops((prev) => prev.map((s) => (s.key === key ? next : s)));
  };

  const deleteStop = (key: string) => {
    setStops((prev) => (prev.length > 1 ? prev.filter((s) => s.key !== key) : prev));
  };

  const addStop = () => {
    const lastHour = stops.length > 0 ? stops[stops.length - 1].time.getHours() + 1 : 18;
    setStops((prev) => [...prev, makeDefaultStop(Math.min(lastHour, 23))]);
  };

  const handlePickCoverImage = async () => {
    if (!journeyId) return;
    setUploadingCover(true);
    try {
      const url = await pickAndUploadImage('date-covers', `${journeyId}/${entryId}.jpg`);
      if (url) setCoverImage(url);
    } finally {
      setUploadingCover(false);
    }
  };

  const buildEntry = (isDraft: boolean): DateEntry | null => {
    if (!title.trim()) {
      Alert.alert('Give it a name', 'Add a title for this day before saving.');
      return null;
    }
    const incomplete = stops.find((s) => !s.title.trim() || !s.location);
    if (incomplete && !isDraft) {
      Alert.alert('Almost there', 'Every stop needs a location name and a pin on the map.');
      return null;
    }

    const isoDate = date.toISOString().slice(0, 10);
    const sorted = [...stops].sort((a, b) => a.time.getTime() - b.time.getTime());
    const firstActivity = sorted[0]?.activity ?? 'surprise';

    return {
      id: entryId,
      title: title.trim(),
      subtitle:
        stops.length > 1 ? `${stops.length} Stops Planned Together` : 'A Day Made For Two',
      date: isoDate,
      coverImage: coverImage ?? editingEntry?.coverImage ?? coverImageFor(firstActivity),
      isDraft,
      stops: sorted.map((s, idx) => ({
        id: s.id ?? `${nextKey()}-${idx}`,
        time: `${String(s.time.getHours()).padStart(2, '0')}:${String(s.time.getMinutes()).padStart(2, '0')}`,
        title: s.title.trim() || 'Untitled Stop',
        description: s.description.trim() || 'A little surprise, just for the two of you.',
        activity: s.activity,
        location: s.location ?? SF_CENTER,
        completed: s.completed ?? false,
      })),
    };
  };

  const handleSave = async (isDraft: boolean) => {
    const entry = buildEntry(isDraft);
    if (!entry) return;
    setSaving(true);
    try {
      if (isEditing) {
        await updateDate(entry);
      } else {
        await addDate(entry);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editingEntry) return;
    Alert.alert('Delete this journey?', 'This will remove the day and all of its stops.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeDate(editingEntry.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.screen}>
        <AppHeader
          title="Our Journey"
          leftIcon="close"
          onLeftPress={() => navigation.goBack()}
          rightIcon="check"
          onRightPress={saving ? undefined : () => handleSave(false)}
        />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.heroTitle}>{isEditing ? 'Edit Your Story' : 'Create a New Story'}</Text>
          <Text style={styles.heroSubtitle}>
            {isEditing
              ? 'Adjust the plan — every detail, still made with care.'
              : 'Design a meaningful day together, stop by stop.'}
          </Text>

          <View style={styles.detailsCard}>
            <Text style={styles.fieldLabel}>DATE TITLE</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Sunset & Strings"
              placeholderTextColor={theme.colors.outlineVariant}
              value={title}
              onChangeText={setTitle}
            />
            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>WHEN</Text>
            <PickerField mode="date" value={date} onChange={setDate} minimumDate={new Date()}>
              <View style={styles.dateRow}>
                <MaterialIcons name="calendar-today" size={18} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                </Text>
              </View>
            </PickerField>

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>COVER PHOTO</Text>
            <Pressable
              style={styles.coverRow}
              onPress={handlePickCoverImage}
              disabled={uploadingCover}
              accessibilityLabel="Change cover photo"
            >
              {coverImage ? (
                <Image source={{ uri: coverImage }} style={styles.coverThumb} />
              ) : (
                <View style={[styles.coverThumb, styles.coverThumbEmpty]}>
                  <MaterialIcons name="photo-camera" size={18} color={theme.colors.outline} />
                </View>
              )}
              <Text style={styles.coverText}>
                {uploadingCover ? 'Uploading...' : coverImage ? 'Change Cover Photo' : 'Add a Cover Photo'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.stopsList}>
            {stops.map((stop, idx) => (
              <StopEditorCard
                key={stop.key}
                stop={stop}
                index={idx}
                isLast={idx === stops.length - 1}
                canDelete={stops.length > 1}
                mapDefaultCenter={stops[idx - 1]?.location ?? SF_CENTER}
                onChange={(next) => updateStop(stop.key, next)}
                onDelete={() => deleteStop(stop.key)}
              />
            ))}
          </View>

          <Pressable style={styles.addStopButton} onPress={addStop}>
            <MaterialIcons name="add" size={18} color={theme.colors.outline} />
            <Text style={styles.addStopText}>Add Another Stop</Text>
          </Pressable>

          <View style={styles.actions}>
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={() => handleSave(false)}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? 'SAVING...' : isEditing ? 'SAVE CHANGES' : 'SAVE JOURNEY'}
              </Text>
            </Pressable>
            {isEditing ? (
              <Pressable style={styles.deleteButton} onPress={handleDelete} disabled={saving}>
                <Text style={styles.deleteButtonText}>DELETE JOURNEY</Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.draftButton}
                onPress={() => handleSave(true)}
                disabled={saving}
              >
                <Text style={styles.draftButtonText}>SAVE AS DRAFT</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.marginMobile,
      paddingTop: 24,
      paddingBottom: 60,
    },
    heroTitle: {
      fontFamily: theme.fonts.display,
      fontSize: 26,
      color: theme.colors.primary,
    },
    heroSubtitle: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
      opacity: 0.85,
      marginTop: 6,
      marginBottom: 24,
    },
    detailsCard: {
      backgroundColor: theme.colors.surfaceContainerLow,
      borderRadius: theme.radii.xl,
      padding: 16,
      marginBottom: 32,
      borderWidth: 1,
      borderColor: 'rgba(219,193,186,0.3)',
    },
    fieldLabel: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 12,
      color: theme.colors.primary,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    titleInput: {
      fontFamily: theme.fonts.display,
      fontSize: 18,
      color: theme.colors.onSurface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.outlineVariant,
      paddingBottom: 8,
    },
    dateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dateText: {
      fontFamily: theme.fonts.body,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
    },
    coverRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    coverThumb: {
      width: 44,
      height: 44,
      borderRadius: theme.radii.md,
    },
    coverThumbEmpty: {
      backgroundColor: theme.colors.surfaceContainerHigh,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant,
    },
    coverText: {
      fontFamily: theme.fonts.bodyMedium,
      fontSize: 15,
      color: theme.colors.onSurfaceVariant,
    },
    stopsList: {
      marginBottom: 4,
    },
    addStopButton: {
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.colors.outlineVariant,
      borderRadius: theme.radii.xl,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginBottom: 32,
    },
    addStopText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.outline,
    },
    actions: {
      gap: 12,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.onPrimary,
      letterSpacing: 0.8,
    },
    draftButton: {
      borderRadius: theme.radii.full,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(151,66,42,0.2)',
    },
    draftButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.primary,
      letterSpacing: 0.8,
    },
    deleteButton: {
      borderRadius: theme.radii.full,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.error,
    },
    deleteButtonText: {
      fontFamily: theme.fonts.bodySemiBold,
      fontSize: 14,
      color: theme.colors.error,
      letterSpacing: 0.8,
    },
  });

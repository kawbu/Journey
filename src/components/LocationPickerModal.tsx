import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, type LatLng } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import type { Theme } from '../theme/theme';

interface LocationPickerModalProps {
  visible: boolean;
  initialCoordinate: LatLng;
  onConfirm: (coordinate: LatLng) => void;
  onClose: () => void;
}

interface Suggestion {
  id: string;
  label: string;
  sublabel: string;
  latitude: number;
  longitude: number;
}

const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_MS = 450;

async function fetchSuggestions(query: string, signal: AbortSignal): Promise<Suggestion[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&q=${encodeURIComponent(
    query
  )}`;
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/json',
      // Nominatim's usage policy asks for an identifying User-Agent on requests.
      'User-Agent': 'TwilightEmberDatePlanner/1.0',
    },
  });
  if (!response.ok) throw new Error(`Nominatim error ${response.status}`);
  const data: Array<{ place_id: number; display_name: string; lat: string; lon: string }> =
    await response.json();
  return data.map((item) => {
    const parts = item.display_name.split(',').map((p) => p.trim());
    return {
      id: String(item.place_id),
      label: parts[0] || item.display_name,
      sublabel: parts.slice(1, 4).join(', '),
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    };
  });
}

export default function LocationPickerModal({
  visible,
  initialCoordinate,
  onConfirm,
  onClose,
}: LocationPickerModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [coordinate, setCoordinate] = useState<LatLng>(initialCoordinate);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [dropdownDismissed, setDropdownDismissed] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSearchError(null);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);
    setSearchError(null);

    const timeout = setTimeout(() => {
      fetchSuggestions(trimmed, controller.signal)
        .then((results) => {
          setSuggestions(results);
          setSearchError(results.length === 0 ? 'No matches found.' : null);
        })
        .catch((err) => {
          if (err?.name !== 'AbortError') {
            setSuggestions([]);
            setSearchError('Search unavailable right now.');
          }
        })
        .finally(() => setSearching(false));
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  const handleSelectSuggestion = (s: Suggestion) => {
    const next = { latitude: s.latitude, longitude: s.longitude };
    setCoordinate(next);
    setQuery(s.label);
    setSuggestions([]);
    setDropdownDismissed(true);
    Keyboard.dismiss();
    mapRef.current?.animateToRegion({ ...next, latitudeDelta: 0.02, longitudeDelta: 0.02 }, 500);
  };

  const showDropdown = !dropdownDismissed && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable hitSlop={10} onPress={onClose} style={styles.headerButton}>
            <MaterialIcons name="close" size={22} color={theme.colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>Drop a Pin</Text>
          <Pressable hitSlop={10} onPress={() => onConfirm(coordinate)} style={styles.headerButton}>
            <MaterialIcons name="check" size={22} color={theme.colors.primary} />
          </Pressable>
        </View>

        <View style={styles.mapWrap}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              ...initialCoordinate,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
            onPress={(e) => {
              setCoordinate(e.nativeEvent.coordinate);
              setDropdownDismissed(true);
              Keyboard.dismiss();
            }}
          >
            <Marker
              coordinate={coordinate}
              draggable
              onDragEnd={(e) => setCoordinate(e.nativeEvent.coordinate)}
              pinColor={theme.colors.primary}
            />
          </MapView>

          <View style={styles.searchOverlay} pointerEvents="box-none">
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color={theme.colors.primary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for a place or address..."
                placeholderTextColor={theme.colors.outline}
                value={query}
                onChangeText={(text) => {
                  setQuery(text);
                  setDropdownDismissed(false);
                }}
                onSubmitEditing={() => suggestions[0] && handleSelectSuggestion(suggestions[0])}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searching && <ActivityIndicator size="small" color={theme.colors.primary} />}
              {!searching && query.length > 0 && (
                <Pressable
                  onPress={() => {
                    setQuery('');
                    setSuggestions([]);
                  }}
                  hitSlop={8}
                >
                  <MaterialIcons name="close" size={18} color={theme.colors.outline} />
                </Pressable>
              )}
            </View>

            {showDropdown && (suggestions.length > 0 || searchError) && (
              <View style={styles.dropdown}>
                {suggestions.length > 0 ? (
                  <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 260 }}>
                    {suggestions.map((s, idx) => (
                      <Pressable
                        key={s.id}
                        style={[styles.suggestionRow, idx !== suggestions.length - 1 && styles.suggestionDivider]}
                        onPress={() => handleSelectSuggestion(s)}
                      >
                        <MaterialIcons name="location-on" size={18} color={theme.colors.primary} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.suggestionLabel} numberOfLines={1}>
                            {s.label}
                          </Text>
                          {!!s.sublabel && (
                            <Text style={styles.suggestionSublabel} numberOfLines={1}>
                              {s.sublabel}
                            </Text>
                          )}
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.dropdownEmpty}>{searchError}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        <Text style={styles.hint}>Search above, or tap and drag the pin to fine-tune it.</Text>
        <Pressable style={styles.confirmButton} onPress={() => onConfirm(coordinate)}>
          <Text style={styles.confirmText}>Set This Location</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 56,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: theme.fonts.display,
    fontSize: 20,
    color: theme.colors.primary,
  },
  mapWrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
  },
  searchOverlay: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.xl,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(219,193,186,0.4)',
    ...theme.shadows.sunsetGlow,
  },
  searchInput: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: theme.colors.onSurface,
    paddingVertical: 2,
  },
  dropdown: {
    marginTop: 8,
    backgroundColor: theme.colors.background,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(219,193,186,0.4)',
    overflow: 'hidden',
    ...theme.shadows.sunsetGlow,
  },
  dropdownEmpty: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    padding: 14,
    textAlign: 'center',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.surfaceContainerHigh,
  },
  suggestionLabel: {
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
    color: theme.colors.onSurface,
  },
  suggestionSublabel: {
    fontFamily: theme.fonts.bodyMedium,
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    marginTop: 1,
  },
  hint: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    paddingHorizontal: 32,
    marginTop: 12,
    marginBottom: 12,
  },
  confirmButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radii.full,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: theme.fonts.bodySemiBold,
    fontSize: 14,
    color: theme.colors.onPrimary,
    letterSpacing: 0.5,
  },
});

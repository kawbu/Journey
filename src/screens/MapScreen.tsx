import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import AppHeader from '../components/AppHeader';
import MenuSheet from '../components/MenuSheet';
import MapPin from '../components/MapPin';
import StopDetailCard from '../components/StopDetailCard';
import { colors, fonts, radii } from '../theme/theme';
import { useDates } from '../context/DatesContext';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { formatFriendlyDate } from '../utils/format';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type MapRoute = RouteProp<TabParamList, 'Map'>;

function regionFromCoords(coords: { latitude: number; longitude: number }[]): Region {
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max((maxLat - minLat) * 1.8, 0.02);
  const lngDelta = Math.max((maxLng - minLng) * 1.8, 0.02);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

export default function MapScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<MapRoute>();
  const { upcomingDates, sortedStops } = useDates();
  const mapRef = useRef<MapView>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDateId, setSelectedDateId] = useState<string | undefined>(
    route.params?.dateId ?? upcomingDates[0]?.id
  );
  const [selectedStopId, setSelectedStopId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (route.params?.dateId) {
      setSelectedDateId(route.params.dateId);
    }
  }, [route.params?.dateId]);

  const activeDate = useMemo(
    () => upcomingDates.find((d) => d.id === selectedDateId) ?? upcomingDates[0],
    [upcomingDates, selectedDateId]
  );

  const stops = useMemo(() => (activeDate ? sortedStops(activeDate) : []), [activeDate, sortedStops]);

  const currentStop = useMemo(() => stops.find((s) => !s.completed) ?? stops[stops.length - 1], [stops]);

  useEffect(() => {
    setSelectedStopId(currentStop?.id);
  }, [currentStop, activeDate?.id]);

  useEffect(() => {
    if (stops.length === 0 || !mapRef.current) return;
    const region = regionFromCoords(stops.map((s) => s.location));
    mapRef.current.animateToRegion(region, 500);
  }, [stops]);

  const displayedStop = stops.find((s) => s.id === selectedStopId) ?? currentStop;
  const displayedIndex = displayedStop ? stops.findIndex((s) => s.id === displayedStop.id) + 1 : 0;

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Our Journey"
        onLeftPress={() => setMenuVisible(true)}
        onRightPress={() => navigation.navigate('PlanDate')}
      />
      <MenuSheet visible={menuVisible} onClose={() => setMenuVisible(false)} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dateSwitcher}
        contentContainerStyle={styles.dateSwitcherContent}
      >
        {upcomingDates.map((d) => {
          const active = d.id === activeDate?.id;
          return (
            <Pressable
              key={d.id}
              onPress={() => setSelectedDateId(d.id)}
              style={[styles.dateChip, active && styles.dateChipActive]}
            >
              <Text style={[styles.dateChipText, active && styles.dateChipTextActive]} numberOfLines={1}>
                {d.title}
              </Text>
              <Text style={[styles.dateChipSubtext, active && styles.dateChipTextActive]}>
                {formatFriendlyDate(d.date)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.mapWrap}>
        {stops.length > 0 && (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            initialRegion={regionFromCoords(stops.map((s) => s.location))}
          >
            <Polyline
              coordinates={stops.map((s) => s.location)}
              strokeColor={colors.primary}
              strokeWidth={3}
              lineDashPattern={[8, 8]}
            />
            {stops.map((stop, idx) => (
              <Marker
                key={stop.id}
                coordinate={stop.location}
                onPress={() => setSelectedStopId(stop.id)}
                anchor={{ x: 0.5, y: 1 }}
                tracksViewChanges={false}
              >
                <MapPin
                  index={idx + 1}
                  active={stop.id === displayedStop?.id}
                  completed={stop.completed}
                />
              </Marker>
            ))}
          </MapView>
        )}

        {!activeDate && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Plan a date to see it come alive on the map.</Text>
          </View>
        )}

        {displayedStop && activeDate && (
          <View style={styles.detailCardWrap}>
            <StopDetailCard
              stop={displayedStop}
              index={displayedIndex}
              total={stops.length}
              isCurrent={displayedStop.id === currentStop?.id}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dateSwitcher: {
    flexGrow: 0,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHigh,
  },
  dateSwitcherContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerHigh,
    marginRight: 10,
    minWidth: 140,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
  },
  dateChipText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.onSurface,
  },
  dateChipSubtext: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  dateChipTextActive: {
    color: colors.onPrimary,
  },
  mapWrap: {
    flex: 1,
  },
  emptyState: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  detailCardWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
});

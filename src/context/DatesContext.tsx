import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationsContext';
import type { Database } from '../lib/database.types';
import type { DateEntry, Stop } from '../types';

type DateEntryRow = Database['public']['Tables']['date_entries']['Row'];
type StopRow = Database['public']['Tables']['stops']['Row'];
type DateEntryWithStops = DateEntryRow & { stops: StopRow[] };

interface DatesContextValue {
  dates: DateEntry[];
  isLoaded: boolean;
  addDate: (entry: DateEntry) => Promise<void>;
  updateDate: (entry: DateEntry) => Promise<void>;
  removeDate: (dateId: string) => Promise<void>;
  toggleStopCompleted: (dateId: string, stopId: string) => Promise<void>;
  getDateById: (dateId: string) => DateEntry | undefined;
  sortedStops: (entry: DateEntry) => Stop[];
  upcomingDates: DateEntry[];
  pastDates: DateEntry[];
  strictlyUpcomingDates: DateEntry[];
}

const DatesContext = createContext<DatesContextValue | undefined>(undefined);

function sortStopsByTime(stops: Stop[]): Stop[] {
  return [...stops].sort((a, b) => a.time.localeCompare(b.time));
}

function mapStopRow(row: StopRow): Stop {
  return {
    id: row.id,
    time: row.time.slice(0, 5),
    title: row.title,
    description: row.description ?? '',
    activity: row.activity,
    location: { latitude: row.latitude, longitude: row.longitude },
    address: row.address ?? undefined,
    completed: row.completed,
    durationLabel: row.duration_label ?? undefined,
    rating: row.rating ?? undefined,
  };
}

function mapDateEntryRow(row: DateEntryWithStops): DateEntry {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? '',
    date: row.date,
    coverImage: row.cover_image ?? '',
    isDraft: row.is_draft,
    stops: row.stops.map(mapStopRow),
  };
}

function stopToInsertRow(stop: Stop, dateEntryId: string): Database['public']['Tables']['stops']['Insert'] {
  return {
    date_entry_id: dateEntryId,
    time: stop.time,
    title: stop.title,
    description: stop.description || null,
    activity: stop.activity,
    latitude: stop.location.latitude,
    longitude: stop.location.longitude,
    address: stop.address || null,
    completed: stop.completed,
    duration_label: stop.durationLabel || null,
    rating: stop.rating ?? null,
  };
}

export function DatesProvider({ children }: { children: React.ReactNode }) {
  const { journeyId, userId, isLoaded: isAuthLoaded } = useAuth();
  const { scheduleForDate, cancelForDate } = useNotifications();
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchDates = useCallback(async (forJourneyId: string) => {
    const { data, error } = await supabase
      .from('date_entries')
      .select('*, stops(*)')
      .eq('journey_id', forJourneyId)
      .order('date', { ascending: true });
    if (error) {
      console.warn('Failed to load dates', error);
      return;
    }
    setDates((data as DateEntryWithStops[]).map(mapDateEntryRow));
  }, []);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!journeyId) {
      setDates([]);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    fetchDates(journeyId).finally(() => setIsLoaded(true));
  }, [journeyId, isAuthLoaded, fetchDates]);

  // Live-update when either partner adds/edits/removes a date or stop.
  // `stops` has no journey_id column to filter on directly, so it's
  // subscribed unfiltered — fine at this app's scale, and every event just
  // triggers a single refetch rather than trying to patch state precisely.
  useEffect(() => {
    if (!journeyId) return;
    const channel = supabase
      .channel(`journey-dates-${journeyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'date_entries', filter: `journey_id=eq.${journeyId}` },
        () => fetchDates(journeyId)
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stops' }, () => fetchDates(journeyId))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [journeyId, fetchDates]);

  const addDate = useCallback(
    async (entry: DateEntry) => {
      if (!journeyId) return;
      const { data: inserted, error } = await supabase
        .from('date_entries')
        .insert({
          journey_id: journeyId,
          title: entry.title,
          subtitle: entry.subtitle || null,
          date: entry.date,
          cover_image: entry.coverImage || null,
          is_draft: entry.isDraft ?? false,
          created_by: userId,
        })
        .select()
        .single();
      if (error || !inserted) {
        console.warn('Failed to create date', error);
        return;
      }
      if (entry.stops.length > 0) {
        const { error: stopsError } = await supabase
          .from('stops')
          .insert(entry.stops.map((s) => stopToInsertRow(s, inserted.id)));
        if (stopsError) console.warn('Failed to create stops', stopsError);
      }
      await scheduleForDate({ ...entry, id: inserted.id });
      await fetchDates(journeyId);
    },
    [journeyId, userId, fetchDates, scheduleForDate]
  );

  const updateDate = useCallback(
    async (entry: DateEntry) => {
      if (!journeyId) return;
      const { error } = await supabase
        .from('date_entries')
        .update({
          title: entry.title,
          subtitle: entry.subtitle || null,
          date: entry.date,
          cover_image: entry.coverImage || null,
          is_draft: entry.isDraft ?? false,
        })
        .eq('id', entry.id);
      if (error) {
        console.warn('Failed to update date', error);
        return;
      }
      // Simplest correct way to reconcile stop edits/additions/removals:
      // replace the full stop set rather than diffing individual rows.
      const { error: deleteError } = await supabase.from('stops').delete().eq('date_entry_id', entry.id);
      if (deleteError) console.warn('Failed to clear old stops', deleteError);
      if (entry.stops.length > 0) {
        const { error: stopsError } = await supabase
          .from('stops')
          .insert(entry.stops.map((s) => stopToInsertRow(s, entry.id)));
        if (stopsError) console.warn('Failed to recreate stops', stopsError);
      }
      await scheduleForDate(entry);
      await fetchDates(journeyId);
    },
    [journeyId, fetchDates, scheduleForDate]
  );

  const removeDate = useCallback(
    async (dateId: string) => {
      const { error } = await supabase.from('date_entries').delete().eq('id', dateId);
      if (error) {
        console.warn('Failed to delete date', error);
        return;
      }
      await cancelForDate(dateId);
      setDates((prev) => prev.filter((d) => d.id !== dateId));
    },
    [cancelForDate]
  );

  const toggleStopCompleted = useCallback(
    async (dateId: string, stopId: string) => {
      const entry = dates.find((d) => d.id === dateId);
      const stop = entry?.stops.find((s) => s.id === stopId);
      if (!stop) return;
      const nextCompleted = !stop.completed;

      // Optimistic local update so the UI responds immediately.
      setDates((prev) =>
        prev.map((d) =>
          d.id !== dateId
            ? d
            : { ...d, stops: d.stops.map((s) => (s.id === stopId ? { ...s, completed: nextCompleted } : s)) }
        )
      );

      const { error } = await supabase.from('stops').update({ completed: nextCompleted }).eq('id', stopId);
      if (error) {
        console.warn('Failed to update stop', error);
        // Revert on failure.
        setDates((prev) =>
          prev.map((d) =>
            d.id !== dateId
              ? d
              : { ...d, stops: d.stops.map((s) => (s.id === stopId ? { ...s, completed: !nextCompleted } : s)) }
          )
        );
      }
    },
    [dates]
  );

  const getDateById = useCallback((dateId: string) => dates.find((d) => d.id === dateId), [dates]);

  const sortedStops = useCallback((entry: DateEntry) => sortStopsByTime(entry.stops), []);

  const upcomingDates = useMemo(
    () => [...dates].sort((a, b) => a.date.localeCompare(b.date)),
    [dates]
  );

  const pastDates = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return dates.filter((d) => d.date < todayIso).sort((a, b) => b.date.localeCompare(a.date));
  }, [dates]);

  // Same as upcomingDates, but excludes dates that have already passed — used
  // by the "Upcoming Dates" list screen. upcomingDates itself stays
  // unfiltered because MapScreen relies on being able to show/select past
  // dates' maps too.
  const strictlyUpcomingDates = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return dates.filter((d) => d.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date));
  }, [dates]);

  const value = useMemo(
    () => ({
      dates,
      isLoaded,
      addDate,
      updateDate,
      removeDate,
      toggleStopCompleted,
      getDateById,
      sortedStops,
      upcomingDates,
      pastDates,
      strictlyUpcomingDates,
    }),
    [
      dates,
      isLoaded,
      addDate,
      updateDate,
      removeDate,
      toggleStopCompleted,
      getDateById,
      sortedStops,
      upcomingDates,
      pastDates,
      strictlyUpcomingDates,
    ]
  );

  return <DatesContext.Provider value={value}>{children}</DatesContext.Provider>;
}

export function useDates() {
  const ctx = useContext(DatesContext);
  if (!ctx) throw new Error('useDates must be used within a DatesProvider');
  return ctx;
}

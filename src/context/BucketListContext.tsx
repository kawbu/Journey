import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { BucketItem } from '../types';

interface BucketListContextValue {
  items: BucketItem[];
  checkedItemIds: Set<string>;
  isLoaded: boolean;
  toggleChecked: (bucketItemId: string) => Promise<void>;
  getItemById: (id: string) => BucketItem | undefined;
}

const BucketListContext = createContext<BucketListContextValue | undefined>(undefined);

export function BucketListProvider({ children }: { children: React.ReactNode }) {
  const { journeyId, userId, isLoaded: isAuthLoaded } = useAuth();
  const [items, setItems] = useState<BucketItem[]>([]);
  const [checkedItemIds, setCheckedItemIds] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchBucketItems = useCallback(async () => {
    const { data, error } = await supabase.from('bucket_items').select('*').order('created_at', { ascending: true });
    if (error) {
      console.warn('Failed to load bucket list', error);
      return;
    }
    setItems(
      data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        category: row.category,
        image: row.image ?? '',
        featured: row.featured,
        layout: row.layout,
        suggestedActivity: row.suggested_activity,
      }))
    );
  }, []);

  const fetchCheckedStatus = useCallback(async (forJourneyId: string) => {
    const { data, error } = await supabase
      .from('journey_bucket_status')
      .select('bucket_item_id')
      .eq('journey_id', forJourneyId);
    if (error) {
      console.warn('Failed to load bucket checked status', error);
      return;
    }
    setCheckedItemIds(new Set(data.map((row) => row.bucket_item_id)));
  }, []);

  useEffect(() => {
    fetchBucketItems();
  }, [fetchBucketItems]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!journeyId) {
      setCheckedItemIds(new Set());
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    fetchCheckedStatus(journeyId).finally(() => setIsLoaded(true));
  }, [journeyId, isAuthLoaded, fetchCheckedStatus]);

  useEffect(() => {
    if (!journeyId) return;
    const channel = supabase
      .channel(`journey-bucket-${journeyId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'journey_bucket_status', filter: `journey_id=eq.${journeyId}` },
        () => fetchCheckedStatus(journeyId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [journeyId, fetchCheckedStatus]);

  const toggleChecked = useCallback(
    async (bucketItemId: string) => {
      if (!journeyId) return;
      const isChecked = checkedItemIds.has(bucketItemId);

      // Optimistic local update so the UI responds immediately.
      setCheckedItemIds((prev) => {
        const next = new Set(prev);
        if (isChecked) next.delete(bucketItemId);
        else next.add(bucketItemId);
        return next;
      });

      const { error } = isChecked
        ? await supabase
            .from('journey_bucket_status')
            .delete()
            .eq('journey_id', journeyId)
            .eq('bucket_item_id', bucketItemId)
        : await supabase
            .from('journey_bucket_status')
            .insert({ journey_id: journeyId, bucket_item_id: bucketItemId, checked_by: userId });

      if (error) {
        console.warn('Failed to update bucket checked status', error);
        // Revert on failure.
        setCheckedItemIds((prev) => {
          const next = new Set(prev);
          if (isChecked) next.add(bucketItemId);
          else next.delete(bucketItemId);
          return next;
        });
      }
    },
    [journeyId, userId, checkedItemIds]
  );

  const getItemById = useCallback((id: string) => items.find((i) => i.id === id), [items]);

  const value = useMemo(
    () => ({ items, checkedItemIds, isLoaded, toggleChecked, getItemById }),
    [items, checkedItemIds, isLoaded, toggleChecked, getItemById]
  );

  return <BucketListContext.Provider value={value}>{children}</BucketListContext.Provider>;
}

export function useBucketList() {
  const ctx = useContext(BucketListContext);
  if (!ctx) throw new Error('useBucketList must be used within a BucketListProvider');
  return ctx;
}

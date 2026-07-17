import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { deleteUploadedImage } from '../lib/imageUpload';
import type { Database } from '../lib/database.types';
import type { DatePhoto } from '../types';

type DatePhotoRow = Database['public']['Tables']['date_photos']['Row'];

// Photos carry their Storage path internally so a delete can remove the
// exact object without parsing it back out of the public URL — the public
// DatePhoto type doesn't need callers to know about it.
export type LoadedDatePhoto = DatePhoto & { storagePath: string };

function mapPhotoRow(row: DatePhotoRow): LoadedDatePhoto {
  return {
    id: row.id,
    url: row.url,
    caption: row.caption ?? undefined,
    createdAt: row.created_at,
    storagePath: row.storage_path,
  };
}

interface UseDatePhotosResult {
  photos: LoadedDatePhoto[];
  isLoaded: boolean;
  addPhoto: (url: string, storagePath: string) => Promise<void>;
  removePhoto: (photo: LoadedDatePhoto) => Promise<void>;
}

export function useDatePhotos(dateEntryId: string | undefined): UseDatePhotosResult {
  const [photos, setPhotos] = useState<LoadedDatePhoto[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchPhotos = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('date_photos')
      .select('*')
      .eq('date_entry_id', id)
      .order('created_at', { ascending: true });
    if (error) {
      console.warn('Failed to load date photos', error);
      return;
    }
    setPhotos((data as DatePhotoRow[]).map(mapPhotoRow));
  }, []);

  useEffect(() => {
    if (!dateEntryId) {
      setPhotos([]);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    fetchPhotos(dateEntryId).finally(() => setIsLoaded(true));
  }, [dateEntryId, fetchPhotos]);

  useEffect(() => {
    if (!dateEntryId) return;
    const channel = supabase
      .channel(`date-photos-${dateEntryId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'date_photos', filter: `date_entry_id=eq.${dateEntryId}` },
        () => fetchPhotos(dateEntryId)
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [dateEntryId, fetchPhotos]);

  const addPhoto = useCallback(
    async (url: string, storagePath: string) => {
      if (!dateEntryId) return;
      const { error } = await supabase
        .from('date_photos')
        .insert({ date_entry_id: dateEntryId, url, storage_path: storagePath });
      if (error) {
        console.warn('Failed to save date photo', error);
        return;
      }
      await fetchPhotos(dateEntryId);
    },
    [dateEntryId, fetchPhotos]
  );

  const removePhoto = useCallback(async (photo: LoadedDatePhoto) => {
    // Optimistic removal, consistent with the rest of the app's mutator pattern.
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    const { error } = await supabase.from('date_photos').delete().eq('id', photo.id);
    if (error) {
      console.warn('Failed to delete date photo', error);
      setPhotos((prev) => [...prev, photo].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      return;
    }
    await deleteUploadedImage('date-photos', photo.storagePath);
  }, []);

  return { photos, isLoaded, addPhoto, removePhoto };
}

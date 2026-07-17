import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { EncodingType, readAsStringAsync } from 'expo-file-system/legacy';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { supabase } from './supabase';

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

export type UploadBucket = 'avatars' | 'date-covers' | 'date-photos';

// Picks an image from the camera roll, downscales + compresses it, uploads
// it to the given Supabase Storage bucket/path, and returns the public URL.
// Returns null on permission denial, cancellation, or any failure — callers
// can treat this as a plain no-op rather than needing try/catch.
export async function pickAndUploadImage(bucket: UploadBucket, path: string): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') return null;

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });
  if (result.canceled || !result.assets[0]) return null;

  try {
    const manipulated = await ImageManipulator.manipulate(result.assets[0].uri)
      .resize({ width: MAX_DIMENSION })
      .renderAsync();
    const saved = await manipulated.saveAsync({ compress: JPEG_QUALITY, format: SaveFormat.JPEG });

    // React Native's `fetch(...).blob()` produces a Blob that Supabase's
    // storage client can't upload directly (it isn't a real Blob under the
    // hood), so read the file as base64 and hand it an ArrayBuffer instead —
    // the standard workaround for Supabase Storage uploads on Expo/RN.
    const base64 = await readAsStringAsync(saved.uri, { encoding: EncodingType.Base64 });
    const arrayBuffer = decodeBase64(base64);

    const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
    if (error) {
      console.warn(`Failed to upload image to ${bucket}/${path}`, error);
      return null;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (err) {
    console.warn('Image processing/upload failed', err);
    return null;
  }
}

// Deletes an object from Supabase Storage. Used when removing a single photo
// from a one-to-many gallery (unlike avatars/date-covers, which just get
// overwritten via upsert and never need an explicit delete).
export async function deleteUploadedImage(bucket: UploadBucket, path: string): Promise<boolean> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.warn(`Failed to delete image ${bucket}/${path}`, error);
    return false;
  }
  return true;
}

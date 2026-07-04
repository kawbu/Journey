import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';
import type { ActivityType } from '../types';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

// Maps each activity to a MaterialIcons glyph name (closest match to the
// Material Symbols used in the original Stitch design).
export const activityIcon: Record<ActivityType, IconName> = {
  breakfast: 'free-breakfast',
  brunch: 'restaurant',
  dinner: 'restaurant',
  drinks: 'local-bar',
  coffee: 'local-cafe',
  dessert: 'icecream',
  walk: 'directions-walk',
  hike: 'terrain',
  park: 'park',
  movie: 'movie',
  music: 'music-note',
  gallery: 'palette',
  stargazing: 'auto-awesome',
  shopping: 'shopping-bag',
  surprise: 'star',
};

export const activityLabel: Record<ActivityType, string> = {
  breakfast: 'Breakfast',
  brunch: 'Brunch',
  dinner: 'Dinner',
  drinks: 'Drinks',
  coffee: 'Coffee',
  dessert: 'Dessert',
  walk: 'Walk',
  hike: 'Hike',
  park: 'Park',
  movie: 'Cinema',
  music: 'Live Music',
  gallery: 'Gallery',
  stargazing: 'Stargazing',
  shopping: 'Shopping',
  surprise: 'Surprise',
};

export const activityOptions: ActivityType[] = [
  'breakfast',
  'brunch',
  'coffee',
  'dinner',
  'drinks',
  'dessert',
  'walk',
  'hike',
  'park',
  'movie',
  'music',
  'gallery',
  'stargazing',
  'shopping',
  'surprise',
];

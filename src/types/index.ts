export type ActivityType =
  | 'breakfast'
  | 'brunch'
  | 'dinner'
  | 'drinks'
  | 'coffee'
  | 'dessert'
  | 'walk'
  | 'hike'
  | 'park'
  | 'movie'
  | 'music'
  | 'gallery'
  | 'stargazing'
  | 'shopping'
  | 'surprise';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Stop {
  id: string;
  time: string; // 24h "HH:mm" used for sorting + editing
  title: string;
  description: string;
  activity: ActivityType;
  location: Coordinates;
  address?: string;
  completed: boolean;
  durationLabel?: string;
  rating?: number;
}

export interface DateEntry {
  id: string;
  title: string;
  subtitle: string;
  date: string; // ISO yyyy-mm-dd
  coverImage: string;
  isDraft?: boolean;
  stops: Stop[];
}

export type BucketCategory = 'Outdoors' | 'Creative' | 'Fine Dining' | 'Staycation';

export interface BucketItem {
  id: string;
  title: string;
  description?: string;
  category: BucketCategory;
  image: string;
  featured?: boolean;
  layout: 'large' | 'standard' | 'wide';
  suggestedActivity: ActivityType;
}

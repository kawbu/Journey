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
  orderIndex: number;
  time: string; // 24h "HH:mm" for editing/display
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

export interface DatePhoto {
  id: string;
  url: string;
  caption?: string;
  createdAt: string;
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

export interface AiSuggestion {
  clientId: string; // local-only, for React keys — never sent to/from the server
  title: string;
  description: string;
  suggestedActivity: ActivityType;
  suggestedCategory: BucketCategory;
}

export interface SavedAiSuggestion {
  id: string;
  title: string;
  description?: string;
  suggestedActivity: ActivityType;
  suggestedCategory: BucketCategory;
  createdAt: string;
}

export interface ChatMessage {
  id: string; // client-generated, for React keys — never sent to the server
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

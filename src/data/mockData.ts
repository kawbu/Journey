import type { ActivityType } from '../types';

const coverImagesByActivity: Partial<Record<ActivityType, string>> = {
  breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?q=80&w=1200&auto=format&fit=crop',
  brunch: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?q=80&w=1200&auto=format&fit=crop',
  dinner: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop',
  drinks: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?q=80&w=1200&auto=format&fit=crop',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
  dessert: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1200&auto=format&fit=crop',
  walk: 'https://images.unsplash.com/photo-1552083375-1447ce886485?q=80&w=1200&auto=format&fit=crop',
  hike: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1200&auto=format&fit=crop',
  park: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=1200&auto=format&fit=crop',
  movie: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop',
  music: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1200&auto=format&fit=crop',
  gallery: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=1200&auto=format&fit=crop',
  stargazing: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1200&auto=format&fit=crop',
  shopping: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop',
  surprise: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop',
};

export function coverImageFor(activity: ActivityType): string {
  return coverImagesByActivity[activity] ?? coverImagesByActivity.surprise!;
}

-- Seeds the global bucket-list catalog with the app's existing curated ideas.
-- Safe to re-run: clears and re-inserts by title.

delete from public.bucket_items;

insert into public.bucket_items (title, description, category, image, layout, featured, suggested_activity)
values
  (
    'Cliffs Edge Sunset',
    'A private four-course meal as the sun dips below the horizon.',
    'Fine Dining',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop',
    'large',
    false,
    'dinner'
  ),
  (
    'Artisan Pottery',
    null,
    'Creative',
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop',
    'standard',
    false,
    'surprise'
  ),
  (
    'Secret Fern Hike',
    null,
    'Outdoors',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800&auto=format&fit=crop',
    'standard',
    false,
    'hike'
  ),
  (
    'Midnight Cabin Retreat',
    null,
    'Staycation',
    'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?q=80&w=1200&auto=format&fit=crop',
    'wide',
    true,
    'stargazing'
  ),
  (
    'Gallery Night',
    null,
    'Creative',
    'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800&auto=format&fit=crop',
    'standard',
    false,
    'gallery'
  ),
  (
    'Vineyard Dusk',
    null,
    'Fine Dining',
    'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800&auto=format&fit=crop',
    'standard',
    false,
    'drinks'
  );

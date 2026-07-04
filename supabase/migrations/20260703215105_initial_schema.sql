-- Twilight & Ember ("Our Journey") initial schema
-- Couples share a "journey"; dates and stops belong to a journey, not a single user,
-- so a future "invite your partner" feature only needs to add a journey_members row.

create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------------------

create type public.activity_type as enum (
  'breakfast', 'brunch', 'dinner', 'drinks', 'coffee', 'dessert',
  'walk', 'hike', 'park', 'movie', 'music', 'gallery',
  'stargazing', 'shopping', 'surprise'
);

create type public.bucket_category as enum (
  'Outdoors', 'Creative', 'Fine Dining', 'Staycation'
);

create type public.bucket_layout as enum ('large', 'standard', 'wide');

create type public.journey_role as enum ('owner', 'member');

-- Profiles ----------------------------------------------------------------
-- One row per auth user, created automatically on sign-up (see trigger below).

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Journeys ------------------------------------------------------------------
-- A "journey" is the shared space a couple plans dates within.

create table public.journeys (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Our Journey',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.journey_members (
  journey_id uuid not null references public.journeys (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.journey_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (journey_id, profile_id)
);

-- Helper used by RLS policies below. SECURITY DEFINER + a dedicated function
-- avoids the infinite-recursion problem you get from a journey_members RLS
-- policy that queries journey_members directly.
create function public.is_journey_member(target_journey_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.journey_members
    where journey_id = target_journey_id
      and profile_id = auth.uid()
  );
$$;

alter table public.journeys enable row level security;
alter table public.journey_members enable row level security;

create policy "journeys are viewable by members"
  on public.journeys for select
  using (public.is_journey_member(id));

create policy "authenticated users can create a journey"
  on public.journeys for insert
  with check (auth.uid() = created_by);

create policy "members can update their journey"
  on public.journeys for update
  using (public.is_journey_member(id));

create policy "journey members are viewable by fellow members"
  on public.journey_members for select
  using (public.is_journey_member(journey_id));

create policy "users can add themselves to a journey"
  on public.journey_members for insert
  with check (profile_id = auth.uid());

create policy "members can remove themselves from a journey"
  on public.journey_members for delete
  using (profile_id = auth.uid());

-- Date entries ----------------------------------------------------------
-- Mirrors the app's `DateEntry` type (src/types/index.ts).

create table public.date_entries (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  title text not null,
  subtitle text,
  date date not null,
  cover_image text,
  is_draft boolean not null default false,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index date_entries_journey_id_idx on public.date_entries (journey_id);

alter table public.date_entries enable row level security;

create policy "date entries are visible to journey members"
  on public.date_entries for select
  using (public.is_journey_member(journey_id));

create policy "journey members can create date entries"
  on public.date_entries for insert
  with check (public.is_journey_member(journey_id));

create policy "journey members can update date entries"
  on public.date_entries for update
  using (public.is_journey_member(journey_id));

create policy "journey members can delete date entries"
  on public.date_entries for delete
  using (public.is_journey_member(journey_id));

-- Stops -------------------------------------------------------------------
-- Mirrors the app's `Stop` type. Ordered by `time` within a date entry.

create table public.stops (
  id uuid primary key default gen_random_uuid(),
  date_entry_id uuid not null references public.date_entries (id) on delete cascade,
  time time not null,
  title text not null,
  description text,
  activity public.activity_type not null,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  completed boolean not null default false,
  duration_label text,
  rating numeric(2, 1),
  created_at timestamptz not null default now()
);

create index stops_date_entry_id_idx on public.stops (date_entry_id);

alter table public.stops enable row level security;

create policy "stops are visible to journey members"
  on public.stops for select
  using (
    exists (
      select 1 from public.date_entries
      where date_entries.id = stops.date_entry_id
        and public.is_journey_member(date_entries.journey_id)
    )
  );

create policy "journey members can create stops"
  on public.stops for insert
  with check (
    exists (
      select 1 from public.date_entries
      where date_entries.id = stops.date_entry_id
        and public.is_journey_member(date_entries.journey_id)
    )
  );

create policy "journey members can update stops"
  on public.stops for update
  using (
    exists (
      select 1 from public.date_entries
      where date_entries.id = stops.date_entry_id
        and public.is_journey_member(date_entries.journey_id)
    )
  );

create policy "journey members can delete stops"
  on public.stops for delete
  using (
    exists (
      select 1 from public.date_entries
      where date_entries.id = stops.date_entry_id
        and public.is_journey_member(date_entries.journey_id)
    )
  );

-- Bucket list items -------------------------------------------------------
-- Global curated inspiration content (not owned by any single journey).
-- Writable only via the service role (e.g. an admin dashboard/script), not
-- by regular app users.

create table public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category public.bucket_category not null,
  image text,
  featured boolean not null default false,
  layout public.bucket_layout not null,
  suggested_activity public.activity_type not null,
  created_at timestamptz not null default now()
);

alter table public.bucket_items enable row level security;

create policy "bucket items are viewable by any authenticated user"
  on public.bucket_items for select
  to authenticated
  using (true);

-- updated_at maintenance ---------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_date_entries_updated_at
  before update on public.date_entries
  for each row execute procedure public.set_updated_at();

-- Anniversary date lives on journeys (relationship-level, shared by both partners).
alter table public.journeys
  add column anniversary_date date;

-- Notification preferences — one row per profile (each partner's device/alerts independent).
create table public.notification_preferences (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  new_date_plans boolean not null default true,
  anniversary_reminders boolean not null default true,
  reminder_24h boolean not null default true,
  reminder_1h boolean not null default false,
  bucket_list_updates boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;

create policy "notification preferences are viewable by owner"
  on public.notification_preferences for select using (auth.uid() = profile_id);
create policy "notification preferences are insertable by owner"
  on public.notification_preferences for insert with check (auth.uid() = profile_id);
create policy "notification preferences are editable by owner"
  on public.notification_preferences for update using (auth.uid() = profile_id);

create trigger set_notification_preferences_updated_at
  before update on public.notification_preferences
  for each row execute procedure public.set_updated_at();

-- Extend the existing sign-up trigger to also seed a default preferences row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_journey_id uuid;
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'display_name');

  insert into public.journeys (name, created_by)
  values ('Our Journey', new.id)
  returning id into new_journey_id;

  insert into public.journey_members (journey_id, profile_id, role)
  values (new_journey_id, new.id, 'owner');

  insert into public.notification_preferences (profile_id)
  values (new.id);

  return new;
end;
$$;

-- Bucket list checkoff — per-journey join against the global bucket_items catalog.
-- "Checked off" = row presence (not a boolean column); unchecking deletes the row.
create table public.journey_bucket_status (
  journey_id uuid not null references public.journeys (id) on delete cascade,
  bucket_item_id uuid not null references public.bucket_items (id) on delete cascade,
  checked_by uuid references public.profiles (id) on delete set null,
  checked_at timestamptz not null default now(),
  primary key (journey_id, bucket_item_id)
);

alter table public.journey_bucket_status enable row level security;

create policy "bucket status is visible to journey members"
  on public.journey_bucket_status for select using (public.is_journey_member(journey_id));
create policy "journey members can check off bucket items"
  on public.journey_bucket_status for insert with check (public.is_journey_member(journey_id));
create policy "journey members can uncheck bucket items"
  on public.journey_bucket_status for delete using (public.is_journey_member(journey_id));

-- Realtime for the two new/changed live-updating surfaces (journeys wasn't
-- previously in the publication; needed now so both partners see anniversary edits live).
alter publication supabase_realtime add table
  public.journey_bucket_status,
  public.journeys;

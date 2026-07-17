-- Date photos ---------------------------------------------------------------
-- One-to-many photos per date_entry, uploaded by journey members to build a
-- gallery for a past memory. Unlike date_entries.cover_image (a single text
-- column), this is a proper child table since a date can have many photos —
-- same shape as `stops`.

create table public.date_photos (
  id uuid primary key default gen_random_uuid(),
  date_entry_id uuid not null references public.date_entries (id) on delete cascade,
  storage_path text not null,
  url text not null,
  caption text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index date_photos_date_entry_id_idx on public.date_photos (date_entry_id);

alter table public.date_photos enable row level security;

create policy "date photos are visible to journey members"
  on public.date_photos for select
  using (
    exists (
      select 1 from public.date_entries
      where date_entries.id = date_photos.date_entry_id
        and public.is_journey_member(date_entries.journey_id)
    )
  );

create policy "journey members can add date photos"
  on public.date_photos for insert
  with check (
    exists (
      select 1 from public.date_entries
      where date_entries.id = date_photos.date_entry_id
        and public.is_journey_member(date_entries.journey_id)
    )
  );

create policy "journey members can delete date photos"
  on public.date_photos for delete
  using (
    exists (
      select 1 from public.date_entries
      where date_entries.id = date_photos.date_entry_id
        and public.is_journey_member(date_entries.journey_id)
    )
  );

-- Storage bucket for the photos themselves ----------------------------------
-- date-photos/<journey_id>/<date_entry_id>/<filename> — any member of that
-- journey may read/write, same is_journey_member() pattern as date-covers.
-- All four policy types included per authenticated role, matching the fix
-- applied in fix_storage_policies.sql (a missing select policy previously
-- broke upsert's existence check / read-back on the date-covers bucket).

insert into storage.buckets (id, name, public)
values ('date-photos', 'date-photos', true)
on conflict (id) do nothing;

create policy "journey member can select date photo"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'date-photos'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can upload date photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'date-photos'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can update date photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'date-photos'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can delete date photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'date-photos'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

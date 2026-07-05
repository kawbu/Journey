-- Public Storage buckets for user-uploaded images: profile avatars and
-- per-date cover photos. Public here mirrors the trust model already used
-- for the anon key elsewhere in this app — a plain public URL is stored in
-- profiles.avatar_url / date_entries.cover_image, same as the hardcoded
-- stock-photo URLs used today. Reads are open (bucket-level public flag);
-- writes are gated by RLS policies below, keyed off the object's path.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('date-covers', 'date-covers', true)
on conflict (id) do nothing;

-- avatars/<user_id>/<filename> — a user may only write inside a folder
-- named after their own auth uid.
create policy "avatar owner can upload"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner can update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatar owner can delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- date-covers/<journey_id>/<filename> — any member of that journey may
-- write, reusing the same is_journey_member() helper the rest of the
-- schema's RLS policies rely on.
create policy "journey member can upload date cover"
  on storage.objects for insert
  with check (
    bucket_id = 'date-covers'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can update date cover"
  on storage.objects for update
  using (
    bucket_id = 'date-covers'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can delete date cover"
  on storage.objects for delete
  using (
    bucket_id = 'date-covers'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

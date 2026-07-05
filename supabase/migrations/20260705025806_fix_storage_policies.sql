-- The original storage.objects policies (storage_buckets.sql) omitted an
-- explicit `to authenticated` role restriction and a `select` policy.
-- Uploads were failing with "new row violates row-level security policy" —
-- recreating the policies matching Supabase's documented pattern exactly
-- (role-scoped, plus a select policy so upsert's existence check and the
-- dashboard/SDK can read back objects the same user just wrote).

drop policy if exists "avatar owner can upload" on storage.objects;
drop policy if exists "avatar owner can update" on storage.objects;
drop policy if exists "avatar owner can delete" on storage.objects;
drop policy if exists "journey member can upload date cover" on storage.objects;
drop policy if exists "journey member can update date cover" on storage.objects;
drop policy if exists "journey member can delete date cover" on storage.objects;

create policy "avatar owner can select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "avatar owner can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "avatar owner can update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "avatar owner can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "journey member can select date cover"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'date-covers'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can upload date cover"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'date-covers'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can update date cover"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'date-covers'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

create policy "journey member can delete date cover"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'date-covers'
    and public.is_journey_member(((storage.foldername(name))[1])::uuid)
  );

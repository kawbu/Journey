-- Two fixes:
--
-- 1. `profiles` could previously only be selected by its own owner. That
--    silently nulled out the partner's row whenever the client joined
--    journey_members -> profiles to show "who am I sharing this journey
--    with" — RLS just dropped the row instead of erroring, which looked
--    like a missing-data bug rather than a permissions one.
--
-- 2. Enable Postgres change broadcasts (Realtime) on the tables the app
--    needs to live-update on: a new partner joining, and dates/stops either
--    partner adds or edits.

create policy "profiles are viewable by journey co-members"
  on public.profiles for select
  using (
    exists (
      select 1
      from public.journey_members mine
      join public.journey_members theirs on theirs.journey_id = mine.journey_id
      where mine.profile_id = auth.uid()
        and theirs.profile_id = profiles.id
    )
  );

alter publication supabase_realtime add table
  public.journey_members,
  public.date_entries,
  public.stops;

-- Extend the new-user trigger to also create a solo journey for the new
-- account, with them as owner. This runs at auth.users insert time
-- (SECURITY DEFINER, bypassing RLS), so it works regardless of whether
-- email confirmation is required before the client gets a live session —
-- the journey already exists by the time the user is authenticated.

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

  return new;
end;
$$;

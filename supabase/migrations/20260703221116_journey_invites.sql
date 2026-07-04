-- Partner invite flow: a journey is capped at exactly two members (a couple).
-- Inviting a partner works via a short-lived, single-use code:
--   1. create_invite() lets a solo member generate a code for their journey.
--   2. redeem_invite(code) lets the invitee join that journey, moving any of
--      their own solo-journey dates over and retiring their old journey.
-- Both are SECURITY DEFINER RPCs so the client never needs (or gets) direct
-- insert access to someone else's journey_members row.

create table public.journey_invites (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  code text not null unique,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  redeemed_by uuid references public.profiles (id) on delete set null,
  redeemed_at timestamptz
);

create index journey_invites_journey_id_idx on public.journey_invites (journey_id);

alter table public.journey_invites enable row level security;

create policy "journey members can view their journey's invites"
  on public.journey_invites for select
  using (public.is_journey_member(journey_id));

-- Enforce the two-person cap at the database level, not just in application code.
create function public.check_journey_member_limit()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.journey_members where journey_id = new.journey_id) >= 2 then
    raise exception 'A journey can only have two members.';
  end if;
  return new;
end;
$$;

create trigger enforce_journey_member_limit
  before insert on public.journey_members
  for each row execute procedure public.check_journey_member_limit();

-- Generates (or returns the still-valid existing) invite code for the
-- caller's journey. Fails if the caller isn't solo (already partnered) or
-- doesn't belong to a journey at all.
create function public.create_invite()
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  caller_journey_id uuid;
  member_count int;
  existing_code text;
  new_code text;
begin
  select journey_id into caller_journey_id
  from public.journey_members
  where profile_id = auth.uid()
  limit 1;

  if caller_journey_id is null then
    raise exception 'You are not part of a journey yet.';
  end if;

  select count(*) into member_count
  from public.journey_members
  where journey_id = caller_journey_id;

  if member_count >= 2 then
    raise exception 'Your journey is already shared with a partner.';
  end if;

  select code into existing_code
  from public.journey_invites
  where journey_id = caller_journey_id
    and redeemed_by is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if existing_code is not null then
    return existing_code;
  end if;

  -- 6-character, unambiguous, human-shareable code.
  new_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));

  insert into public.journey_invites (journey_id, code, created_by)
  values (caller_journey_id, new_code, auth.uid());

  return new_code;
end;
$$;

-- Joins the caller into the journey behind `p_code`, migrating any date
-- entries from their old (solo) journey and retiring it.
create function public.redeem_invite(p_code text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  invite record;
  caller_journey_id uuid;
  caller_member_count int;
  target_member_count int;
begin
  select * into invite
  from public.journey_invites
  where code = upper(p_code)
  for update;

  if invite is null then
    raise exception 'Invite code not found.';
  end if;

  if invite.redeemed_by is not null then
    raise exception 'This invite has already been used.';
  end if;

  if invite.expires_at <= now() then
    raise exception 'This invite has expired.';
  end if;

  if invite.created_by = auth.uid() then
    raise exception 'You cannot redeem your own invite.';
  end if;

  select journey_id into caller_journey_id
  from public.journey_members
  where profile_id = auth.uid()
  limit 1;

  if caller_journey_id is null then
    raise exception 'You are not part of a journey yet.';
  end if;

  select count(*) into caller_member_count
  from public.journey_members
  where journey_id = caller_journey_id;

  if caller_member_count > 1 then
    raise exception 'You are already sharing a journey with someone.';
  end if;

  select count(*) into target_member_count
  from public.journey_members
  where journey_id = invite.journey_id;

  if target_member_count >= 2 then
    raise exception 'That journey is already shared with a partner.';
  end if;

  -- Bring any dates the caller already planned solo along with them.
  update public.date_entries
  set journey_id = invite.journey_id
  where journey_id = caller_journey_id;

  delete from public.journey_members where profile_id = auth.uid();
  delete from public.journeys where id = caller_journey_id;

  insert into public.journey_members (journey_id, profile_id, role)
  values (invite.journey_id, auth.uid(), 'member');

  update public.journey_invites
  set redeemed_by = auth.uid(), redeemed_at = now()
  where id = invite.id;
end;
$$;

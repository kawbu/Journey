-- Profile picture support. No RLS change needed: existing policies on
-- profiles already let journey co-members read each other's row (see
-- journey_profiles_and_realtime.sql), and a user already updates their own
-- profile row under the existing self-update policy.
alter table public.profiles add column avatar_url text;

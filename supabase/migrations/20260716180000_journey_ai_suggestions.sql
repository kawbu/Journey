-- AI Concierge saved suggestions ---------------------------------------------
-- Ephemeral AI-generated date ideas the couple chose to keep. Distinct from
-- bucket_items (global, curated, admin-only-writable) — this is a personal,
-- journey-scoped table so regular users can insert into it directly.

create table public.journey_ai_suggestions (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.journeys (id) on delete cascade,
  title text not null,
  description text,
  suggested_activity public.activity_type not null,
  suggested_category public.bucket_category not null,
  saved_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index journey_ai_suggestions_journey_id_idx on public.journey_ai_suggestions (journey_id);

alter table public.journey_ai_suggestions enable row level security;

create policy "ai suggestions are visible to journey members"
  on public.journey_ai_suggestions for select
  using (public.is_journey_member(journey_id));

create policy "journey members can save ai suggestions"
  on public.journey_ai_suggestions for insert
  with check (public.is_journey_member(journey_id));

create policy "journey members can delete ai suggestions"
  on public.journey_ai_suggestions for delete
  using (public.is_journey_member(journey_id));

alter publication supabase_realtime add table public.journey_ai_suggestions;

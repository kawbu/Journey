-- Stop ordering ------------------------------------------------------------
-- Stops are now ordered by `order_index`, not `time`. `time` remains
-- editable display metadata only. Backfill preserves each date entry's
-- existing time-derived order as the initial explicit order.

alter table public.stops add column order_index integer not null default 0;

with ranked as (
  select id, row_number() over (
    partition by date_entry_id order by time, created_at
  ) - 1 as rn
  from public.stops
)
update public.stops
set order_index = ranked.rn
from ranked
where public.stops.id = ranked.id;

create index stops_date_entry_id_order_idx on public.stops (date_entry_id, order_index);

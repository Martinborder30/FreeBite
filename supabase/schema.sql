create table public.organizers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_email text,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references public.organizers(id) on delete restrict,
  title text not null,
  description text not null default '',
  starts_at timestamptz not null,
  location text not null,
  category text not null,
  has_food boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status text not null default 'interested'
    check (status in ('interested', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  constraint rsvps_one_per_user_and_event unique (user_id, event_id)
);

create index events_starts_at_idx on public.events (starts_at);
create index events_category_idx on public.events (category);
create index rsvps_user_id_idx on public.rsvps (user_id);

alter table public.organizers enable row level security;
alter table public.events enable row level security;
alter table public.rsvps enable row level security;

grant usage on schema public to anon, authenticated;
grant select (id, name) on public.organizers to anon, authenticated;
grant select on public.events to anon, authenticated;
grant select on public.rsvps to authenticated;
grant insert (user_id, event_id, status) on public.rsvps to authenticated;
grant update (status) on public.rsvps to authenticated;

create policy "Anyone can read organizers"
  on public.organizers for select
  to anon, authenticated
  using (true);

create policy "Anyone can read events"
  on public.events for select
  to anon, authenticated
  using (true);

create policy "Users can read their own RSVPs"
  on public.rsvps for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can express interest within 14 days"
  on public.rsvps for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'interested'
    and exists (
      select 1
      from public.events
      where events.id = event_id
        and events.starts_at > now()
        and events.starts_at <= now() + interval '14 days'
    )
  );

create policy "Users can update their own RSVPs"
  on public.rsvps for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and (
      status = 'cancelled'
      or (
        status = 'interested'
        and exists (
          select 1
          from public.events
          where events.id = event_id
            and events.starts_at > now()
            and events.starts_at <= now() + interval '14 days'
        )
      )
    )
  );

-- Organizer and event writes are intentionally restricted to the Supabase dashboard
-- until an authenticated organizer workflow is implemented.

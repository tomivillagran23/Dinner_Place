-- Migration v2: Multi-space support

-- Add name to couples (now called "spaces" conceptually)
alter table public.couples add column if not exists name text default 'Mi espacio';

-- New table: space_members (replaces profiles.couple_id for multi-space)
create table if not exists public.space_members (
  space_id uuid references public.couples(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (space_id, user_id)
);

-- Migrate existing data from profiles.couple_id → space_members
insert into public.space_members (space_id, user_id)
select couple_id, id from public.profiles
where couple_id is not null
on conflict do nothing;

-- RLS for space_members
alter table public.space_members enable row level security;

create policy "space_members_select" on public.space_members
  for select using (user_id = auth.uid());

create policy "space_members_insert" on public.space_members
  for insert with check (true);

create policy "space_members_delete" on public.space_members
  for delete using (user_id = auth.uid());

-- Update couples select policy to use space_members
drop policy if exists "couples_select" on public.couples;
create policy "couples_select" on public.couples
  for select using (
    id in (select space_id from public.space_members where user_id = auth.uid())
  );

-- Update restaurants policies to use space_members
drop policy if exists "restaurants_select" on public.restaurants;
create policy "restaurants_select" on public.restaurants
  for select using (
    couple_id in (select space_id from public.space_members where user_id = auth.uid())
  );

drop policy if exists "restaurants_insert" on public.restaurants;
create policy "restaurants_insert" on public.restaurants
  for insert with check (
    couple_id in (select space_id from public.space_members where user_id = auth.uid())
  );

drop policy if exists "restaurants_update" on public.restaurants;
create policy "restaurants_update" on public.restaurants
  for update using (
    couple_id in (select space_id from public.space_members where user_id = auth.uid())
  );

drop policy if exists "restaurants_delete" on public.restaurants;
create policy "restaurants_delete" on public.restaurants
  for delete using (
    couple_id in (select space_id from public.space_members where user_id = auth.uid())
  );

-- Update tags policies to use space_members
drop policy if exists "tags_select" on public.tags;
create policy "tags_select" on public.tags
  for select using (
    couple_id in (select space_id from public.space_members where user_id = auth.uid())
  );

drop policy if exists "tags_insert" on public.tags;
create policy "tags_insert" on public.tags
  for insert with check (
    couple_id in (select space_id from public.space_members where user_id = auth.uid())
  );

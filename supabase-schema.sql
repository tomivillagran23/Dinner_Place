-- ForkDate Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- COUPLES
create table if not exists public.couples (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  invite_code text unique not null
);

-- PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  couple_id uuid references public.couples(id) on delete set null,
  created_at timestamptz default now()
);

-- TAGS
create table if not exists public.tags (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  couple_id uuid references public.couples(id) on delete cascade,
  color text not null default '#FF4D4D',
  created_at timestamptz default now()
);

-- RESTAURANTS
create table if not exists public.restaurants (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  couple_id uuid references public.couples(id) on delete cascade,
  added_by uuid references public.profiles(id) on delete set null,
  name text not null,
  address text,
  google_maps_url text,
  latitude float,
  longitude float,
  photo_urls text[] default '{}',
  price_level int check (price_level between 1 and 3),
  opening_hours text,
  rating int check (rating between 1 and 5),
  notes text,
  visited boolean default false,
  neighborhood text,
  cuisine_type text
);

-- RESTAURANT_TAGS (junction)
create table if not exists public.restaurant_tags (
  restaurant_id uuid references public.restaurants(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (restaurant_id, tag_id)
);

-- ────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────

alter table public.couples enable row level security;
alter table public.profiles enable row level security;
alter table public.tags enable row level security;
alter table public.restaurants enable row level security;
alter table public.restaurant_tags enable row level security;

-- PROFILES: user can only see and edit their own profile
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- COUPLES: user can view their own couple
create policy "couples_select" on public.couples for select
  using (
    id in (select couple_id from public.profiles where id = auth.uid())
  );
create policy "couples_insert" on public.couples for insert with check (true);

-- TAGS: user can access tags in their couple
create policy "tags_select" on public.tags for select
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );
create policy "tags_insert" on public.tags for insert
  with check (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );
create policy "tags_update" on public.tags for update
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );
create policy "tags_delete" on public.tags for delete
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );

-- RESTAURANTS: user can access restaurants in their couple
create policy "restaurants_select" on public.restaurants for select
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );
create policy "restaurants_insert" on public.restaurants for insert
  with check (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );
create policy "restaurants_update" on public.restaurants for update
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );
create policy "restaurants_delete" on public.restaurants for delete
  using (
    couple_id in (select couple_id from public.profiles where id = auth.uid())
  );

-- RESTAURANT_TAGS
create policy "restaurant_tags_select" on public.restaurant_tags for select
  using (
    restaurant_id in (
      select id from public.restaurants
      where couple_id in (select couple_id from public.profiles where id = auth.uid())
    )
  );
create policy "restaurant_tags_insert" on public.restaurant_tags for insert
  with check (
    restaurant_id in (
      select id from public.restaurants
      where couple_id in (select couple_id from public.profiles where id = auth.uid())
    )
  );
create policy "restaurant_tags_delete" on public.restaurant_tags for delete
  using (
    restaurant_id in (
      select id from public.restaurants
      where couple_id in (select couple_id from public.profiles where id = auth.uid())
    )
  );

-- ────────────────────────────────────────────────
-- TRIGGER: auto-create profile on signup
-- ────────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

    alter table public.restaurants                                                                                                                                                                            
    add column if not exists pin_color text default '#FF4D4D';        

-- ────────────────────────────────────────────────
-- STORAGE: restaurant-photos bucket
-- ────────────────────────────────────────────────
-- Run these in Supabase Dashboard > Storage:
-- 1. Create bucket: "restaurant-photos" (public)
-- 2. Add policy: authenticated users can upload

-- Reelist Database Schema for Supabase
-- Tables: watchlist, ratings, reactions
-- Views: rating_stats, reaction_counts

create table if not exists public.watchlist (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null check (tmdb_id > 0),
  created_at timestamptz not null default now(),
  primary key (user_id, media_type, tmdb_id)
);

create table if not exists public.ratings (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null check (tmdb_id > 0),
  score smallint not null check (score between 1 and 10),
  updated_at timestamptz not null default now(),
  primary key (user_id, media_type, tmdb_id)
);

create table if not exists public.reactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null check (tmdb_id > 0),
  kind text not null check (kind in ('thumbsUp','heart','clap','lightbulb','smile','starFace')),
  created_at timestamptz not null default now(),
  primary key (user_id, media_type, tmdb_id, kind)
);

alter table public.watchlist enable row level security;
alter table public.ratings   enable row level security;
alter table public.reactions enable row level security;

-- Row Level Security Policies: Authenticated users manage only their own records
drop policy if exists "own watchlist" on public.watchlist;
create policy "own watchlist" on public.watchlist for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own ratings" on public.ratings;
create policy "own ratings" on public.ratings for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy if exists "own reactions" on public.reactions;
create policy "own reactions" on public.reactions for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Public Aggregates Only (No user_id exposed)
create or replace view public.rating_stats as
  select
    media_type,
    tmdb_id,
    round(avg(score)::numeric, 1) as avg_score,
    count(*)::int as votes
  from public.ratings
  group by media_type, tmdb_id;

create or replace view public.reaction_counts as
  select
    media_type,
    tmdb_id,
    kind,
    count(*)::int as total
  from public.reactions
  group by media_type, tmdb_id, kind;

grant select on public.rating_stats to anon, authenticated;
grant select on public.reaction_counts to anon, authenticated;

-- ============================================================================
-- Phase 1: Profiles, User Reviews, Helpful Votes, Reports, Custom Lists
-- ============================================================================

-- 1. Profiles (public user profiles linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique check (username ~* '^[a-zA-Z0-9_]{3,20}$'),
  avatar_url text,
  bio text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by everyone" on public.profiles;
create policy "profiles are viewable by everyone" on public.profiles
  for select to anon, authenticated
  using (true);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile" on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 2. Reviews (User reviews with rating, headline, content, spoiler flag)
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null check (tmdb_id > 0),
  rating smallint check (rating between 1 and 10),
  headline text not null check (char_length(headline) between 1 and 120),
  content text not null check (char_length(content) between 1 and 10000),
  is_spoiler boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, media_type, tmdb_id)
);

alter table public.reviews enable row level security;

drop policy if exists "reviews are viewable by everyone" on public.reviews;
create policy "reviews are viewable by everyone" on public.reviews
  for select to anon, authenticated
  using (true);

drop policy if exists "users can insert own reviews" on public.reviews;
create policy "users can insert own reviews" on public.reviews
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own reviews" on public.reviews;
create policy "users can update own reviews" on public.reviews
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own reviews" on public.reviews;
create policy "users can delete own reviews" on public.reviews
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 3. Review Votes (Helpful / Unhelpful)
create table if not exists public.review_votes (
  review_id uuid not null references public.reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  helpful boolean not null,
  created_at timestamptz not null default now(),
  primary key (review_id, user_id)
);

alter table public.review_votes enable row level security;

drop policy if exists "users can see own review votes" on public.review_votes;
create policy "users can see own review votes" on public.review_votes
  for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users can insert own review votes" on public.review_votes;
create policy "users can insert own review votes" on public.review_votes
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own review votes" on public.review_votes;
create policy "users can update own review votes" on public.review_votes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own review votes" on public.review_votes;
create policy "users can delete own review votes" on public.review_votes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Review Vote Counts View (aggregates helpful vs not_helpful)
create or replace view public.review_vote_counts as
  select review_id,
         count(*) filter (where helpful)::int as helpful,
         count(*) filter (where not helpful)::int as not_helpful
  from public.review_votes
  group by review_id;

grant select on public.review_vote_counts to anon, authenticated;

-- 4. Review Reports (Flag inappropriate content for moderation)
create table if not exists public.review_reports (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 500),
  created_at timestamptz not null default now(),
  unique (review_id, reporter_user_id)
);

alter table public.review_reports enable row level security;

drop policy if exists "users can submit review reports" on public.review_reports;
create policy "users can submit review reports" on public.review_reports
  for insert to authenticated
  with check ((select auth.uid()) = reporter_user_id);

-- 5. Custom Lists & List Items
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  description text default '',
  is_private boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  media_type text not null check (media_type in ('movie','tv')),
  tmdb_id integer not null check (tmdb_id > 0),
  notes text default '',
  order_index integer not null default 0,
  added_at timestamptz not null default now(),
  unique (list_id, media_type, tmdb_id)
);

alter table public.lists enable row level security;
alter table public.list_items enable row level security;

drop policy if exists "viewable lists" on public.lists;
create policy "viewable lists" on public.lists
  for select to anon, authenticated
  using (not is_private or (select auth.uid()) = user_id);

drop policy if exists "users can insert own lists" on public.lists;
create policy "users can insert own lists" on public.lists
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can update own lists" on public.lists;
create policy "users can update own lists" on public.lists
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "users can delete own lists" on public.lists;
create policy "users can delete own lists" on public.lists
  for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "viewable list items" on public.list_items;
create policy "viewable list items" on public.list_items
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_items.list_id
      and (not l.is_private or (select auth.uid()) = l.user_id)
    )
  );

drop policy if exists "users can insert own list items" on public.list_items;
create policy "users can insert own list items" on public.list_items
  for insert to authenticated
  with check (
    exists (
      select 1 from public.lists l
      where l.id = list_items.list_id
      and (select auth.uid()) = l.user_id
    )
  );

drop policy if exists "users can update own list items" on public.list_items;
create policy "users can update own list items" on public.list_items
  for update to authenticated
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_items.list_id
      and (select auth.uid()) = l.user_id
    )
  )
  with check (
    exists (
      select 1 from public.lists l
      where l.id = list_items.list_id
      and (select auth.uid()) = l.user_id
    )
  );

drop policy if exists "users can delete own list items" on public.list_items;
create policy "users can delete own list items" on public.list_items
  for delete to authenticated
  using (
    exists (
      select 1 from public.lists l
      where l.id = list_items.list_id
      and (select auth.uid()) = l.user_id
    )
  );

-- Grants
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;

grant select, insert, update, delete on public.reviews to authenticated;
grant select on public.reviews to anon;

grant select, insert, update, delete on public.review_votes to authenticated;

grant insert on public.review_reports to authenticated;

grant select, insert, update, delete on public.lists to authenticated;
grant select on public.lists to anon;

grant select, insert, update, delete on public.list_items to authenticated;
grant select on public.list_items to anon;

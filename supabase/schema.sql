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

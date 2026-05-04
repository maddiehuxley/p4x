-- P4X v0.2 schema additions: portfolio wallets, watchlists, price alerts
-- Run this in the Supabase SQL editor (or via the CLI migrations system)

-- =========================================================================
-- WALLETS: addresses a user has added to their portfolio
-- =========================================================================
create table if not exists public.wallets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  address     text not null,
  chain       text not null check (chain in ('evm', 'solana', 'bitcoin')),
  label       text,
  created_at  timestamptz not null default now(),
  unique (user_id, address, chain)
);

create index if not exists wallets_user_id_idx on public.wallets(user_id);

alter table public.wallets enable row level security;

create policy "Users read own wallets"
  on public.wallets for select
  using (auth.uid() = user_id);

create policy "Users insert own wallets"
  on public.wallets for insert
  with check (auth.uid() = user_id);

create policy "Users delete own wallets"
  on public.wallets for delete
  using (auth.uid() = user_id);

create policy "Users update own wallets"
  on public.wallets for update
  using (auth.uid() = user_id);

-- =========================================================================
-- WATCHLIST: tokens a user wants to follow
-- =========================================================================
create table if not exists public.watchlist_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  coingecko_id  text not null,
  symbol        text not null,
  name          text not null,
  added_at      timestamptz not null default now(),
  unique (user_id, coingecko_id)
);

create index if not exists watchlist_user_id_idx on public.watchlist_items(user_id);

alter table public.watchlist_items enable row level security;

create policy "Users read own watchlist"
  on public.watchlist_items for select
  using (auth.uid() = user_id);

create policy "Users insert own watchlist"
  on public.watchlist_items for insert
  with check (auth.uid() = user_id);

create policy "Users delete own watchlist"
  on public.watchlist_items for delete
  using (auth.uid() = user_id);

-- =========================================================================
-- PRICE ALERTS: triggered when a token crosses a threshold
-- =========================================================================
create table if not exists public.price_alerts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  coingecko_id      text not null,
  symbol            text not null,
  direction         text not null check (direction in ('above', 'below')),
  target_price_usd  numeric not null check (target_price_usd > 0),
  triggered         boolean not null default false,
  triggered_at      timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists price_alerts_user_id_idx on public.price_alerts(user_id);
create index if not exists price_alerts_active_idx on public.price_alerts(coingecko_id) where triggered = false;

alter table public.price_alerts enable row level security;

create policy "Users read own alerts"
  on public.price_alerts for select
  using (auth.uid() = user_id);

create policy "Users insert own alerts"
  on public.price_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users update own alerts"
  on public.price_alerts for update
  using (auth.uid() = user_id);

create policy "Users delete own alerts"
  on public.price_alerts for delete
  using (auth.uid() = user_id);

# P4X v0.2 — Merge Drop

This package merges cleanly into your current repo. Three existing files get small surgical changes; everything else is new.

## What changes

**Overwrites (3 files, all intentional minor changes):**
- `components/Navbar.tsx` — 1 line removed, 2 added (Wallet "Soon" → live Portfolio + Watchlist)
- `app/wallet/page.tsx` — replaced with a 6-line redirect to `/portfolio`
- `app/dashboard/page.tsx` — 2 of 3 ComingSoon cards swapped for LiveCards linking to /portfolio and /watchlist

**New files (19):**
- `app/portfolio/page.tsx`, `app/watchlist/page.tsx` — the two new routes
- `app/api/portfolio/wallets/route.ts`, `app/api/portfolio/snapshot/route.ts` — portfolio data APIs
- `app/api/watchlist/route.ts`, `app/api/watchlist/alerts/route.ts` — watchlist APIs
- `components/portfolio/*` (4 files), `components/watchlist/WatchlistClient.tsx`, `components/LiveCard.tsx`
- `lib/chains/*` (5 files: registry, evm, solana, bitcoin, portfolio aggregator)
- `types/portfolio.ts`
- `supabase/migration-v0.2.sql`

**Not touched (preserved):**
- `lib/supabase/server.ts` — your existing one uses the newer getAll/setAll API; my code is compatible with it
- `lib/supabase/client.ts`, `middleware.ts` — untouched
- All your hotfix work (`/api/coingecko/*`, ticker components) — untouched
- All other components, pages, and styles

## Deploy steps

### 1. Unzip into your repo root

The folder structure mirrors your repo exactly. From the root of `p4x`:

```bash
unzip p4x-v0.2-merge.zip
cp -r p4x-v0.2-merge/* .
rm -rf p4x-v0.2-merge
```

Or just drag the contents over in your file explorer — every path lines up.

### 2. Set Vercel environment variables

In Vercel → your project → Settings → Environment Variables, add:

```
ALCHEMY_API_KEY=...
HELIUS_API_KEY=...
```

Your existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are already set and used.

**Where to get the keys (free tiers, ~5 min):**
- Alchemy: https://www.alchemy.com → sign up → create app on Ethereum mainnet → copy API key (works for all 5 EVM chains)
- Helius: https://helius.dev → sign up → copy API key from dashboard

For local dev, also add them to `.env.local`.

### 3. Run the SQL migration

Supabase Dashboard → SQL Editor → New query → paste contents of `supabase/migration-v0.2.sql` → Run.

This creates 3 tables (`wallets`, `watchlist_items`, `price_alerts`) with row-level security so each user can only access their own rows.

### 4. Commit and push

```bash
git add .
git commit -m "feat: portfolio viewer + watchlist (v0.2)"
git push
```

Vercel auto-redeploys.

### 5. Smoke test on production

1. Visit `/portfolio` while logged in
2. Click "Add Wallet" and paste any public ETH/SOL/BTC address — try `0x28C6c06298d514Db089934071355E5743bf21d60` (Binance hot wallet, lots of tokens for testing)
3. Confirm balances populate within ~2-3 seconds
4. Visit `/watchlist`, search "bitcoin", add it
5. Visit `/dashboard` — the 3 cards should now show 2 live (Portfolio, Watchlist) and 1 soon (Trading)
6. Visit `/wallet` — should redirect cleanly to `/portfolio`

## Notes

- **Free-tier APIs cover thousands of users.** You'll hit billing concerns around 5K+ DAU; before then, both Alchemy and Helius free tiers are generous.
- **The watchlist's CoinGecko search** uses CoinGecko's `/search` endpoint directly (CORS-friendly, unlike `/coins/markets` which the hotfix proxied). If you want to centralize, add another route in `/api/coingecko/search`, but it's not required.
- **Price alert delivery is not in v0.2.** The schema and CRUD are there; the cron job that polls prices and notifies users is a future patch.
- **Design system match.** All new components use your CSS variables (`var(--cyan)`, `var(--font-display)`, etc.) and existing utility classes (`.glass`, `.btn-cyan`, `.btn-outline`, `.input-p4x`, `.badge-soon`, `.badge-live`, `.market-row`, `.shimmer-skeleton`). No raw Tailwind colors that would clash.

## Rollback

If something goes wrong:

```bash
git revert HEAD
git push
```

The 3 overwritten files can be restored from your git history. The new files can be deleted without affecting anything else.

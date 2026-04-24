# P4X — Paracord Exchange

A transparent, full-reserve cryptocurrency exchange. Built as a direct answer to the FTX collapse.

## Tech
- **Next.js 14** (App Router)
- **Supabase** (auth + session management)
- **framer-motion** (animations)
- **lightweight-charts** (TradingView candlesticks)
- **CoinGecko API** (live prices, no key needed)
- **Tailwind CSS** + custom design tokens

## Design
Glacier cyan (`#00CFFF`) on deep navy (`#030a18`). Rajdhani display, JetBrains Mono for numbers, DM Sans for body. Frosted glass, aurora glow, animated sparkline ticker at bottom.

## Run Locally

```bash
npm install
cp .env.example .env.local
# Fill in your Supabase keys, then:
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this folder to GitHub (see instructions below)
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Framework: **Next.js** (auto-detected)
4. **Add environment variables** (required for auth, optional for public pages):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click Deploy

### Supabase setup
1. Create a free project at [supabase.com](https://supabase.com) — pick **Frankfurt (eu-central-1)** for EU/Czech users
2. Go to **Project Settings → API** → copy Project URL + anon key into Vercel env vars
3. In **Authentication → URL Configuration**, add your Vercel URL:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/auth/callback`
4. Optional: under **Authentication → Providers → Email**, disable "Confirm email" for quicker signup during dev

## Pushing to GitHub

```bash
cd p4x
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/p4x.git
git push -u origin main
```

## Pages

| Route | What |
|-------|------|
| `/` | Hero + principles + live market preview |
| `/markets` | Full table + candlestick chart |
| `/dashboard` | Protected (requires login) |
| `/wallet` | Coming soon |
| `/trade` | Coming soon |
| `/auth/login` · `/auth/signup` | Auth |

## Works without Supabase
Public pages (`/`, `/markets`, `/wallet`, `/trade`) render fine even without env vars. Auth pages will show a "not configured" message.

## Principles baked in
- **Full Reserve** — no fractional custody
- **Open Source** matching engine (when built)
- **Proof of Reserves** — cryptographic, not just promised
- **Zero Commingling** — customer funds ≠ operational funds, architecturally

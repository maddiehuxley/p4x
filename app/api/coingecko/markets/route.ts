import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for CoinGecko's /coins/markets endpoint.
// Avoids browser CORS issues. Caches at the edge so we stay
// well under CoinGecko's free-tier rate limits.
//
// Returns the upstream JSON unchanged — components can swap
// the URL and nothing else changes about the response shape.

export const revalidate = 30

export async function GET(req: NextRequest) {
  const incoming = new URL(req.url)
  const upstream = new URL('https://api.coingecko.com/api/v3/coins/markets')

  // Forward whitelisted params; supply sane defaults for the rest.
  const allow = [
    'vs_currency',
    'ids',
    'order',
    'per_page',
    'page',
    'sparkline',
    'price_change_percentage',
    'category',
  ]
  for (const k of allow) {
    const v = incoming.searchParams.get(k)
    if (v !== null) upstream.searchParams.set(k, v)
  }
  if (!upstream.searchParams.has('vs_currency')) upstream.searchParams.set('vs_currency', 'usd')
  if (!upstream.searchParams.has('order')) upstream.searchParams.set('order', 'market_cap_desc')
  if (!upstream.searchParams.has('per_page')) upstream.searchParams.set('per_page', '20')
  if (!upstream.searchParams.has('page')) upstream.searchParams.set('page', '1')

  try {
    const res = await fetch(upstream.toString(), {
      next: { revalidate: 30 },
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      return NextResponse.json(
        { error: 'upstream', status: res.status },
        { status: res.status === 429 ? 429 : 502 }
      )
    }
    const data = await res.json()
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
    })
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 })
  }
}

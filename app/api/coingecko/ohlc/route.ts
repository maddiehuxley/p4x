import { NextRequest, NextResponse } from 'next/server'

// Server-side proxy for CoinGecko's /coins/{id}/ohlc endpoint.
// Used by PriceChart for candlestick data.

export const revalidate = 60

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const days = searchParams.get('days') ?? '1'
  const vs = searchParams.get('vs_currency') ?? 'usd'

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  if (!/^[a-z0-9-]+$/i.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400 })
  }

  const upstream = `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/ohlc?vs_currency=${encodeURIComponent(vs)}&days=${encodeURIComponent(days)}`

  try {
    const res = await fetch(upstream, {
      next: { revalidate: 60 },
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
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    })
  } catch {
    return NextResponse.json({ error: 'fetch_failed' }, { status: 502 })
  }
}

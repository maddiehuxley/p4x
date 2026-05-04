import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('watchlist_items')
    .select('*')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with current prices from CoinGecko in a single batched call
  const items = data ?? []
  if (items.length === 0) return NextResponse.json({ items: [] })

  const ids = items.map((i) => i.coingecko_id).join(',')
  let prices: Record<string, { usd?: number; usd_24h_change?: number }> = {}
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 30 } }
    )
    if (res.ok) prices = await res.json()
  } catch {
    // Non-fatal: we'll just return without prices
  }

  return NextResponse.json({
    items: items.map((i) => ({
      id: i.id,
      coingeckoId: i.coingecko_id,
      symbol: i.symbol,
      name: i.name,
      addedAt: i.added_at,
      priceUsd: prices[i.coingecko_id]?.usd ?? null,
      change24h: prices[i.coingecko_id]?.usd_24h_change ?? null,
    })),
  })
}

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { coingeckoId, symbol, name } = body
  if (!coingeckoId || !symbol || !name) {
    return NextResponse.json(
      { error: 'coingeckoId, symbol, and name required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('watchlist_items')
    .insert({
      user_id: user.id,
      coingecko_id: coingeckoId,
      symbol,
      name,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'already in watchlist' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ item: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

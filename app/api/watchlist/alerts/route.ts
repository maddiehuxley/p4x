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
    .from('price_alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    alerts: (data ?? []).map((a) => ({
      id: a.id,
      coingeckoId: a.coingecko_id,
      symbol: a.symbol,
      direction: a.direction,
      targetPriceUsd: parseFloat(a.target_price_usd),
      triggered: a.triggered,
      createdAt: a.created_at,
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
  const { coingeckoId, symbol, direction, targetPriceUsd } = body

  if (!coingeckoId || !symbol || !direction || !targetPriceUsd) {
    return NextResponse.json({ error: 'missing required fields' }, { status: 400 })
  }
  if (direction !== 'above' && direction !== 'below') {
    return NextResponse.json({ error: 'direction must be above or below' }, { status: 400 })
  }
  const target = parseFloat(targetPriceUsd)
  if (!Number.isFinite(target) || target <= 0) {
    return NextResponse.json({ error: 'targetPriceUsd must be > 0' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('price_alerts')
    .insert({
      user_id: user.id,
      coingecko_id: coingeckoId,
      symbol,
      direction,
      target_price_usd: target,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ alert: data })
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
    .from('price_alerts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

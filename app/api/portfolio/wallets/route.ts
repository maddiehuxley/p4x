import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { detectAddressCategory } from '@/lib/chains/registry'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    wallets: (data ?? []).map((w) => ({
      id: w.id,
      address: w.address,
      chain: w.chain,
      label: w.label,
      createdAt: w.created_at,
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
  const address = (body.address || '').trim()
  const label = body.label ? String(body.label).slice(0, 60) : null

  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 })
  }

  const chain = detectAddressCategory(address)
  if (!chain) {
    return NextResponse.json(
      { error: 'unrecognized address format' },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from('wallets')
    .insert({ user_id: user.id, address, chain, label })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'wallet already added' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ wallet: data })
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
    .from('wallets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

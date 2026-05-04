import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildPortfolio, getEurUsdRate } from '@/lib/chains/portfolio'
import type { WalletAddress } from '@/types/portfolio'

export const dynamic = 'force-dynamic'
export const maxDuration = 30 // seconds — chain queries can be slow

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: walletsRaw, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const wallets: WalletAddress[] = (walletsRaw ?? []).map((w) => ({
    id: w.id,
    address: w.address,
    chain: w.chain,
    label: w.label,
    createdAt: w.created_at,
  }))

  if (wallets.length === 0) {
    return NextResponse.json({
      wallets: [],
      snapshot: {
        totalValueUsd: 0,
        totalValueEur: 0,
        byChain: {},
        balances: [],
        fetchedAt: Date.now(),
      },
    })
  }

  const eurRate = await getEurUsdRate()
  const snapshot = await buildPortfolio(wallets, eurRate)

  return NextResponse.json({ wallets, snapshot })
}

import type { TokenBalance, Transaction } from '@/types/portfolio'

/**
 * Fetch BTC balance for an address using mempool.space.
 * No API key required.
 */
export async function fetchBitcoinBalances(address: string): Promise<TokenBalance[]> {
  const [addrRes, priceRes] = await Promise.all([
    fetch(`https://mempool.space/api/address/${address}`, { cache: 'no-store' }),
    fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      { next: { revalidate: 60 } }
    ),
  ])

  if (!addrRes.ok) {
    throw new Error(`Mempool.space request failed: ${addrRes.status}`)
  }

  const addrJson = await addrRes.json()
  // chain_stats: confirmed; mempool_stats: pending. Sum funded - spent for total.
  const confirmedSats =
    (addrJson?.chain_stats?.funded_txo_sum ?? 0) - (addrJson?.chain_stats?.spent_txo_sum ?? 0)
  const mempoolSats =
    (addrJson?.mempool_stats?.funded_txo_sum ?? 0) - (addrJson?.mempool_stats?.spent_txo_sum ?? 0)
  const totalSats = confirmedSats + mempoolSats

  if (totalSats <= 0) return []

  const balance = totalSats / 1e8

  let priceUsd: number | null = null
  let change24h: number | null = null
  if (priceRes.ok) {
    const priceJson = await priceRes.json()
    priceUsd = priceJson?.bitcoin?.usd ?? null
    change24h = priceJson?.bitcoin?.usd_24h_change ?? null
  }

  return [
    {
      chain: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      address: null,
      balance,
      decimals: 8,
      priceUsd,
      valueUsd: priceUsd ? balance * priceUsd : 0,
      change24h,
      logoUrl: '/chains/bitcoin.svg',
    },
  ]
}

/**
 * Fetch recent BTC transactions for an address.
 */
export async function fetchBitcoinTransactions(
  address: string,
  limit = 25
): Promise<Transaction[]> {
  const res = await fetch(`https://mempool.space/api/address/${address}/txs`, {
    cache: 'no-store',
  })
  if (!res.ok) return []
  const txs = await res.json()

  return (Array.isArray(txs) ? txs : []).slice(0, limit).map((t: any): Transaction => {
    // Sum vin/vout amounts that involve our address to determine direction and amount
    const vinSum = (t.vin || [])
      .filter((v: any) => v.prevout?.scriptpubkey_address === address)
      .reduce((s: number, v: any) => s + (v.prevout?.value ?? 0), 0)
    const voutSum = (t.vout || [])
      .filter((v: any) => v.scriptpubkey_address === address)
      .reduce((s: number, v: any) => s + (v.value ?? 0), 0)

    const net = voutSum - vinSum
    const direction: 'in' | 'out' | 'self' =
      net > 0 ? 'in' : net < 0 ? 'out' : 'self'

    return {
      chain: 'bitcoin',
      hash: t.txid,
      timestamp: t.status?.block_time ?? Math.floor(Date.now() / 1000),
      from: '',
      to: address,
      direction,
      asset: 'BTC',
      amount: Math.abs(net) / 1e8,
      valueUsd: null,
      status: t.status?.confirmed ? 'success' : 'pending',
    }
  })
}

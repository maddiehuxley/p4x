import type {
  PortfolioSnapshot,
  TokenBalance,
  WalletAddress,
  ChainId,
} from '@/types/portfolio'
import { fetchEvmBalances } from './evm'
import { fetchSolanaBalances } from './solana'
import { fetchBitcoinBalances } from './bitcoin'

/**
 * Build a full multi-chain, multi-wallet portfolio snapshot.
 * Errors on individual chains/wallets are isolated: if Solana fails,
 * EVM and BTC still return.
 */
export async function buildPortfolio(
  wallets: WalletAddress[],
  fiatRateEurPerUsd = 0.93
): Promise<PortfolioSnapshot> {
  const tasks: Promise<TokenBalance[]>[] = wallets.map(async (w) => {
    try {
      switch (w.chain) {
        case 'evm':
          return await fetchEvmBalances(w.address)
        case 'solana':
          return await fetchSolanaBalances(w.address)
        case 'bitcoin':
          return await fetchBitcoinBalances(w.address)
        default:
          return []
      }
    } catch (err) {
      console.error(`[p4x] portfolio fetch failed for ${w.chain}:${w.address}`, err)
      return []
    }
  })

  const results = await Promise.all(tasks)
  const allBalances = results.flat()

  const byChain: Record<string, number> = {}
  let totalValueUsd = 0
  for (const b of allBalances) {
    totalValueUsd += b.valueUsd
    byChain[b.chain] = (byChain[b.chain] ?? 0) + b.valueUsd
  }

  return {
    totalValueUsd,
    totalValueEur: totalValueUsd * fiatRateEurPerUsd,
    byChain: byChain as Record<ChainId, number>,
    balances: allBalances.sort((a, b) => b.valueUsd - a.valueUsd),
    fetchedAt: Date.now(),
  }
}

/**
 * Fetch the EUR per USD rate from a free FX API. Cached for 6 hours.
 */
export async function getEurUsdRate(): Promise<number> {
  try {
    const res = await fetch(
      'https://api.exchangerate-api.com/v4/latest/USD',
      { next: { revalidate: 6 * 60 * 60 } }
    )
    if (!res.ok) return 0.93
    const json = await res.json()
    return json?.rates?.EUR ?? 0.93
  } catch {
    return 0.93
  }
}

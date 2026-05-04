import type { TokenBalance, Transaction, ChainId } from '@/types/portfolio'
import { CHAINS, EVM_CHAINS } from './registry'

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY

if (!ALCHEMY_KEY && process.env.NODE_ENV !== 'test') {
  console.warn('[p4x] ALCHEMY_API_KEY not set — EVM portfolio queries will fail')
}

interface AlchemyTokenBalance {
  network: string
  address: string
  tokenAddress: string | null
  tokenBalance: string
  tokenMetadata: {
    symbol: string | null
    name: string | null
    decimals: number | null
    logo: string | null
  }
  tokenPrices: Array<{
    currency: string
    value: string
    lastUpdatedAt: string
  }>
}

const NETWORK_TO_CHAIN: Record<string, ChainId> = {
  'eth-mainnet': 'ethereum',
  'polygon-mainnet': 'polygon',
  'arb-mainnet': 'arbitrum',
  'opt-mainnet': 'optimism',
  'base-mainnet': 'base',
}

/**
 * Fetch all token balances for an EVM address across all supported chains.
 * Uses Alchemy's Portfolio API which batches everything into a single request.
 */
export async function fetchEvmBalances(address: string): Promise<TokenBalance[]> {
  if (!ALCHEMY_KEY) throw new Error('Alchemy API key not configured')

  const networks = EVM_CHAINS.map((c) => CHAINS[c].alchemyNetwork!).filter(Boolean)

  const url = `https://api.g.alchemy.com/data/v1/${ALCHEMY_KEY}/assets/tokens/balances/by-address`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      addresses: [
        {
          address,
          networks,
        },
      ],
      includeNativeTokens: true,
      includePrices: true,
    }),
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`Alchemy balances request failed: ${res.status}`)
  }

  const json = await res.json()
  const tokens: AlchemyTokenBalance[] = json?.data?.tokens ?? []

  return tokens
    .map((t): TokenBalance | null => {
      const chain = NETWORK_TO_CHAIN[t.network]
      if (!chain) return null

      const decimals = t.tokenMetadata?.decimals ?? 18
      const rawBalance = BigInt(t.tokenBalance || '0')
      const balance = Number(rawBalance) / 10 ** decimals

      // Skip dust and likely-spam tokens with no price + no metadata
      if (balance === 0) return null

      const usdPriceEntry = t.tokenPrices?.find((p) => p.currency === 'usd')
      const priceUsd = usdPriceEntry ? parseFloat(usdPriceEntry.value) : null
      const valueUsd = priceUsd !== null ? balance * priceUsd : 0

      // Filter spam: tokens with balance but no price and no recognized metadata
      if (priceUsd === null && !t.tokenMetadata?.symbol) return null

      return {
        chain,
        symbol: t.tokenMetadata?.symbol ?? '???',
        name: t.tokenMetadata?.name ?? 'Unknown Token',
        address: t.tokenAddress,
        balance,
        decimals,
        priceUsd,
        valueUsd,
        change24h: null, // Alchemy doesn't return 24h change; we'll enrich from CoinGecko separately if needed
        logoUrl: t.tokenMetadata?.logo ?? null,
      }
    })
    .filter((b): b is TokenBalance => b !== null)
    .sort((a, b) => b.valueUsd - a.valueUsd)
}

/**
 * Fetch recent transactions for an EVM address on a single chain.
 * Limited to 25 most recent for the portfolio overview.
 */
export async function fetchEvmTransactions(
  address: string,
  chain: ChainId,
  limit = 25
): Promise<Transaction[]> {
  if (!ALCHEMY_KEY) throw new Error('Alchemy API key not configured')
  const network = CHAINS[chain].alchemyNetwork
  if (!network) return []

  const url = `https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`

  const fetchFor = async (direction: 'from' | 'to') => {
    const body = {
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getAssetTransfers',
      params: [
        {
          [direction === 'from' ? 'fromAddress' : 'toAddress']: address,
          category: ['external', 'erc20'],
          maxCount: `0x${limit.toString(16)}`,
          order: 'desc',
          withMetadata: true,
        },
      ],
    }
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    if (!r.ok) return []
    const j = await r.json()
    return j?.result?.transfers ?? []
  }

  const [outgoing, incoming] = await Promise.all([fetchFor('from'), fetchFor('to')])

  const all = [...outgoing, ...incoming].map((t: any): Transaction => {
    const fromAddr = (t.from || '').toLowerCase()
    const toAddr = (t.to || '').toLowerCase()
    const me = address.toLowerCase()
    let direction: 'in' | 'out' | 'self' = 'in'
    if (fromAddr === me && toAddr === me) direction = 'self'
    else if (fromAddr === me) direction = 'out'
    else direction = 'in'

    return {
      chain,
      hash: t.hash,
      timestamp: t.metadata?.blockTimestamp
        ? Math.floor(new Date(t.metadata.blockTimestamp).getTime() / 1000)
        : 0,
      from: t.from,
      to: t.to,
      direction,
      asset: t.asset || CHAINS[chain].symbol,
      amount: parseFloat(t.value || '0'),
      valueUsd: null,
      status: 'success',
    }
  })

  // Dedupe by hash, sort by time desc
  const seen = new Set<string>()
  const deduped = all.filter((tx) => {
    if (seen.has(tx.hash)) return false
    seen.add(tx.hash)
    return true
  })
  return deduped.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)
}

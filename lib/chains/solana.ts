import type { TokenBalance, Transaction } from '@/types/portfolio'

const HELIUS_KEY = process.env.HELIUS_API_KEY

if (!HELIUS_KEY && process.env.NODE_ENV !== 'test') {
  console.warn('[p4x] HELIUS_API_KEY not set — Solana portfolio queries will fail')
}

interface HeliusBalanceResponse {
  nativeBalance: number // lamports
  tokens: Array<{
    mint: string
    amount: number
    decimals: number
    tokenAccount: string
  }>
}

interface HeliusAssetResponse {
  result: {
    items: Array<{
      id: string
      content: {
        metadata: {
          name?: string
          symbol?: string
        }
        files?: Array<{ uri?: string; cdn_uri?: string }>
        links?: { image?: string }
      }
      token_info?: {
        symbol?: string
        balance?: number
        decimals?: number
        price_info?: {
          price_per_token?: number
          total_price?: number
        }
      }
      interface: string
    }>
  }
}

/**
 * Fetch SOL + SPL token balances for a Solana address.
 * Uses Helius's getAssetsByOwner for token metadata + prices, and getBalance for native SOL.
 */
export async function fetchSolanaBalances(address: string): Promise<TokenBalance[]> {
  if (!HELIUS_KEY) throw new Error('Helius API key not configured')

  const rpcUrl = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}`

  // Single batched call: native balance + fungible tokens (excludes NFTs)
  const [nativeRes, assetsRes] = await Promise.all([
    fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'p4x-native',
        method: 'getBalance',
        params: [address],
      }),
      cache: 'no-store',
    }),
    fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'p4x-assets',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: address,
          page: 1,
          limit: 1000,
          options: {
            showFungible: true,
            showNativeBalance: true,
          },
        },
      }),
      cache: 'no-store',
    }),
  ])

  if (!nativeRes.ok || !assetsRes.ok) {
    throw new Error('Helius request failed')
  }

  const nativeJson = await nativeRes.json()
  const assetsJson: HeliusAssetResponse = await assetsRes.json()

  const balances: TokenBalance[] = []

  // Native SOL — fetch its price separately if needed (Helius getAssetsByOwner with showNativeBalance returns it)
  const lamports = nativeJson?.result?.value ?? 0
  const solBalance = lamports / 1e9
  if (solBalance > 0) {
    // Try to get SOL price from CoinGecko
    let solPrice: number | null = null
    try {
      const cg = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true',
        { next: { revalidate: 60 } }
      )
      if (cg.ok) {
        const cgJson = await cg.json()
        solPrice = cgJson?.solana?.usd ?? null
      }
    } catch {
      // Non-fatal — we'll show balance without price
    }
    balances.push({
      chain: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      address: null,
      balance: solBalance,
      decimals: 9,
      priceUsd: solPrice,
      valueUsd: solPrice ? solBalance * solPrice : 0,
      change24h: null,
      logoUrl: '/chains/solana.svg',
    })
  }

  // Fungible tokens
  const items = assetsJson?.result?.items ?? []
  for (const item of items) {
    if (item.interface !== 'FungibleToken' && item.interface !== 'FungibleAsset') continue
    const ti = item.token_info
    if (!ti) continue

    const balance = (ti.balance ?? 0) / 10 ** (ti.decimals ?? 0)
    if (balance === 0) continue

    const priceUsd = ti.price_info?.price_per_token ?? null
    const valueUsd = ti.price_info?.total_price ?? (priceUsd ? balance * priceUsd : 0)

    // Skip likely-spam tokens with no price and no symbol
    if (priceUsd === null && !ti.symbol && !item.content?.metadata?.symbol) continue

    balances.push({
      chain: 'solana',
      symbol: ti.symbol ?? item.content?.metadata?.symbol ?? '???',
      name: item.content?.metadata?.name ?? 'Unknown Token',
      address: item.id,
      balance,
      decimals: ti.decimals ?? 0,
      priceUsd,
      valueUsd,
      change24h: null,
      logoUrl:
        item.content?.links?.image ??
        item.content?.files?.[0]?.cdn_uri ??
        item.content?.files?.[0]?.uri ??
        null,
    })
  }

  return balances.sort((a, b) => b.valueUsd - a.valueUsd)
}

/**
 * Fetch recent Solana transactions for an address.
 */
export async function fetchSolanaTransactions(
  address: string,
  limit = 25
): Promise<Transaction[]> {
  if (!HELIUS_KEY) throw new Error('Helius API key not configured')

  const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_KEY}&limit=${limit}`
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []
  const txs = await res.json()

  return (Array.isArray(txs) ? txs : [])
    .map((t: any): Transaction => {
      // Helius enhanced tx format. Try to derive a meaningful direction/asset.
      const transfers = t.tokenTransfers ?? []
      const native = t.nativeTransfers ?? []
      const allTransfers = [...transfers, ...native]
      const userTransfer = allTransfers.find(
        (tr: any) => tr.fromUserAccount === address || tr.toUserAccount === address
      )

      let direction: 'in' | 'out' | 'self' = 'in'
      let asset = 'SOL'
      let amount = 0

      if (userTransfer) {
        if (userTransfer.fromUserAccount === address) direction = 'out'
        else direction = 'in'
        asset = userTransfer.tokenSymbol || (userTransfer.mint ? 'SPL' : 'SOL')
        amount = userTransfer.tokenAmount ?? userTransfer.amount / 1e9
      }

      return {
        chain: 'solana',
        hash: t.signature,
        timestamp: t.timestamp,
        from: userTransfer?.fromUserAccount || '',
        to: userTransfer?.toUserAccount || '',
        direction,
        asset,
        amount: Math.abs(amount),
        valueUsd: null,
        status: t.transactionError ? 'failed' : 'success',
      }
    })
    .slice(0, limit)
}

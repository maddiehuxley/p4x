// Shared types for the P4X portfolio system.
// All chain adapters return data normalized to these shapes.

export type ChainId = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'base' | 'solana' | 'bitcoin'

export type ChainCategory = 'evm' | 'solana' | 'bitcoin'

export interface ChainMeta {
  id: ChainId
  name: string
  category: ChainCategory
  symbol: string // native token symbol (ETH, SOL, BTC, MATIC...)
  explorerUrl: string
  logoSrc: string // path under /public/chains/
  // For EVM chains, the chain ID number used by Alchemy
  alchemyNetwork?: string
}

export interface TokenBalance {
  chain: ChainId
  symbol: string
  name: string
  address: string | null // null for native asset
  balance: number // human-readable, decimals already applied
  decimals: number
  priceUsd: number | null
  valueUsd: number // balance * priceUsd, 0 if unpriced
  change24h: number | null // percent
  logoUrl: string | null
}

export interface Transaction {
  chain: ChainId
  hash: string
  timestamp: number // unix seconds
  from: string
  to: string
  direction: 'in' | 'out' | 'self'
  asset: string
  amount: number
  valueUsd: number | null
  status: 'success' | 'failed' | 'pending'
}

export interface WalletAddress {
  id: string
  address: string
  chain: ChainCategory // EVM addresses cover all EVM chains; SOL/BTC are chain-specific
  label: string | null
  createdAt: string
}

export interface PortfolioSnapshot {
  totalValueUsd: number
  totalValueEur: number
  byChain: Record<ChainId, number> // chain -> value in USD
  balances: TokenBalance[]
  fetchedAt: number
}

export interface WatchlistItem {
  id: string
  userId: string
  coingeckoId: string
  symbol: string
  name: string
  addedAt: string
}

export interface PriceAlert {
  id: string
  userId: string
  coingeckoId: string
  symbol: string
  direction: 'above' | 'below'
  targetPriceUsd: number
  triggered: boolean
  createdAt: string
}

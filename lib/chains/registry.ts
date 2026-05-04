import type { ChainMeta, ChainId } from '@/types/portfolio'

export const CHAINS: Record<ChainId, ChainMeta> = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    category: 'evm',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
    logoSrc: '/chains/ethereum.svg',
    alchemyNetwork: 'eth-mainnet',
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    category: 'evm',
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com',
    logoSrc: '/chains/polygon.svg',
    alchemyNetwork: 'polygon-mainnet',
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    category: 'evm',
    symbol: 'ETH',
    explorerUrl: 'https://arbiscan.io',
    logoSrc: '/chains/arbitrum.svg',
    alchemyNetwork: 'arb-mainnet',
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    category: 'evm',
    symbol: 'ETH',
    explorerUrl: 'https://optimistic.etherscan.io',
    logoSrc: '/chains/optimism.svg',
    alchemyNetwork: 'opt-mainnet',
  },
  base: {
    id: 'base',
    name: 'Base',
    category: 'evm',
    symbol: 'ETH',
    explorerUrl: 'https://basescan.org',
    logoSrc: '/chains/base.svg',
    alchemyNetwork: 'base-mainnet',
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    category: 'solana',
    symbol: 'SOL',
    explorerUrl: 'https://solscan.io',
    logoSrc: '/chains/solana.svg',
  },
  bitcoin: {
    id: 'bitcoin',
    name: 'Bitcoin',
    category: 'bitcoin',
    symbol: 'BTC',
    explorerUrl: 'https://mempool.space',
    logoSrc: '/chains/bitcoin.svg',
  },
}

export const EVM_CHAINS: ChainId[] = ['ethereum', 'polygon', 'arbitrum', 'optimism', 'base']

export function isValidEvmAddress(addr: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(addr.trim())
}

export function isValidSolanaAddress(addr: string): boolean {
  // Base58, 32-44 chars, no 0/O/I/l
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim())
}

export function isValidBitcoinAddress(addr: string): boolean {
  const a = addr.trim()
  // Legacy P2PKH/P2SH, SegWit bech32, Taproot bech32m
  return (
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(a) ||
    /^bc1[ac-hj-np-z02-9]{11,87}$/i.test(a)
  )
}

export function detectAddressCategory(addr: string): 'evm' | 'solana' | 'bitcoin' | null {
  const a = addr.trim()
  if (isValidEvmAddress(a)) return 'evm'
  if (isValidBitcoinAddress(a)) return 'bitcoin'
  if (isValidSolanaAddress(a)) return 'solana'
  return null
}

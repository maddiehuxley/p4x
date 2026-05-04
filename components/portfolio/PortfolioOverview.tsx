'use client'

import { motion } from 'framer-motion'
import type { PortfolioSnapshot, ChainId } from '@/types/portfolio'
import { CHAINS } from '@/lib/chains/registry'

const fmtUsd = (n: number | null | undefined) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n < 1 ? 6 : 2,
  }).format(n)
}

const fmtEur = (n: number | null | undefined) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(n)
}

const fmtBalance = (n: number, decimals: number) => {
  if (typeof n !== 'number' || !Number.isFinite(n) || n === 0) return '0'
  if (n < 0.0001) return n.toExponential(2)
  if (n < 1) return n.toFixed(Math.min(6, decimals))
  if (n < 100) return n.toFixed(4)
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function getChainColor(chain: ChainId): string {
  const colors: Record<ChainId, string> = {
    ethereum: '#627EEA',
    polygon: '#8247E5',
    arbitrum: '#28A0F0',
    optimism: '#FF0420',
    base: '#0052FF',
    solana: '#9945FF',
    bitcoin: '#F7931A',
  }
  return colors[chain] || 'var(--cyan)'
}

export default function PortfolioOverview({
  snapshot,
  loading,
}: {
  snapshot: PortfolioSnapshot | null
  loading: boolean
}) {
  if (loading && !snapshot) {
    return (
      <div className="flex flex-col gap-4">
        <div className="shimmer-skeleton rounded-lg" style={{ height: '140px' }} />
        <div className="shimmer-skeleton rounded-lg" style={{ height: '280px' }} />
      </div>
    )
  }

  if (!snapshot || snapshot.balances.length === 0) {
    return (
      <div className="glass rounded-lg p-12 text-center">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          No holdings detected
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '32rem', margin: '0 auto' }}>
          Add a wallet to see your portfolio across Ethereum, Polygon, Arbitrum, Optimism, Base, Solana, and Bitcoin.
        </p>
      </div>
    )
  }

  const chainEntries = Object.entries(snapshot.byChain)
    .filter(([, v]) => typeof v === 'number' && v > 0)
    .sort((a, b) => (b[1] as number) - (a[1] as number)) as [ChainId, number][]

  const totalValueUsd = snapshot.totalValueUsd

  return (
    <div className="flex flex-col gap-6">
      {/* Total value header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg p-6 md:p-8"
      >
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem' }}>
          Total Portfolio Value
        </div>
        <div className="flex items-baseline gap-4 flex-wrap">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.6rem', fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '0.02em' }}>
            {fmtUsd(totalValueUsd)}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            ≈ {fmtEur(snapshot.totalValueEur)}
          </div>
        </div>

        {/* Per-chain breakdown bar */}
        {totalValueUsd > 0 && chainEntries.length > 0 && (
          <div className="mt-6">
            <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              {chainEntries.map(([chain, value]) => {
                const pct = (value / totalValueUsd) * 100
                return (
                  <div
                    key={chain}
                    style={{ width: `${pct}%`, background: getChainColor(chain), height: '100%' }}
                    title={`${CHAINS[chain].name}: ${fmtUsd(value)} (${pct.toFixed(1)}%)`}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
              {chainEntries.map(([chain, value]) => {
                const pct = (value / totalValueUsd) * 100
                return (
                  <div key={chain} className="flex items-center gap-1.5" style={{ fontSize: '0.72rem' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: getChainColor(chain), display: 'inline-block' }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{CHAINS[chain].name}</span>
                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{pct.toFixed(1)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Holdings table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-lg overflow-hidden"
      >
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Holdings
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Asset</th>
                <th className="text-left px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Chain</th>
                <th className="text-right px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Balance</th>
                <th className="text-right px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Price</th>
                <th className="text-right px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Value</th>
                <th className="text-right px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Allocation</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.balances.map((b, i) => {
                const allocation = totalValueUsd > 0 ? (b.valueUsd / totalValueUsd) * 100 : 0
                return (
                  <motion.tr
                    key={`${b.chain}-${b.address}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="market-row"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2.5">
                        {b.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={b.logoUrl}
                            alt=""
                            className="w-6 h-6 rounded-full"
                            style={{ background: 'var(--bg-panel)' }}
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).style.visibility = 'hidden'
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'var(--cyan-glow)', border: '1px solid var(--border-hover)', fontSize: '0.55rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 600 }}>
                            {b.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.03em', fontSize: '0.85rem' }}>
                            {b.symbol}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            {b.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {CHAINS[b.chain].name}
                    </td>
                    <td className="px-6 py-3.5 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {fmtBalance(b.balance, b.decimals)}
                    </td>
                    <td className="px-6 py-3.5 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {b.priceUsd !== null ? fmtUsd(b.priceUsd) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {b.valueUsd > 0 ? fmtUsd(b.valueUsd) : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {allocation.toFixed(1)}%
                        </span>
                        <div className="rounded-full overflow-hidden" style={{ width: '48px', height: '3px', background: 'var(--border)' }}>
                          <div style={{ width: `${allocation}%`, height: '100%', background: 'var(--cyan)', opacity: 0.6 }} />
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}

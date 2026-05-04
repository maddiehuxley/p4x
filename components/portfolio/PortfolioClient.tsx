'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import AddWalletForm from './AddWalletForm'
import WalletList from './WalletList'
import PortfolioOverview from './PortfolioOverview'
import type { PortfolioSnapshot, WalletAddress } from '@/types/portfolio'

export default function PortfolioClient() {
  const [wallets, setWallets] = useState<WalletAddress[]>([])
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    try {
      const res = await fetch('/api/portfolio/snapshot', { cache: 'no-store' })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Request failed (${res.status})`)
      }
      const json = await res.json()
      setWallets(json.wallets ?? [])
      setSnapshot(json.snapshot ?? null)
    } catch (e: any) {
      setError(e.message ?? 'Failed to load portfolio')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function deleteWallet(id: string) {
    await fetch(`/api/portfolio/wallets?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '2.1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            Portfolio
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Your full crypto net worth across every chain · Read-only · Your keys never touch P4X
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={refreshing}
            className="btn-outline px-4 py-2 text-xs rounded flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <AddWalletForm onAdded={refresh} />
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', color: 'var(--red)', background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.25)', borderRadius: '6px' }}>
          {error}
        </div>
      )}

      {/* Wallets section */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-lg p-6"
      >
        <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1rem' }}>
          Connected Wallets
        </div>
        <WalletList wallets={wallets} onDelete={deleteWallet} />
      </motion.section>

      {/* Portfolio data */}
      <PortfolioOverview snapshot={snapshot} loading={loading} />

      {/* Footer disclaimer */}
      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '40rem', lineHeight: 1.6 }}>
        P4X displays public on-chain data only. We never custody your assets, hold your private keys, or facilitate the transfer of funds. All values are informational, not investment advice.
      </p>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { WalletAddress } from '@/types/portfolio'

const CHAIN_LABELS: Record<string, string> = {
  evm: 'EVM',
  solana: 'SOL',
  bitcoin: 'BTC',
}

function shortAddr(addr: string) {
  if (addr.length <= 14) return addr
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

export default function WalletList({
  wallets,
  onDelete,
}: {
  wallets: WalletAddress[]
  onDelete: (id: string) => void
}) {
  if (wallets.length === 0) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
        No wallets added yet.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {wallets.map((w, i) => (
        <motion.div
          key={w.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="glass-hover flex items-center gap-3 px-4 py-3 rounded group"
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--border)',
          }}
        >
          <span
            style={{
              padding: '0.15rem 0.5rem',
              fontSize: '0.6rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              borderRadius: '3px',
              border: '1px solid var(--border-hover)',
              background: 'var(--cyan-glow)',
              color: 'var(--cyan)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            {CHAIN_LABELS[w.chain] || w.chain}
          </span>
          <div className="flex-1 min-w-0">
            {w.label && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 500 }} className="truncate">
                {w.label}
              </div>
            )}
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }} className="truncate">
              {shortAddr(w.address)}
            </div>
          </div>
          <button
            onClick={() => onDelete(w.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
            title="Remove wallet"
          >
            <X size={14} />
          </button>
        </motion.div>
      ))}
    </div>
  )
}

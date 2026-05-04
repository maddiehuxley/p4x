'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Search } from 'lucide-react'

interface WatchlistItem {
  id: string
  coingeckoId: string
  symbol: string
  name: string
  addedAt: string
  priceUsd: number | null
  change24h: number | null
}

interface SearchResult {
  id: string
  symbol: string
  name: string
}

const fmtUsd = (n: number | null) => {
  if (typeof n !== 'number' || !Number.isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: n < 1 ? 6 : 2,
  }).format(n)
}

export default function WatchlistClient() {
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [searchOpen, setSearchOpen] = useState(false)
  const [searching, setSearching] = useState(false)

  const refresh = useCallback(async () => {
    const res = await fetch('/api/watchlist', { cache: 'no-store' })
    if (res.ok) {
      const j = await res.json()
      setItems(j.items ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // Debounced CoinGecko search via the existing /api/coingecko proxy pattern would require
  // adding a search endpoint; for now we hit CoinGecko's /search directly which DOES send
  // CORS headers (only /coins/markets and /ohlc were CORS-blocked).
  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(search)}`
        )
        if (r.ok) {
          const j = await r.json()
          setResults((j.coins ?? []).slice(0, 8))
        }
      } catch {
        // Silently fail — leave results empty
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  async function addToken(r: SearchResult) {
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        coingeckoId: r.id,
        symbol: r.symbol.toUpperCase(),
        name: r.name,
      }),
    })
    setSearch('')
    setResults([])
    setSearchOpen(false)
    refresh()
  }

  async function removeItem(id: string) {
    await fetch(`/api/watchlist?id=${id}`, { method: 'DELETE' })
    refresh()
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '2.1rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            Watchlist
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Tokens you're tracking · Price alerts coming next
          </p>
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          className="btn-cyan px-5 py-2 text-xs rounded flex items-center gap-2"
        >
          <Plus size={12} /> Add Token
        </button>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4"
            style={{ background: 'rgba(3, 10, 24, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSearchOpen(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-lg rounded-lg overflow-hidden"
              style={{ boxShadow: '0 20px 60px rgba(0, 207, 255, 0.08)' }}
            >
              <div className="flex items-center px-4" style={{ borderBottom: '1px solid var(--border)' }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tokens (e.g. bitcoin, ethereum, solana)…"
                  className="flex-1 bg-transparent border-0 px-3 py-4 text-sm focus:outline-none"
                  style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                />
                <button onClick={() => setSearchOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {searching && (
                  <div style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Searching…
                  </div>
                )}
                {!searching && results.length === 0 && search && (
                  <div style={{ padding: '0.75rem 1.25rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    No results.
                  </div>
                )}
                {results.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => addToken(r)}
                    className="w-full px-5 py-3 flex items-center gap-3 text-left transition-colors"
                    style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--cyan-glow)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--cyan-glow)', border: '1px solid var(--border-hover)', fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontWeight: 600 }}>
                      {r.symbol.slice(0, 3).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', fontWeight: 500 }} className="truncate">
                        {r.name}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                        {r.symbol}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="shimmer-skeleton rounded-lg" style={{ height: '200px' }} />
      ) : items.length === 0 ? (
        <div className="glass rounded-lg p-12 text-center">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.4rem', color: 'var(--text-primary)', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Your watchlist is empty
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '32rem', margin: '0 auto' }}>
            Add tokens to track prices and (soon) get alerts when they hit your targets.
          </p>
        </div>
      ) : (
        <div className="glass rounded-lg overflow-hidden">
          <table className="w-full" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th className="text-left px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Token</th>
                <th className="text-right px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>Price</th>
                <th className="text-right px-6 py-3" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 400 }}>24h</th>
                <th className="text-right px-6 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const change = typeof it.change24h === 'number' ? it.change24h : null
                const pos = (change ?? 0) >= 0
                return (
                  <motion.tr
                    key={it.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.03, 0.3) }}
                    className="market-row group"
                    style={{ borderBottom: '1px solid var(--border)' }}
                  >
                    <td className="px-6 py-3.5">
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.03em', fontSize: '0.88rem' }}>
                        {it.symbol}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {it.name}
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-right" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {fmtUsd(it.priceUsd)}
                    </td>
                    <td className="px-6 py-3.5 text-right" style={{ fontFamily: 'var(--font-mono)' }}>
                      {change !== null ? (
                        <span style={{ color: pos ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
                          {pos ? '+' : ''}{change.toFixed(2)}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => removeItem(it.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

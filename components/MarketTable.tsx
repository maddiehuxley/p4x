'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

type Coin = {
  id: string; name: string; symbol: string; current_price: number
  price_change_percentage_24h: number; market_cap: number
  total_volume: number; image: string; market_cap_rank: number
}

function fmt(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  return `$${n.toLocaleString()}`
}

export default function MarketTable({ limit = 20 }: { limit?: number }) {
  const [coins, setCoins] = useState<Coin[]>([])
  const [loading, setLoading] = useState(true)
  const prevPrices = useRef<Record<string, number>>({})
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down' | null>>({})

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
        )
        if (res.ok) {
          const data: Coin[] = await res.json()
          const newFlashes: Record<string, 'up' | 'down' | null> = {}
          data.forEach(c => {
            const prev = prevPrices.current[c.id]
            if (prev !== undefined && prev !== c.current_price) {
              newFlashes[c.id] = c.current_price > prev ? 'up' : 'down'
            }
            prevPrices.current[c.id] = c.current_price
          })
          setFlashes(newFlashes)
          setCoins(data)
          setLoading(false)
          setTimeout(() => setFlashes({}), 1100)
        }
      } catch { setLoading(false) }
    }
    fetch_()
    const id = setInterval(fetch_, 30000)
    return () => clearInterval(id)
  }, [limit])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <span className="badge-live">Live</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.95rem', color: 'var(--cyan)' }}>
            MARKET OVERVIEW
          </h2>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
          REFRESH · 30S
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Asset', 'Price', '24h', 'Volume', 'Market Cap'].map(h => (
                <th key={h} className="px-6 py-3 text-left" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.2em', fontWeight: 500, textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className="h-4 rounded shimmer-skeleton" style={{ width: j === 1 ? '120px' : '80px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : coins.map((coin, i) => {
              const pos = coin.price_change_percentage_24h >= 0
              const zero = Math.abs(coin.price_change_percentage_24h) < 0.05
              const flash = flashes[coin.id]
              return (
                <motion.tr
                  key={coin.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.02, 0.3) }}
                  className={`market-row ${flash === 'up' ? 'flash-green' : flash === 'down' ? 'flash-red' : ''}`}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}>
                  <td className="px-6 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {coin.market_cap_rank}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={coin.image} alt={coin.name} className="w-7 h-7 rounded-full" />
                      <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.03em', fontSize: '0.88rem' }}>
                          {coin.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                          {coin.symbol.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 500 }}>
                    ${coin.current_price < 1
                      ? coin.current_price.toFixed(4)
                      : coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1"
                      style={{ color: zero ? 'var(--text-muted)' : pos ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500 }}>
                      {zero ? <Minus size={12} /> : pos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {pos && !zero ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {fmt(coin.total_volume)}
                  </td>
                  <td className="px-6 py-4" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {fmt(coin.market_cap)}
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .market-row { transition: background 0.2s; }
        .market-row:hover { background: rgba(0, 207, 255, 0.03); }
      `}</style>
    </motion.div>
  )
}

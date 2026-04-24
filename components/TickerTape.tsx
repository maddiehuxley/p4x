'use client'
import { useEffect, useState } from 'react'

type Coin = { id: string; symbol: string; current_price: number; price_change_percentage_24h: number }

const fallback: Coin[] = [
  { id: 'btc', symbol: 'btc', current_price: 67420, price_change_percentage_24h: 2.14 },
  { id: 'eth', symbol: 'eth', current_price: 3521, price_change_percentage_24h: -0.83 },
  { id: 'sol', symbol: 'sol', current_price: 172.4, price_change_percentage_24h: 4.2 },
  { id: 'bnb', symbol: 'bnb', current_price: 598, price_change_percentage_24h: 1.1 },
  { id: 'xrp', symbol: 'xrp', current_price: 0.524, price_change_percentage_24h: -1.3 },
  { id: 'ada', symbol: 'ada', current_price: 0.42, price_change_percentage_24h: 0.9 },
]

export default function TickerTape() {
  const [coins, setCoins] = useState<Coin[]>(fallback)

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false'
        )
        if (res.ok) setCoins(await res.json())
      } catch {}
    }
    fetch_()
    const id = setInterval(fetch_, 60000)
    return () => clearInterval(id)
  }, [])

  const items = [...coins, ...coins]

  return (
    <div className="w-full overflow-hidden border-b relative"
      style={{ borderColor: 'var(--border)', background: 'rgba(0, 207, 255, 0.02)', height: '32px' }}>
      <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, var(--bg) 0%, transparent 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, var(--bg) 0%, transparent 100%)' }} />

      <div className="ticker-track h-full flex items-center">
        {items.map((coin, i) => {
          const pos = coin.price_change_percentage_24h >= 0
          return (
            <div key={`${coin.id}-${i}`} className="flex items-center gap-2 px-5 whitespace-nowrap">
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                {coin.symbol.toUpperCase()}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                ${coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: pos ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
                {pos ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
              </span>
              <span style={{ color: 'rgba(0, 207, 255, 0.2)', marginLeft: '0.5rem' }}>·</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

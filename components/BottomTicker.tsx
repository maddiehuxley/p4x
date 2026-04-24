'use client'
import { useEffect, useState } from 'react'

type Coin = {
  id: string
  symbol: string
  current_price: number
  price_change_percentage_24h: number
  sparkline_in_7d?: { price: number[] }
}

function Sparkline({ data, positive, idSuffix }: { data: number[]; positive: boolean; idSuffix: string }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const width = 60
  const height = 20
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * height
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
  const color = positive ? 'var(--green)' : 'var(--red)'
  const gradId = `grad-${idSuffix}`

  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.2" points={points} strokeLinejoin="round" strokeLinecap="round" />
      <polyline fill={`url(#${gradId})`} stroke="none" points={`0,${height} ${points} ${width},${height}`} />
    </svg>
  )
}

export default function BottomTicker() {
  const [coins, setCoins] = useState<Coin[]>([])

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&page=1&sparkline=true&price_change_percentage=24h'
        )
        if (res.ok) setCoins(await res.json())
      } catch {}
    }
    fetch_()
    const id = setInterval(fetch_, 120000)
    return () => clearInterval(id)
  }, [])

  if (coins.length === 0) return null
  const items = [...coins, ...coins]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 spark-bar overflow-hidden" style={{ height: '52px' }}>
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, var(--bg) 0%, transparent 100%)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, var(--bg) 0%, transparent 100%)' }} />

      <div className="ticker-track h-full flex items-center" style={{ animationDuration: '80s' }}>
        {items.map((coin, i) => {
          const pos = coin.price_change_percentage_24h >= 0
          const spark = coin.sparkline_in_7d?.price?.slice(-30) || []
          return (
            <div key={`${coin.id}-${i}`}
              className="flex items-center gap-3 px-5 whitespace-nowrap border-r h-full"
              style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.72rem', color: 'var(--text-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>
                    {coin.symbol.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    ${coin.current_price < 1
                      ? coin.current_price.toFixed(4)
                      : coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: pos ? 'var(--green)' : 'var(--red)', fontWeight: 500, marginTop: '1px' }}>
                  {pos ? '▲' : '▼'} {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
                </span>
              </div>
              <Sparkline data={spark} positive={pos} idSuffix={`${coin.id}-${i}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type OHLCBar = { time: number; open: number; high: number; low: number; close: number }

const COINS = [
  { id: 'bitcoin', symbol: 'BTC' },
  { id: 'ethereum', symbol: 'ETH' },
  { id: 'solana', symbol: 'SOL' },
  { id: 'binancecoin', symbol: 'BNB' },
  { id: 'ripple', symbol: 'XRP' },
]

const RANGES = [
  { label: '1D', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

function AnimatedNumber({ value }: { value: number | null }) {
  const [display, setDisplay] = useState(value ?? 0)
  useEffect(() => {
    if (value === null) return
    const start = display
    const end = value
    const duration = 600
    const startTime = performance.now()
    let raf: number
    const tick = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(start + (end - start) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  if (value === null) return <>—</>
  return <>${display.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</>
}

export default function PriceChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<any>(null)
  const seriesRef = useRef<any>(null)
  const [selectedCoin, setSelectedCoin] = useState(COINS[0])
  const [selectedRange, setSelectedRange] = useState(RANGES[1])
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let destroyed = false
    async function init() {
      if (!chartRef.current) return
      const { createChart, CrosshairMode } = await import('lightweight-charts')
      const chart = createChart(chartRef.current, {
        width: chartRef.current.clientWidth,
        height: 340,
        layout: {
          background: { color: 'transparent' },
          textColor: 'rgba(130, 180, 210, 0.6)',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
        },
        grid: {
          vertLines: { color: 'rgba(0, 207, 255, 0.04)' },
          horzLines: { color: 'rgba(0, 207, 255, 0.04)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
          vertLine: { color: 'rgba(0, 207, 255, 0.4)', width: 1, style: 3, labelBackgroundColor: '#030a18' },
          horzLine: { color: 'rgba(0, 207, 255, 0.4)', width: 1, style: 3, labelBackgroundColor: '#030a18' },
        },
        rightPriceScale: { borderColor: 'rgba(0, 207, 255, 0.1)' },
        timeScale: { borderColor: 'rgba(0, 207, 255, 0.1)', timeVisible: true, secondsVisible: false },
      })
      const series = chart.addCandlestickSeries({
        upColor: '#00FF88', downColor: '#FF3366',
        borderUpColor: '#00FF88', borderDownColor: '#FF3366',
        wickUpColor: '#00FF88', wickDownColor: '#FF3366',
      })
      chartInstance.current = chart
      seriesRef.current = series
      const ro = new ResizeObserver(() => {
        if (chartRef.current && chartInstance.current) {
          chartInstance.current.applyOptions({ width: chartRef.current.clientWidth })
        }
      })
      ro.observe(chartRef.current)
      if (!destroyed) loadData(series)
      return () => { ro.disconnect() }
    }
    init()
    return () => { destroyed = true; chartInstance.current?.remove(); chartInstance.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadData(series?: any) {
    const s = series || seriesRef.current
    if (!s) return
    setLoading(true)
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/coins/${selectedCoin.id}/ohlc?vs_currency=usd&days=${selectedRange.days}`)
      if (!res.ok) throw new Error()
      const raw: number[][] = await res.json()
      const bars: OHLCBar[] = raw.map(([t, o, h, l, c]) => ({
        time: Math.floor(t / 1000) as any, open: o, high: h, low: l, close: c
      }))
      s.setData(bars)
      chartInstance.current?.timeScale().fitContent()
      if (bars.length >= 2) {
        const last = bars[bars.length - 1]
        const first = bars[0]
        setPrice(last.close)
        setChange(((last.close - first.open) / first.open) * 100)
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { if (seriesRef.current) loadData() }, [selectedCoin, selectedRange]) // eslint-disable-line

  const pos = (change ?? 0) >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2 flex-wrap">
              {COINS.map(c => (
                <motion.button key={c.id} onClick={() => setSelectedCoin(c)}
                  whileHover={{ y: -1 }}
                  style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.12em',
                    fontSize: '0.78rem', textTransform: 'uppercase',
                    color: selectedCoin.id === c.id ? 'var(--cyan)' : 'var(--text-muted)',
                    paddingBottom: '3px', position: 'relative', transition: 'color 0.2s',
                    background: 'transparent', border: 'none', cursor: 'pointer'
                  }}>
                  {c.symbol}
                  {selectedCoin.id === c.id && (
                    <motion.div layoutId="coinIndicator"
                      className="absolute left-0 right-0 bottom-0 h-0.5"
                      style={{ background: 'var(--cyan)', boxShadow: '0 0 8px var(--cyan)' }} />
                  )}
                </motion.button>
              ))}
            </div>
            <div className="flex items-baseline gap-3">
              <motion.span
                key={selectedCoin.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '1.6rem' }}>
                <AnimatedNumber value={price} />
              </motion.span>
              <AnimatePresence mode="wait">
                {change !== null && (
                  <motion.span
                    key={`${selectedCoin.id}-${selectedRange.label}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: pos ? 'var(--green)' : 'var(--red)', fontWeight: 500 }}>
                    {pos ? '+' : ''}{change.toFixed(2)}%
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="flex gap-1">
            {RANGES.map(r => (
              <motion.button key={r.label} onClick={() => setSelectedRange(r)}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 rounded"
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.08em',
                  background: selectedRange.label === r.label ? 'var(--cyan)' : 'transparent',
                  color: selectedRange.label === r.label ? '#030a18' : 'var(--text-muted)',
                  border: `1px solid ${selectedRange.label === r.label ? 'var(--cyan)' : 'var(--border)'}`,
                  fontWeight: selectedRange.label === r.label ? 700 : 400,
                  boxShadow: selectedRange.label === r.label ? '0 0 12px var(--cyan-glow-strong)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                {r.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative px-2 py-4">
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-10"
              style={{ background: 'rgba(3, 10, 24, 0.6)', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--cyan)', letterSpacing: '0.3em' }}>
                LOADING<motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>...</motion.span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={chartRef} />
      </div>
    </motion.div>
  )
}

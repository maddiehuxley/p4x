import Navbar from '@/components/Navbar'
import TickerTape from '@/components/TickerTape'
import MarketTable from '@/components/MarketTable'
import PriceChart from '@/components/PriceChart'
import Footer from '@/components/Footer'
import BottomTicker from '@/components/BottomTicker'

export const dynamic = 'force-dynamic'

export default function Markets() {
  return (
    <div>
      <Navbar />
      <div className="pt-16"><TickerTape /></div>
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '2.1rem', marginBottom: '0.4rem' }}>
            Markets
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Live crypto prices via CoinGecko · Updates every 30 seconds
          </p>
        </div>
        <div className="mb-8">
          <PriceChart />
        </div>
        <MarketTable limit={50} />
      </main>
      <Footer />
      <BottomTicker />
    </div>
  )
}

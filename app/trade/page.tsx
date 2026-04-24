import Navbar from '@/components/Navbar'
import TickerTape from '@/components/TickerTape'
import ComingSoon from '@/components/ComingSoon'
import PriceChart from '@/components/PriceChart'
import Footer from '@/components/Footer'
import BottomTicker from '@/components/BottomTicker'
import FeatureGrid from '@/components/FeatureGrid'
import { ArrowLeftRight, Zap, Eye, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function TradePage() {
  return (
    <div>
      <Navbar />
      <div className="pt-16"><TickerTape /></div>
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <span className="badge-soon mb-3">Coming Soon</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '2.1rem', marginTop: '1rem', marginBottom: '0.4rem' }}>
            Trade
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Spot trading · Transparent order book · No front-running
          </p>
        </div>
        <div className="mb-8">
          <PriceChart />
        </div>
        <FeatureGrid features={[
          { icon: <Eye size={28} />, title: 'Transparent Order Book', desc: 'Every order and every match is publicly auditable in real-time. No hidden flow.' },
          { icon: <Zap size={28} />, title: 'Price-Time Priority', desc: 'Orders match by price first, then time. No privileged access, no secret exemptions.' },
          { icon: <ShieldCheck size={28} />, title: 'Open Source Engine', desc: 'The entire matching engine is open for public audit. No black-box execution.' },
        ]} />
        <div className="mt-6">
          <ComingSoon
            title="Trading Engine"
            description="The P4X matching engine is being built with open-source logic, price-time priority, and a fully auditable order book."
            icon={<ArrowLeftRight size={48} />}
          />
        </div>
      </main>
      <Footer />
      <BottomTicker />
    </div>
  )
}

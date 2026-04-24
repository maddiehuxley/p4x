import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TickerTape from '@/components/TickerTape'
import PriceChart from '@/components/PriceChart'
import ComingSoon from '@/components/ComingSoon'
import Footer from '@/components/Footer'
import BottomTicker from '@/components/BottomTicker'
import DashboardStats from '@/components/DashboardStats'
import { Wallet, BarChart2, ArrowLeftRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login?redirect=/dashboard')
  }

  return (
    <div>
      <Navbar />
      <div className="pt-16"><TickerTape /></div>
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '2.1rem', marginBottom: '0.4rem' }}>
            Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Monitor markets · Wallet & trading activation coming soon
          </p>
        </div>
        <DashboardStats />
        <div className="mb-8">
          <PriceChart />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <ComingSoon title="Wallet" description="Deposit and withdraw crypto assets. Full reserve — your funds are always yours." icon={<Wallet size={36} />} />
          <ComingSoon title="Trading" description="Spot trading with a transparent order book. No front-running, no hidden fees." icon={<ArrowLeftRight size={36} />} />
          <ComingSoon title="Portfolio Analytics" description="Track your P&L, exposure, and performance across all positions over time." icon={<BarChart2 size={36} />} />
        </div>
      </main>
      <Footer />
      <BottomTicker />
    </div>
  )
}

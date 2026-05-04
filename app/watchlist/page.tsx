import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import BottomTicker from '@/components/BottomTicker'
import WatchlistClient from '@/components/watchlist/WatchlistClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Watchlist · P4X',
  description: 'Track tokens you care about. Get alerted when prices move.',
}

export default async function WatchlistPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login?redirect=/watchlist')
  }

  return (
    <div>
      <Navbar />
      <div className="pt-16"><TickerTape /></div>
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <WatchlistClient />
      </main>
      <Footer />
      <BottomTicker />
    </div>
  )
}

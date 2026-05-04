import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import TickerTape from '@/components/TickerTape'
import Footer from '@/components/Footer'
import BottomTicker from '@/components/BottomTicker'
import PortfolioClient from '@/components/portfolio/PortfolioClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Portfolio · P4X',
  description: 'View your full crypto portfolio across every major chain. Read-only.',
}

export default async function PortfolioPage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login?redirect=/portfolio')
  }

  return (
    <div>
      <Navbar />
      <div className="pt-16"><TickerTape /></div>
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <PortfolioClient />
      </main>
      <Footer />
      <BottomTicker />
    </div>
  )
}

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Navbar from '@/components/Navbar'
import TickerTape from '@/components/TickerTape'
import Hero from '@/components/Hero'
import Principles from '@/components/Principles'
import MarketTable from '@/components/MarketTable'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import BottomTicker from '@/components/BottomTicker'

export const dynamic = 'force-dynamic'

export default function Home() {
  return (
    <div>
      <Navbar />
      <div className="pt-16"><TickerTape /></div>
      <main>
        <Hero />
        <Principles />
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.4rem' }}>
              Live Markets
            </h2>
            <Link href="/markets" className="flex items-center gap-1 transition-all hover:gap-2"
              style={{ color: 'var(--cyan)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: '0.72rem', fontWeight: 600 }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <MarketTable limit={8} />
        </section>
        <CTA />
      </main>
      <Footer />
      <BottomTicker />
    </div>
  )
}

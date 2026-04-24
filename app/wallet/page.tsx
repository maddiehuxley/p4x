import Navbar from '@/components/Navbar'
import TickerTape from '@/components/TickerTape'
import ComingSoon from '@/components/ComingSoon'
import Footer from '@/components/Footer'
import BottomTicker from '@/components/BottomTicker'
import FeatureGrid from '@/components/FeatureGrid'
import { Wallet, Shield, Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function WalletPage() {
  return (
    <div>
      <Navbar />
      <div className="pt-16"><TickerTape /></div>
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <span className="badge-soon mb-3">Coming Soon</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '2.1rem', marginTop: '1rem', marginBottom: '0.4rem' }}>
            Wallet
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Full-reserve custody · Your assets, cryptographically proven
          </p>
        </div>
        <FeatureGrid features={[
          { icon: <Shield size={28} />, title: 'Full Reserve Custody', desc: 'Every asset you deposit is held 1:1. We never lend or rehypothecate your funds.' },
          { icon: <Lock size={28} />, title: 'Proof of Reserves', desc: 'Cryptographic proof published regularly. Verify that P4X holds what it claims, at any time.' },
          { icon: <Wallet size={28} />, title: 'Multi-Asset Support', desc: 'BTC, ETH, USDC, SOL and more. Withdraw anytime — no lock-ups, no delays.' },
        ]} />
        <div className="mt-6">
          <ComingSoon
            title="Wallet Activation"
            description="Wallets are under development and will launch with full MiCA compliance. Create your account now to be first in line."
            icon={<Wallet size={48} />}
          />
        </div>
      </main>
      <Footer />
      <BottomTicker />
    </div>
  )
}

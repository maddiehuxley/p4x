import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t mt-20 relative z-10" style={{ borderColor: 'var(--border)', paddingBottom: '64px' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Logo variant="cyan" width={110} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: '320px' }}>
              A transparent, full-reserve cryptocurrency exchange built on open-source principles. No fractional reserves. No commingled funds. No FTX.
            </p>
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem', color: 'var(--cyan)', marginBottom: '1rem', textTransform: 'uppercase' }}>Platform</h4>
            {[
              { l: 'Markets', h: '/markets' },
              { l: 'Dashboard', h: '/dashboard' },
              { l: 'Wallet', h: '/wallet' },
              { l: 'Trade', h: '/trade' },
            ].map(item => (
              <div key={item.l} className="mb-2">
                <Link href={item.h} className="footer-link">{item.l}</Link>
              </div>
            ))}
          </div>

          <div>
            <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.18em', fontSize: '0.72rem', color: 'var(--cyan)', marginBottom: '1rem', textTransform: 'uppercase' }}>Principles</h4>
            {['Full Reserve', 'Open Source', 'Proof of Reserves', 'Zero Commingling'].map(l => (
              <div key={l} className="mb-2 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full" style={{ background: 'var(--cyan)', opacity: 0.5 }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
            © 2026 PARACORD EXCHANGE · P4X v0.1.0 BETA
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
            NOT FINANCIAL ADVICE · TRADING COMING SOON
          </span>
        </div>
      </div>
    </footer>
  )
}

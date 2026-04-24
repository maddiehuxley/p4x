'use client'
import { motion } from 'framer-motion'

const stats = [
  { label: 'Portfolio Value', value: '—', sub: 'Connect wallet to view', soon: true },
  { label: 'Open Orders', value: '—', sub: 'Trading not yet live', soon: true },
  { label: 'Total P&L', value: '—', sub: 'Paper trading coming soon', soon: true },
  { label: 'Account Status', value: 'Active', sub: 'Watchlist ready', soon: false },
]

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="glass glass-hover rounded-lg p-5 relative overflow-hidden">
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            {s.label}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', color: s.soon ? 'var(--text-muted)' : 'var(--cyan)', marginBottom: '0.25rem', letterSpacing: '0.02em' }}>
            {s.value}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            {s.sub}
          </div>
          {s.soon && (
            <div className="absolute top-3 right-3">
              <span className="badge-soon">Soon</span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}

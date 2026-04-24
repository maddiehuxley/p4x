'use client'
import { motion } from 'framer-motion'
import { Shield, Eye, Code, Zap } from 'lucide-react'

const principles = [
  { icon: <Shield size={22} />, title: 'Full Reserve', description: 'Every asset is backed 1:1. No fractional reserves. No lending your funds without consent. What you deposit is what exists.' },
  { icon: <Eye size={22} />, title: 'Proof of Reserves', description: "Cryptographic proof that we hold what we claim. Auditable by anyone, anytime. Not just a CEO's word." },
  { icon: <Code size={22} />, title: 'Open Source', description: 'The matching engine, settlement logic, and reserve proofs are open for public audit. No black boxes.' },
  { icon: <Zap size={22} />, title: 'Zero Commingling', description: 'Customer funds and operational funds are structurally separated. The FTX mistake is architectural, not just ethical.' },
]

export default function Principles() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12">
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.9rem', marginBottom: '0.75rem' }}>
          The Anti-FTX Exchange
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto', lineHeight: 1.7, fontSize: '0.9rem' }}>
          Every structural decision P4X makes is a direct response to how FTX failed its users.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {principles.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="glass glass-hover rounded-lg p-6">
            <motion.div
              className="mb-4"
              style={{ color: 'var(--cyan)' }}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}>
              {p.icon}
            </motion.div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.08em', fontSize: '1rem', marginBottom: '0.5rem' }}>
              {p.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.6 }}>
              {p.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

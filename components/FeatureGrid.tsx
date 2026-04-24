'use client'
import { motion } from 'framer-motion'

type Feature = { icon: React.ReactNode; title: string; desc: string }

export default function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          className="glass glass-hover rounded-lg p-6">
          <motion.div
            className="mb-4"
            style={{ color: 'var(--cyan)' }}
            whileHover={{ scale: 1.1, rotate: 3 }}
            transition={{ type: 'spring', stiffness: 300 }}>
            {f.icon}
          </motion.div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>{f.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}

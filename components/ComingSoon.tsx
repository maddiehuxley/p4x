'use client'
import { motion } from 'framer-motion'

export default function ComingSoon({ title, description, icon }: {
  title: string; description: string; icon: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="glass rounded-lg p-8 flex flex-col items-center justify-center text-center min-h-64 relative overflow-hidden scanline">
      <div className="absolute inset-0 pointer-events-none opacity-60"
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,207,255,0.08) 0%, transparent 70%)' }} />
      <div className="relative z-10">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-4 flex justify-center"
          style={{ color: 'var(--cyan)', opacity: 0.5 }}>
          {icon}
        </motion.div>
        <div className="badge-soon mb-3">Coming Soon</div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '280px', lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

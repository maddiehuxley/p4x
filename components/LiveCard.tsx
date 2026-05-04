'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function LiveCard({ title, description, icon, href }: {
  title: string; description: string; icon: React.ReactNode; href: string
}) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -2 }}
        className="glass glass-hover rounded-lg p-8 flex flex-col items-center justify-center text-center min-h-64 relative overflow-hidden cursor-pointer">
        <div className="absolute inset-0 pointer-events-none opacity-60"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,207,255,0.12) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <div className="mb-4 flex justify-center" style={{ color: 'var(--cyan)' }}>
            {icon}
          </div>
          <div className="badge-live mb-3">Live</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.1em', fontSize: '1.15rem', marginBottom: '0.5rem' }}>
            {title}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', maxWidth: '280px', lineHeight: 1.6, marginBottom: '0.75rem' }}>
            {description}
          </p>
          <div className="inline-flex items-center gap-1.5" style={{ color: 'var(--cyan)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Open <ArrowRight size={11} />
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        className="glass rounded-lg p-10 md:p-14 text-center relative overflow-hidden scanline">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(0,207,255,0.1) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <span className="badge-soon mb-4">Early Access</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.03em', fontSize: '2.1rem', marginBottom: '1rem', marginTop: '1rem' }}>
            Be First When Trading Goes Live
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 2rem', lineHeight: 1.7, fontSize: '0.9rem' }}>
            Create your account now and get notified the moment wallets and trading are available.
          </p>
          <Link href="/auth/signup" className="btn-cyan px-8 py-3.5 rounded text-xs inline-flex items-center gap-2">
            Create Free Account <ArrowRight size={15} />
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

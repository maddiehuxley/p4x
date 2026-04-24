'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 md:py-32 text-center relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0,207,255,0.12) 0%, transparent 65%)' }} />
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <span className="badge-soon mb-6">Beta · Trading Coming Soon</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
          style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.02em', lineHeight: 1.02, marginBottom: '1.5rem' }}
          className="text-4xl md:text-6xl lg:text-7xl mt-6">
          <span style={{ color: 'var(--text-primary)' }}>The Exchange</span>
          <br />
          <motion.span
            style={{
              backgroundImage: 'linear-gradient(90deg, var(--cyan) 0%, var(--cyan-bright) 50%, var(--cyan) 100%)',
              backgroundSize: '200% auto',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            animate={{ backgroundPosition: ['0% center', '200% center'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
            Built Different.
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ color: 'var(--text-secondary)', fontSize: '1.08rem', maxWidth: '540px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          Paracord Exchange is what crypto trading should have always been — transparent, fully reserved, and open to audit. Built after FTX so that never happens again.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signup" className="btn-cyan px-8 py-3.5 rounded text-xs flex items-center justify-center gap-2">
            Create Account <ArrowRight size={15} />
          </Link>
          <Link href="/markets" className="btn-outline px-8 py-3.5 rounded text-xs flex items-center justify-center gap-2">
            View Markets <ChevronRight size={15} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

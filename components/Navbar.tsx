'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut } from 'lucide-react'
import Logo from './Logo'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

const navLinks = [
  { href: '/markets', label: 'Markets' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/wallet', label: 'Wallet', soon: true },
  { href: '/trade', label: 'Trade', soon: true },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(3, 10, 24, 0.85)' : 'rgba(3, 10, 24, 0.4)',
        backdropFilter: 'blur(24px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.4)',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
      }}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Logo variant="cyan" width={80} priority />
          </motion.div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}>
              <Link href={link.href}
                className="relative px-4 py-2 flex items-center gap-2 transition-colors"
                style={{
                  color: pathname === link.href ? 'var(--cyan)' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontSize: '0.75rem',
                }}>
                {link.label}
                {link.soon && <span className="badge-soon">Soon</span>}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5"
                    style={{ background: 'var(--cyan)', boxShadow: '0 0 12px var(--cyan)' }}
                  />
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                {user.email}
              </span>
              <button onClick={handleLogout}
                className="btn-outline px-4 py-2 text-xs rounded flex items-center gap-2">
                <LogOut size={12} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn-outline px-5 py-2 text-xs rounded">Sign In</Link>
              <Link href="/auth/signup" className="btn-cyan px-5 py-2 text-xs rounded">Get Started</Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} style={{ color: 'var(--cyan)' }}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden"
            style={{ background: 'rgba(3, 10, 24, 0.95)', borderTop: '1px solid var(--border)' }}>
            <div className="px-6 py-4 flex flex-col gap-3">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                  className="flex items-center justify-between py-2"
                  style={{
                    color: pathname === link.href ? 'var(--cyan)' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.1em',
                    textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 600
                  }}>
                  {link.label}
                  {link.soon && <span className="badge-soon">Soon</span>}
                </Link>
              ))}
              <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                {user ? (
                  <button onClick={handleLogout} className="btn-outline flex-1 py-2 text-xs rounded">Sign Out</button>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setOpen(false)} className="btn-outline flex-1 text-center py-2 text-xs rounded">Sign In</Link>
                    <Link href="/auth/signup" onClick={() => setOpen(false)} className="btn-cyan flex-1 text-center py-2 text-xs rounded">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

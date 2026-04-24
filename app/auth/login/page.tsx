'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import Logo from '@/components/Logo'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  const redirectTo = params.get('redirect') || '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!isSupabaseConfigured()) {
      setError('Authentication is not configured yet. Please set up Supabase environment variables.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(0,207,255,0.1) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10">
        <Link href="/" className="flex items-center justify-center mb-10">
          <Logo variant="cyan" width={140} priority />
        </Link>

        <div className="glass rounded-xl p-8 scanline">
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.5rem', marginBottom: '0.4rem', textAlign: 'center' }}>
            Sign In
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', marginBottom: '2rem' }}>
            Welcome back to Paracord Exchange
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                Email
              </label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-p4x px-4 py-3 rounded text-sm" />
            </div>

            <div>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '0.18em', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.4rem' }}>
                Password
              </label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-p4x px-4 py-3 rounded text-sm pr-10" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-sm px-3 py-2 rounded overflow-hidden"
                style={{ background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading}
              className="btn-cyan w-full py-3 rounded text-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-60">
              {loading ? 'Signing in...' : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              No account?{' '}
              <Link href="/auth/signup" style={{ color: 'var(--cyan)' }}>Create one</Link>
            </span>
          </div>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.65rem', textAlign: 'center', marginTop: '1.5rem', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
          FULL RESERVE · OPEN SOURCE · P4X
        </p>
      </motion.div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginForm />
    </Suspense>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react'
import Logo from '@/components/Logo'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

const requirements = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p: string) => /[0-9]/.test(p) },
]

export default function Signup() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
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

    if (!requirements.every(r => r.test(password))) {
      setError('Password does not meet requirements.')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
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
          {success ? (
            <div className="text-center py-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(0, 207, 255, 0.1)', border: '1px solid var(--cyan)' }}>
                <Check size={28} color="var(--cyan)" />
              </motion.div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.4rem', marginBottom: '0.6rem' }}>
                Check your email
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                We sent a verification link to <span style={{ color: 'var(--cyan)' }}>{email}</span>. Click it to activate your account.
              </p>
              <Link href="/auth/login" className="btn-outline px-6 py-2.5 rounded text-xs inline-block">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.06em', fontSize: '1.5rem', marginBottom: '0.4rem', textAlign: 'center' }}>
                Create Account
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', textAlign: 'center', marginBottom: '2rem' }}>
                Join the transparent exchange
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
                    Username
                  </label>
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="satoshi" minLength={3}
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

                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 flex flex-col gap-1">
                      {requirements.map(r => {
                        const met = r.test(password)
                        return (
                          <div key={r.label} className="flex items-center gap-2">
                            <motion.div
                              animate={{ scale: met ? [1, 1.2, 1] : 1 }}
                              className="w-3 h-3 rounded-full flex items-center justify-center"
                              style={{ background: met ? 'var(--green)' : 'var(--border)' }}>
                              {met && <Check size={8} color="#030a18" strokeWidth={3} />}
                            </motion.div>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: met ? 'var(--green)' : 'var(--text-muted)', letterSpacing: '0.05em' }}>
                              {r.label}
                            </span>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
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
                  {loading ? 'Creating account...' : <><span>Create Account</span><ArrowRight size={15} /></>}
                </button>
              </form>

              <div className="mt-6 text-center">
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                  Already have an account?{' '}
                  <Link href="/auth/login" style={{ color: 'var(--cyan)' }}>Sign in</Link>
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

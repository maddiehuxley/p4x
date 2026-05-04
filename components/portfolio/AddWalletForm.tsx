'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X } from 'lucide-react'
import { detectAddressCategory } from '@/lib/chains/registry'

export default function AddWalletForm({ onAdded }: { onAdded: () => void }) {
  const [address, setAddress] = useState('')
  const [label, setLabel] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const detected = address ? detectAddressCategory(address) : null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!address.trim()) return setError('Address required')
    if (!detected) return setError('Address format not recognized')

    setSubmitting(true)
    try {
      const res = await fetch('/api/portfolio/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), label: label.trim() || null }),
      })
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to add wallet')
      } else {
        setAddress('')
        setLabel('')
        setOpen(false)
        onAdded()
      }
    } catch (err: any) {
      setError(err.message ?? 'Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-cyan px-5 py-2 text-xs rounded flex items-center gap-2"
      >
        <Plus size={12} /> Add Wallet
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(3, 10, 24, 0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpen(false)}
          >
            <motion.form
              initial={{ y: 20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              onSubmit={submit}
              onClick={(e) => e.stopPropagation()}
              className="glass w-full max-w-md p-6 rounded-lg"
              style={{ boxShadow: '0 20px 60px rgba(0, 207, 255, 0.08)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                    Add Wallet
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.25rem' }}>
                    Read-only · P4X never has access to your funds
                  </p>
                </div>
                <button type="button" onClick={() => setOpen(false)} style={{ color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x... or bc1... or Solana address"
                className="input-p4x w-full px-3 py-2.5 rounded text-sm"
                style={{ fontFamily: 'var(--font-mono)' }}
              />
              {detected && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em' }}>
                  ▸ DETECTED: {detected.toUpperCase()}
                </div>
              )}

              <label style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.5rem', marginTop: '1rem', fontFamily: 'var(--font-mono)' }}>
                Label <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Main wallet"
                maxLength={60}
                className="input-p4x w-full px-3 py-2.5 rounded text-sm"
              />

              {error && (
                <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', fontSize: '0.78rem', color: 'var(--red)', background: 'rgba(255, 51, 102, 0.08)', border: '1px solid rgba(255, 51, 102, 0.25)', borderRadius: '4px' }}>
                  {error}
                </div>
              )}

              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-outline flex-1 py-2.5 text-xs rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !detected}
                  className="btn-cyan flex-1 py-2.5 text-xs rounded disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Adding…' : 'Add Wallet'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'P4X — Paracord Exchange',
  description: 'A transparent, full-reserve cryptocurrency exchange. Built on trust, not promises.',
  icons: { icon: '/favicon.svg' },
  openGraph: {
    title: 'P4X — Paracord Exchange',
    description: 'A transparent, full-reserve cryptocurrency exchange.',
    type: 'website',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

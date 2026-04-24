import Image from 'next/image'

type Variant = 'cyan' | 'cyan-on-white' | 'card-cyan' | 'card-white'

const sources: Record<Variant, string> = {
  'cyan': '/logos/logo-cyan.png',
  'cyan-on-white': '/logos/logo-cyan-white.png',
  'card-cyan': '/logos/card-cyan.png',
  'card-white': '/logos/card-white-cyan.png',
}

export default function Logo({
  variant = 'cyan',
  width = 120,
  className = '',
  priority = false,
}: {
  variant?: Variant
  width?: number
  className?: string
  priority?: boolean
}) {
  const isCard = variant.startsWith('card')
  const height = isCard ? width : Math.round(width / 2.5)

  return (
    <Image
      src={sources[variant]}
      alt="P4X — Paracord Exchange"
      width={width}
      height={height}
      className={className}
      priority={priority}
      style={{ objectFit: 'contain' }}
    />
  )
}

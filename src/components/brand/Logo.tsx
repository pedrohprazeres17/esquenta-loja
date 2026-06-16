import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'wordmark' | 'monogram'
  className?: string
  linkTo?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizes = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-8xl',
}

function LogoInner({ variant = 'wordmark', className, size = 'md' }: Omit<LogoProps, 'linkTo'>) {
  if (variant === 'monogram') {
    return (
      <span
        className={cn('font-display uppercase tracking-tight leading-none', sizes[size], className)}
        style={{ fontFamily: 'Anton, sans-serif', letterSpacing: '-0.025em' }}
      >
        E<span style={{ color: 'var(--vermelho)' }}>·</span>Z
      </span>
    )
  }

  return (
    <span
      className={cn('font-display uppercase leading-none', sizes[size], className)}
      style={{ fontFamily: 'Anton, sans-serif', letterSpacing: '-0.025em' }}
    >
      ESQUE<span style={{ color: 'var(--vermelho)' }}>N</span>TA.
    </span>
  )
}

export function Logo({ linkTo = '/', ...props }: LogoProps) {
  return (
    <Link to={linkTo} className="hover:opacity-90 transition-opacity">
      <LogoInner {...props} />
    </Link>
  )
}

export function LogoStatic(props: Omit<LogoProps, 'linkTo'>) {
  return <LogoInner {...props} />
}

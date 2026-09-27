import { cn } from '@/lib/utils'
import globo from '@/assets/brand/globo.svg'

// Elementos do manual. Entram um de cada vez.

/* Estrela: a faísca do nome. Pontua título, lacre e canto de peça. */
export function Estrela({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 1000" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M220 500L463.2 463.2L500 30L536.8 463.2L780 500L536.8 536.8L500 970L463.2 536.8Z" />
    </svg>
  )
}

/* Globo: envio pro Brasil todo. Arquivo oficial, em marinho. */
export function Globo({ className }: { className?: string }) {
  return <img src={globo} alt="" aria-hidden="true" className={cn('block h-auto', className)} />
}

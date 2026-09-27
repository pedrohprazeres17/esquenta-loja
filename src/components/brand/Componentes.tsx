import { cn } from '@/lib/utils'

// Componentes do manual: informação com cara de etiqueta técnica.

/* Selo 18+: em toda embalagem e todo anúncio. */
export function Selo18({ className }: { className?: string }) {
  return (
    <span
      className={cn('t-num inline-block border-[1.5px] border-current px-1.5 pb-[3px] pt-1 text-[10px] leading-none', className)}
      title="Venda para maiores de 18 anos"
    >
      18+
    </span>
  )
}

/* Lote: três dígitos, sempre. */
export function Lote({ numero, total, className }: { numero: number; total: number; className?: string }) {
  const tres = (n: number) => String(n).padStart(3, '0')
  return (
    <span className={cn('t-label whitespace-nowrap text-[10px]', className)}>
      LOTE {tres(numero)} / {tres(total)}
    </span>
  )
}

/* Mira: marca os cantos em L. Nunca fecha o quadrado. */
export function Mira({ children, className }: { children: React.ReactNode; className?: string }) {
  const canto = 'pointer-events-none absolute h-6 w-6 border-cobalto'
  return (
    <div className={cn('relative', className)}>
      {children}
      <span aria-hidden="true" className={cn(canto, 'left-0 top-0 border-l-2 border-t-2')} />
      <span aria-hidden="true" className={cn(canto, 'right-0 top-0 border-r-2 border-t-2')} />
      <span aria-hidden="true" className={cn(canto, 'bottom-0 left-0 border-b-2 border-l-2')} />
      <span aria-hidden="true" className={cn(canto, 'bottom-0 right-0 border-b-2 border-r-2')} />
    </div>
  )
}

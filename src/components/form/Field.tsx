import { cn } from '@/lib/utils'

// Campo de formulário: rótulo em Michroma, input dentro do label (associação implícita).
export function Field({
  label,
  error,
  className,
  children,
}: {
  label: string
  error?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error block">{error}</span>}
    </label>
  )
}

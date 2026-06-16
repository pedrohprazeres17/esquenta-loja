import { cn } from '@/lib/utils'

interface FitaObraProps {
  variant?: 'vermelho' | 'amarelo'
  height?: string
  className?: string
  text?: string
}

export function FitaObra({
  variant = 'vermelho',
  height = '48px',
  text,
  className,
}: FitaObraProps) {
  return (
    <div
      className={cn('w-full flex items-center overflow-hidden relative', className)}
      style={{
        height,
        background:
          variant === 'vermelho'
            ? 'repeating-linear-gradient(-45deg, #0E0D0B 0px, #0E0D0B 20px, #FF2A1F 20px, #FF2A1F 40px)'
            : 'repeating-linear-gradient(-45deg, #0E0D0B 0px, #0E0D0B 20px, #FFE800 20px, #FFE800 40px)',
      }}
    >
      {text && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: '13px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#E8E1D2',
              textShadow: '1px 1px 0 #0E0D0B',
            }}
          >
            {text}
          </span>
        </div>
      )}
    </div>
  )
}

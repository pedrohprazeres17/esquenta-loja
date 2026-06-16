import { cn } from '@/lib/utils'

interface CarimboProps {
  text?: string
  size?: number
  rotation?: number
  color?: string
  className?: string
}

export function Carimbo({
  text = 'APROVADO NO ROLE',
  size = 100,
  rotation = -4,
  color = 'var(--vermelho)',
  className,
}: CarimboProps) {
  const radius = size * 0.36

  return (
    <div
      className={cn('inline-block pointer-events-none select-none', className)}
      style={{ transform: `rotate(${rotation}deg)`, width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* outer ring */}
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="none" stroke={color} strokeWidth="2" />
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 8} fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" />

        {/* curved text */}
        <defs>
          <path
            id="carimbo-arc"
            d={`M ${size / 2 - radius},${size / 2} a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          />
        </defs>
        <text fill={color} style={{ fontFamily: 'Anton, sans-serif', fontSize: size * 0.11 }}>
          <textPath href="#carimbo-arc" startOffset="0%">
            {text} ★ {text} ★{' '}
          </textPath>
        </text>

        {/* center star */}
        <text
          x={size / 2}
          y={size / 2 + size * 0.07}
          textAnchor="middle"
          fill={color}
          style={{ fontFamily: 'Anton, sans-serif', fontSize: size * 0.22 }}
        >
          ★
        </text>
      </svg>
    </div>
  )
}

/* badge "N.º 001 / 500" pra edições limitadas */
export function EdicaoLimitada({
  numero,
  total,
  className,
}: {
  numero: number
  total: number
  className?: string
}) {
  return (
    <span
      className={cn('inline-block border px-2 py-0.5', className)}
      style={{
        fontFamily: 'Space Mono, monospace',
        fontSize: '11px',
        borderColor: 'var(--amarelo)',
        color: 'var(--amarelo)',
        letterSpacing: '0.05em',
      }}
    >
      N.º {String(numero).padStart(3, '0')} / {String(total).padStart(3, '0')}
    </span>
  )
}

/* badge "+18" */
export function Badge18({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-block border-2 px-1.5 py-0.5 text-xs font-bold', className)}
      style={{
        fontFamily: 'Anton, sans-serif',
        borderColor: 'var(--vermelho)',
        color: 'var(--vermelho)',
        fontSize: '11px',
        lineHeight: 1.2,
      }}
    >
      +18
    </span>
  )
}

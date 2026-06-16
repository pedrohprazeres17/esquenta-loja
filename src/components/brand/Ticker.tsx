interface TickerProps {
  text?: string
  speed?: number
  bg?: string
  color?: string
  height?: string
}

export function Ticker({
  text = 'ESQUENTA · DROP 001 · DISPONIVEL · A SEXTA NAO ESPERA · ',
  bg = 'var(--preto)',
  color = 'var(--papel)',
  height = '40px',
}: TickerProps) {
  const repeated = text.repeat(6)

  return (
    <div
      className="overflow-hidden w-full flex items-center border-b-2"
      style={{
        backgroundColor: bg,
        height,
        borderColor: 'var(--vermelho)',
        borderBottomWidth: '2px',
      }}
    >
      <div className="ticker-track">
        {[repeated, repeated].map((t, i) => (
          <span
            key={i}
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: '13px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color,
              whiteSpace: 'nowrap',
              paddingRight: '0.5rem',
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

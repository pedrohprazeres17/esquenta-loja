import { Link } from 'react-router-dom'
import { LogoStatic } from '@/components/brand'
import { FitaObra } from '@/components/brand'

export function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--preto)', borderTop: '2px solid var(--vermelho)' }}>
      <FitaObra height="8px" />

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <LogoStatic size="md" />
          <p className="font-mono text-sm" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>
            A loja da festa adulta brasileira.
          </p>
          <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}>
            ESQUENTA® · EST. 2026 · BR
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <h4
            className="font-display uppercase text-sm mb-2"
            style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)', letterSpacing: '0.1em' }}
          >
            NAVEGACAO
          </h4>
          {[
            { to: '/loja', label: 'Loja' },
            { to: '/manifesto', label: 'Manifesto' },
            { to: '/conta', label: 'Minha conta' },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="font-mono text-sm hover:text-vermelho transition-colors"
              style={{ color: 'var(--papel)' }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Policies */}
        <div className="flex flex-col gap-3">
          <h4
            className="font-display uppercase text-sm mb-2"
            style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)', letterSpacing: '0.1em' }}
          >
            LEGAL
          </h4>
          <p className="font-mono text-sm" style={{ color: 'var(--papel)' }}>
            Ressaca devolve em 7 dias.
          </p>
          <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
            Frete gratis pra Brasil acima de R$ 150.
          </p>
          <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}>
            Conteudo adulto. Venda proibida a menores de 18 anos.
          </p>
        </div>
      </div>

      <div
        className="border-t px-4 py-4 text-center"
        style={{ borderColor: 'color-mix(in srgb, var(--papel) 15%, transparent)' }}
      >
        <p
          className="font-mono text-xs"
          style={{ color: 'color-mix(in srgb, var(--papel) 35%, transparent)' }}
        >
          ESQUENTA® · EST. 2026 · FEITO NO BRASIL · TODOS OS DIREITOS RESERVADOS
        </p>
      </div>
    </footer>
  )
}

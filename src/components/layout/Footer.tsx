import { Link } from 'react-router-dom'
import { LogoStatic, Selo18 } from '@/components/brand'
import { CATEGORIES } from '@/lib/categories'

export function Footer() {
  return (
    <footer className="bg-cobalto text-branco">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:py-16">
        <div>
          <LogoStatic versao="branco" className="w-[220px]" />
          <p className="t-display mt-8 text-2xl">A sexta começa antes.</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-branco/75">
            Jogos e acessórios pro pré. Envio pro Brasil todo.
          </p>
        </div>

        <FooterCol titulo="Loja">
          <FooterLink to="/loja">Tudo</FooterLink>
          {CATEGORIES.map(c => (
            <FooterLink key={c.value} to={`/loja?categoria=${c.value}`}>{c.label}</FooterLink>
          ))}
        </FooterCol>

        <FooterCol titulo="Conta">
          <FooterLink to="/conta">Entrar</FooterLink>
          <FooterLink to="/carrinho">Carrinho</FooterLink>
          <FooterLink to="/sobre">Sobre a Spark</FooterLink>
        </FooterCol>

        <FooterCol titulo="Compra">
          <p className="text-sm text-branco">7 dias pra devolver. Sem pergunta.</p>
          <p className="text-sm text-branco/75">Frete grátis acima de R$ 150.</p>
          <p className="text-sm text-branco/75">5% off no PIX.</p>
        </FooterCol>
      </div>

      <div className="border-t border-branco/20">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="t-label text-[10px] text-branco/70">Spark · Est. 2026</p>
          <p className="flex items-center gap-3 text-xs text-branco/70">
            <Selo18 className="text-branco" />
            Venda só pra maiores de 18. A Spark não vende bebida.
          </p>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="t-label mb-1 text-[10px] text-branco/60">{titulo}</h2>
      {children}
    </div>
  )
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="w-fit text-sm text-branco transition-opacity hover:opacity-70">
      {children}
    </Link>
  )
}

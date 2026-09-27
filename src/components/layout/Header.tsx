import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ShoppingBag, Menu, X, User } from 'lucide-react'
import { Logo } from '@/components/brand'
import { useCart } from '@/contexts/CartContext'
import { cn } from '@/lib/utils'

const navLinks = [
  { to: '/loja', label: 'Loja' },
  { to: '/loja?categoria=kits', label: 'Kits' },
  { to: '/sobre', label: 'Sobre' },
]

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const location = useLocation()

  // "Kits" é a loja filtrada; o NavLink não olha a query, então o ativo é calculado aqui.
  const isActive = (to: string) => {
    const [path, query] = to.split('?')
    if (location.pathname !== path) return false
    const atual = new URLSearchParams(location.search).get('categoria')
    const alvo = new URLSearchParams(query).get('categoria')
    return alvo ? atual === alvo : atual !== 'kits'
  }

  return (
    <header className="sticky top-0 z-50 bg-cobalto text-branco">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Logo versao="branco" />

        <nav className="hidden items-center gap-9 md:flex" aria-label="Principal">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              aria-current={isActive(to) ? 'page' : undefined}
              className={cn(
                't-label border-b-2 py-1 transition-colors',
                isActive(to) ? 'border-branco text-branco' : 'border-transparent text-branco/75 hover:text-branco',
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <Link to="/conta" className="hidden text-branco/80 transition-colors hover:text-branco md:block" aria-label="Minha conta">
            <User size={20} strokeWidth={1.5} />
          </Link>

          <Link
            to="/carrinho"
            className="t-label flex items-center gap-2 text-branco transition-opacity hover:opacity-80"
            aria-label={`Carrinho, ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
          >
            <ShoppingBag size={19} strokeWidth={1.5} className="md:hidden" />
            <span className="hidden md:inline">Carrinho</span>
            <span className="t-num">({itemCount})</span>
          </Link>

          <button
            className="text-branco md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="flex flex-col border-t border-branco/20 px-4 pb-6 pt-2 md:hidden" aria-label="Menu">
          {[...navLinks, { to: '/conta', label: 'Minha conta' }].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="t-label border-b border-branco/15 py-4 text-branco"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

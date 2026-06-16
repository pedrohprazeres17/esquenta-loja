import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ShoppingCart, Menu, X, User } from 'lucide-react'
import { Logo } from '@/components/brand'
import { useCart } from '@/contexts/CartContext'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount } = useCart()

  const navLinks = [
    { to: '/loja', label: 'LOJA' },
    { to: '/manifesto', label: 'MANIFESTO' },
  ]

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `font-mono text-sm uppercase tracking-wider hover:text-vermelho transition-colors ${isActive ? 'text-vermelho' : 'text-papel'}`

  return (
    <header
      className="sticky top-0 z-50 border-b-2"
      style={{
        backgroundColor: 'var(--preto)',
        borderColor: 'var(--vermelho)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Logo size="sm" />

        {/* Nav desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to} className={navClass}>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/conta"
            className="hidden md:flex items-center gap-1 text-papel hover:text-vermelho transition-colors"
            aria-label="Minha conta"
          >
            <User size={20} strokeWidth={1.5} />
          </Link>

          <Link
            to="/carrinho"
            className="relative flex items-center gap-1 text-papel hover:text-vermelho transition-colors"
            aria-label="Carrinho"
          >
            <ShoppingCart size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs"
                style={{
                  backgroundColor: 'var(--vermelho)',
                  color: 'var(--papel)',
                  fontFamily: 'Anton, sans-serif',
                  fontSize: '11px',
                }}
              >
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-papel hover:text-vermelho transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div
          className="md:hidden border-t-2 px-4 py-6 flex flex-col gap-6"
          style={{ backgroundColor: 'var(--preto)', borderColor: 'var(--vermelho)' }}
        >
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={navClass}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <Link
            to="/conta"
            className="font-mono text-sm uppercase tracking-wider text-papel hover:text-vermelho transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            MINHA CONTA
          </Link>
        </div>
      )}
    </header>
  )
}

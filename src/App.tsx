import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { CartProvider } from '@/contexts/CartContext'
import { Layout } from '@/components/layout'
import { Home } from '@/pages/Home'
import { Loja } from '@/pages/Loja'
import { Produto } from '@/pages/Produto'
import { Carrinho } from '@/pages/Carrinho'
import { Checkout } from '@/pages/Checkout'
import { Conta } from '@/pages/Conta'
import { Manifesto } from '@/pages/Manifesto'
import { Admin } from '@/pages/Admin'

export default function App() {
  return (
    <CartProvider>
      <HashRouter>
        <Routes>
          <Route path="/admin" element={<Admin />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/produto/:slug" element={<Produto />} />
            <Route path="/carrinho" element={<Carrinho />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/conta" element={<Conta />} />
            <Route path="/conta/login" element={<Conta />} />
            <Route path="/manifesto" element={<Manifesto />} />
            <Route path="*" element={
              <div className="max-w-2xl mx-auto px-4 py-32 text-center">
                <h1 className="section-title text-6xl mb-4" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>404.</h1>
                <p className="font-mono mb-8" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>Pagina nao encontrada.</p>
                <Link to="/" className="btn btn-primary">VOLTAR PRA HOME</Link>
              </div>
            } />
          </Route>
        </Routes>
      </HashRouter>
    </CartProvider>
  )
}

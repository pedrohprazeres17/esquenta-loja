import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { CartProvider } from '@/contexts/CartContext'
import { Layout } from '@/components/layout'
import { Home } from '@/pages/Home'
import { Loja } from '@/pages/Loja'
import { Produto } from '@/pages/Produto'
import { Carrinho } from '@/pages/Carrinho'
import { Checkout } from '@/pages/Checkout'
import { Conta } from '@/pages/Conta'
import { Sobre } from '@/pages/Sobre'
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
            <Route path="/sobre" element={<Sobre />} />
            {/* Link antigo da ESQUENTA. */}
            <Route path="/manifesto" element={<Navigate to="/sobre" replace />} />
            <Route path="*" element={
              <div className="mx-auto max-w-2xl px-4 py-28 text-center">
                <p className="t-label text-cobalto">Erro 404</p>
                <h1 className="t-display mt-4 text-[clamp(2.4rem,6vw,4rem)] text-marinho">Página não encontrada.</h1>
                <Link to="/loja" className="btn btn-primary mt-10">Ver jogos</Link>
              </div>
            } />
          </Route>
        </Routes>
      </HashRouter>
    </CartProvider>
  )
}

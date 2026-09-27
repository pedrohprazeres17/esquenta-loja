import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  const { pathname } = useLocation()

  // Troca de página começa no topo (o HashRouter não faz isso sozinho).
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <InfoBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function InfoBar() {
  return (
    <div className="bg-marinho text-branco/85">
      <div className="t-label mx-auto flex h-9 max-w-7xl items-center justify-center gap-8 px-4 text-[10px] sm:px-6 md:justify-between">
        <span className="hidden md:inline">Envio pro Brasil todo</span>
        <span>Frete grátis acima de R$ 150</span>
        <span className="hidden md:inline">5% off no PIX</span>
      </div>
    </div>
  )
}

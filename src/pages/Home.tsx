import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FitaObra, Carimbo } from '@/components/brand'
import { ProductCard } from '@/components/product/ProductCard'
import { getFeaturedProducts } from '@/data/products'
import type { Product } from '@/types'

export function Home() {
  const [featured, setFeatured] = useState<Product[]>([])

  useEffect(() => {
    getFeaturedProducts().then(setFeatured)
  }, [])

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section
        className="grain relative min-h-[90vh] flex flex-col justify-end px-6 md:px-16 pb-16 pt-32 overflow-hidden"
        style={{ backgroundColor: 'var(--preto)' }}
      >
        {/* decorative diagonal */}
        <div
          className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(-45deg, #FF2A1F 0px, #FF2A1F 2px, transparent 2px, transparent 30px)',
          }}
        />

        {/* big headline */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <p
            className="font-mono text-sm uppercase mb-4"
            style={{ color: 'var(--vermelho)', letterSpacing: '0.2em' }}
          >
            DROP 001 · DISPONIVEL AGORA
          </p>
          <h1
            className="section-title"
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(4rem, 14vw, 12rem)',
              color: 'var(--papel)',
              lineHeight: 0.9,
              letterSpacing: '-0.025em',
            }}
          >
            ESQUENTA<span style={{ color: 'var(--vermelho)' }}>.</span>
          </h1>
          <h1
            className="section-title"
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(4rem, 14vw, 12rem)',
              color: 'var(--papel)',
              lineHeight: 0.9,
              letterSpacing: '-0.025em',
            }}
          >
            AI.
          </h1>

          <p
            className="font-mono mt-8 max-w-md"
            style={{ fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', color: 'color-mix(in srgb, var(--papel) 75%, transparent)', lineHeight: 1.6 }}
          >
            A gente puxa o resto.
            <br />
            Cartas, copo, kit. Pre-game resolvido.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link to="/loja" className="btn btn-primary btn-lg">
              VER DROP
            </Link>
            <Link to="/manifesto" className="btn btn-outline btn-lg">
              MANIFESTO
            </Link>
          </div>
        </div>
      </section>

      {/* ── FITA ─────────────────────────────────────────────── */}
      <FitaObra text="FITA DE OBRA · CUIDADO · ROLE ADULTO" height="56px" />

      {/* ── FEATURED PRODUCTS ────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2
            className="section-title"
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              color: 'var(--papel)',
            }}
          >
            DROP 001
          </h2>
          <Link to="/loja" className="btn btn-outline btn-sm hidden md:flex">
            VER TUDO
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map((product, i) => (
            <div key={product.id} className="relative">
              {i === 0 && (
                <div className="absolute -top-3 -right-3 z-10">
                  <Carimbo size={80} />
                </div>
              )}
              <ProductCard product={product} featured />
            </div>
          ))}
        </div>

        <div className="flex md:hidden justify-center mt-8">
          <Link to="/loja" className="btn btn-outline">VER TUDO</Link>
        </div>
      </section>

      {/* ── FITA AMARELA ─────────────────────────────────────── */}
      <FitaObra variant="amarelo" height="8px" />

      {/* ── MANIFESTO CURTO ──────────────────────────────────── */}
      <section
        className="grain relative py-24 px-6 text-center overflow-hidden"
        style={{ backgroundColor: 'var(--papel)' }}
      >
        <div className="max-w-3xl mx-auto relative z-10">
          <p
            className="font-mono text-sm uppercase mb-6"
            style={{ color: 'var(--vinho)', letterSpacing: '0.2em' }}
          >
            ★ EST · 2026 · BR ★
          </p>
          <h2
            className="section-title mb-8"
            style={{
              fontFamily: 'Anton, sans-serif',
              fontSize: 'clamp(2rem, 6vw, 4.5rem)',
              color: 'var(--preto)',
              lineHeight: 0.95,
            }}
          >
            A GENTE NAO VENDE FESTA. A GENTE ESQUENTA.
          </h2>
          <p
            className="font-mono mb-10"
            style={{ color: 'var(--preto)', lineHeight: 1.8, fontSize: '1rem' }}
          >
            Curadoria, nao catalogo. Marca brasileira sem sotaque de gringa.
            Feita pra ser filmada, compartilhada e jogada ate o fim.
          </p>
          <Link to="/manifesto" className="btn btn-secondary">
            LER MANIFESTO COMPLETO
          </Link>
        </div>
      </section>

      {/* ── FITA ─────────────────────────────────────────────── */}
      <FitaObra height="8px" />

      {/* ── CTA FINAL ────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center grain relative" style={{ backgroundColor: 'var(--preto)' }}>
        <p className="font-mono text-sm uppercase mb-4" style={{ color: 'var(--vermelho)', letterSpacing: '0.2em' }}>
          ENTRAR NA LISTA
        </p>
        <h3
          className="section-title mb-10"
          style={{
            fontFamily: 'Anton, sans-serif',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            color: 'var(--papel)',
          }}
        >
          PROXIMO DROP EM BREVE.
        </h3>
        <form
          className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto border-2"
          style={{ borderColor: 'var(--papel)' }}
          onSubmit={e => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="seu@email.com"
            className="flex-1 border-0 border-r-0"
            style={{ background: 'var(--preto)', color: 'var(--papel)', borderRight: 'none' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: 0, border: 'none', boxShadow: 'none' }}
          >
            ENTRAR
          </button>
        </form>
        <p className="font-mono text-xs mt-4" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}>
          Sem spam. So quando tiver novidade de verdade.
        </p>
      </section>
    </div>
  )
}

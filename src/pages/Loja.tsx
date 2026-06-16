import { useEffect, useState } from 'react'
import type { Product, ProductCategory } from '@/types'
import { getAllProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'
import { FitaObra } from '@/components/brand'

const categories: { value: ProductCategory | 'todos'; label: string }[] = [
  { value: 'todos', label: 'TUDO' },
  { value: 'cartas', label: 'CARTAS' },
  { value: 'beer-pong', label: 'BEER PONG' },
  { value: 'copos', label: 'COPOS' },
  { value: 'kits', label: 'KITS' },
  { value: 'acessorios', label: 'ACESSORIOS' },
]

export function Loja() {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'todos'>('todos')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filtered =
    activeCategory === 'todos'
      ? products
      : products.filter(p => p.category === activeCategory)

  return (
    <div>
      {/* Header */}
      <div className="grain relative px-4 pt-16 pb-10 max-w-7xl mx-auto">
        <p className="font-mono text-sm uppercase mb-2" style={{ color: 'var(--vermelho)', letterSpacing: '0.2em' }}>
          DROP 001 · {products.length} PRODUTOS
        </p>
        <h1
          className="section-title"
          style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'var(--papel)' }}
        >
          LOJA.
        </h1>
      </div>

      <FitaObra height="6px" />

      {/* Filters */}
      <div className="sticky top-16 z-40 border-b-2 overflow-x-auto" style={{ backgroundColor: 'var(--preto)', borderColor: 'var(--papel)' }}>
        <div className="flex px-4 max-w-7xl mx-auto">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className="shrink-0 px-5 py-4 font-mono text-xs uppercase tracking-wider border-r-2 transition-colors"
              style={{
                borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)',
                backgroundColor: activeCategory === cat.value ? 'var(--vermelho)' : 'transparent',
                color: activeCategory === cat.value ? 'var(--papel)' : 'color-mix(in srgb, var(--papel) 60%, transparent)',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <p className="font-mono text-center py-20" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
            Carregando produtos...
          </p>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-center py-20" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
            Nenhum produto nessa categoria ainda. Em breve.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

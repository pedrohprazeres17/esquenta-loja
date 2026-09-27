import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Product } from '@/types'
import { getAllProducts } from '@/data/products'
import { ProductCard } from '@/components/product/ProductCard'
import { CATEGORIES, categoryLabel, isCategory } from '@/lib/categories'
import { cn } from '@/lib/utils'

export function Loja() {
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // A categoria mora na URL (#/loja?categoria=kits): o menu e a home linkam direto.
  const raw = params.get('categoria')
  const active = isCategory(raw) ? raw : null

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const filtered = active ? products.filter(p => p.category === active) : products

  function select(value: string | null) {
    setParams(value ? { categoria: value } : {}, { replace: true })
  }

  const filtros = [{ value: null, label: 'Tudo' }, ...CATEGORIES]

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 md:pt-14">
        <p className="t-label text-cobalto">
          {loading ? 'Carregando' : `${filtered.length} ${filtered.length === 1 ? 'produto' : 'produtos'}`}
        </p>
        <h1 className="t-display mt-3 text-[clamp(2.6rem,7vw,5.5rem)] text-marinho">
          {active ? `${categoryLabel(active)}.` : 'Loja.'}
        </h1>
      </div>

      <div className="sticky top-16 z-40 border-y border-linha bg-papel/95 backdrop-blur-sm">
        <div className="no-scrollbar mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {filtros.map(f => {
            const on = f.value === active
            return (
              <button
                key={f.label}
                onClick={() => select(f.value)}
                aria-pressed={on}
                className={cn(
                  't-label shrink-0 border px-4 py-2.5 text-[10px] transition-colors',
                  on ? 'border-marinho bg-marinho text-branco' : 'border-linha text-marinho hover:border-marinho',
                )}
              >
                {f.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6">
        {loading ? (
          <p className="py-20 text-center text-concreto">Carregando produtos.</p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-concreto">Nada nessa categoria por enquanto.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

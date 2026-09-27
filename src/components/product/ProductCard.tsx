import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { categoryLabel } from '@/lib/categories'
import { useCart } from '@/contexts/CartContext'
import { Lote } from '@/components/brand'

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)
  const esgotado = product.stock === 0

  useEffect(() => {
    if (!added) return
    const t = setTimeout(() => setAdded(false), 1400)
    return () => clearTimeout(t)
  }, [added])

  return (
    <article className="group flex flex-col bg-branco">
      <Link to={`/produto/${product.slug}`} className="relative block aspect-square overflow-hidden">
        <img
          src={product.image_urls[0]}
          alt={product.name}
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.03] sm:p-5"
          loading="lazy"
        />
        {product.is_limited && product.edition_number && product.max_edition && (
          <Lote numero={product.edition_number} total={product.max_edition} className="absolute left-3 top-3 text-cobalto" />
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-4 border-t border-linha p-3 sm:p-4">
        <div className="flex flex-col gap-1.5">
          <span className="t-label text-[10px] text-concreto">{categoryLabel(product.category)}</span>
          <Link to={`/produto/${product.slug}`}>
            <h3 className="text-[15px] font-semibold uppercase leading-tight tracking-[0.01em] text-preto transition-colors group-hover:text-cobalto">
              {product.name}
            </h3>
          </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="t-num text-sm text-marinho sm:text-[15px]">
            {esgotado ? 'Esgotado' : formatPrice(product.price_cents)}
          </span>
          <button
            onClick={() => {
              addItem(product)
              setAdded(true)
            }}
            className="btn btn-primary btn-icon shrink-0"
            disabled={esgotado}
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            {added ? <Check size={16} strokeWidth={2} /> : <Plus size={16} strokeWidth={2} />}
          </button>
        </div>
      </div>
    </article>
  )
}

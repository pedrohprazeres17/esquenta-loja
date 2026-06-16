import { Link } from 'react-router-dom'
import { ShoppingCart } from 'lucide-react'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { EdicaoLimitada, Badge18 } from '@/components/brand'

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { addItem } = useCart()
  const hasDrink = ['beer-pong', 'copos'].includes(product.category)

  return (
    <div
      className="card-hover flex flex-col border-2 bg-preto"
      style={{ borderColor: 'var(--papel)' }}
    >
      {/* Image */}
      <Link to={`/produto/${product.slug}`} className="block overflow-hidden relative">
        <img
          src={product.image_urls[0]}
          alt={product.name}
          className="w-full object-cover"
          style={{ aspectRatio: featured ? '3/4' : '1/1' }}
          loading="lazy"
        />
        {/* badges overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.is_limited && <span className="text-xs px-1.5 py-0.5"
            style={{ backgroundColor: 'var(--vermelho)', color: 'var(--papel)', fontFamily: 'Anton, sans-serif', fontSize: '10px', letterSpacing: '0.1em' }}>
            LIMITADO
          </span>}
          {hasDrink && <Badge18 />}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 flex-1">
            <span className="font-mono text-xs uppercase"
              style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)', letterSpacing: '0.1em' }}>
              {product.category.replace('-', ' ')}
            </span>
            <Link to={`/produto/${product.slug}`}>
              <h3 className="section-title text-xl hover:text-vermelho transition-colors leading-tight"
                style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
                {product.name}
              </h3>
            </Link>
            {product.is_limited && product.edition_number && product.max_edition && (
              <EdicaoLimitada numero={product.edition_number} total={product.max_edition} />
            )}
          </div>
          <span className="section-title text-xl whitespace-nowrap"
            style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}>
            {formatPrice(product.price_cents)}
          </span>
        </div>

        <button
          onClick={() => addItem(product)}
          className="btn btn-primary w-full mt-auto flex items-center justify-center gap-2"
          style={{ fontSize: '13px', padding: '0.6rem 1rem' }}
          disabled={product.stock === 0}
        >
          <ShoppingCart size={14} />
          {product.stock === 0 ? 'ESGOTADO' : 'ADICIONAR'}
        </button>
      </div>
    </div>
  )
}

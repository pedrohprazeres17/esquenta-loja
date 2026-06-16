import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'

export function Carrinho() {
  const { items, removeItem, updateQuantity, total } = useCart()
  const frete = total >= 15000 ? 0 : 2490
  const totalComFrete = total + frete

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 text-center">
        <ShoppingCart size={48} className="mx-auto mb-6" style={{ color: 'color-mix(in srgb, var(--papel) 30%, transparent)' }} />
        <h2 className="section-title text-4xl mb-4" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
          CARRINHO SECO.
        </h2>
        <p className="font-mono mb-8" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
          Pior que sexta sem role.
        </p>
        <Link to="/loja" className="btn btn-primary">VER LOJA</Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="section-title mb-10" style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--papel)' }}>
        CARRINHO.
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 border-2 p-4"
              style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)' }}
            >
              <Link to={`/produto/${product.slug}`} className="shrink-0">
                <img src={product.image_urls[0]} alt={product.name} className="w-20 h-20 object-cover border" style={{ borderColor: 'var(--papel)' }} />
              </Link>
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-xs uppercase" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)', letterSpacing: '0.1em' }}>
                      {product.category.replace('-', ' ')}
                    </p>
                    <Link to={`/produto/${product.slug}`}>
                      <h3 className="section-title text-lg hover:text-vermelho transition-colors" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  <span className="section-title text-lg shrink-0" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}>
                    {formatPrice(product.price_cents * quantity)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex border" style={{ borderColor: 'var(--papel)' }}>
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-vermelho hover:text-papel transition-colors"
                      style={{ color: 'var(--papel)' }}
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center font-mono text-sm" style={{ color: 'var(--papel)' }}>
                      {quantity}
                    </span>
                    <button
                      className="w-8 h-8 flex items-center justify-center hover:bg-vermelho hover:text-papel transition-colors"
                      style={{ color: 'var(--papel)' }}
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="flex items-center gap-1 font-mono text-xs uppercase hover:text-vermelho transition-colors"
                    style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}
                  >
                    <Trash2 size={12} /> REMOVER
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="border-2 p-6 sticky top-28" style={{ borderColor: 'var(--papel)' }}>
            <h2 className="section-title text-2xl mb-6" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
              RESUMO
            </h2>

            <div className="flex flex-col gap-3 font-mono text-sm mb-6">
              <div className="flex justify-between">
                <span style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>Subtotal</span>
                <span style={{ color: 'var(--papel)' }}>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>Frete</span>
                <span style={{ color: frete === 0 ? 'var(--amarelo)' : 'var(--papel)' }}>
                  {frete === 0 ? 'GRATIS' : formatPrice(frete)}
                </span>
              </div>
              {frete === 0 && (
                <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--amarelo) 70%, transparent)' }}>
                  Frete gratis em pedidos acima de R$ 150
                </p>
              )}
              <div
                className="flex justify-between pt-4 border-t-2"
                style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)' }}
              >
                <span className="section-title text-lg" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>TOTAL</span>
                <span className="section-title text-lg" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}>
                  {formatPrice(totalComFrete)}
                </span>
              </div>
            </div>

            <Link to="/checkout" className="btn btn-primary w-full text-center block">
              IR PRO CHECKOUT
            </Link>

            <p className="font-mono text-xs text-center mt-4" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}>
              PIX · Credito · Debito
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

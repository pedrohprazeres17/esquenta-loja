import { Link } from 'react-router-dom'
import { Plus, Minus } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@/lib/utils'
import { categoryLabel } from '@/lib/categories'
import { Estrela } from '@/components/brand'

const FRETE_GRATIS_CENTS = 15000

export function Carrinho() {
  const { items, itemCount, removeItem, updateQuantity, total } = useCart()
  const faltaPraGratis = FRETE_GRATIS_CENTS - total

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <Estrela className="mx-auto h-12 w-12 text-cobalto" />
        <h1 className="t-display mt-6 text-[clamp(2.4rem,6vw,3.75rem)] text-marinho">Carrinho vazio.</h1>
        <Link to="/loja" className="btn btn-primary mt-10">Ver jogos</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 md:pt-14">
      <p className="t-label text-cobalto">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</p>
      <h1 className="t-display mt-3 text-[clamp(2.4rem,6vw,4.5rem)] text-marinho">Carrinho.</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-3">
        <ul className="flex flex-col gap-3 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex gap-4 bg-branco p-3 sm:p-4">
              <Link to={`/produto/${product.slug}`} className="shrink-0">
                <img src={product.image_urls[0]} alt={product.name} className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
              </Link>
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="t-label text-[10px] text-concreto">{categoryLabel(product.category)}</p>
                    <Link to={`/produto/${product.slug}`}>
                      <h3 className="mt-1 text-[15px] font-semibold uppercase leading-tight text-preto hover:text-cobalto">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                  <span className="t-num shrink-0 text-sm text-marinho">{formatPrice(product.price_cents * quantity)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-marinho/40">
                    <button
                      className="flex h-9 w-9 items-center justify-center text-marinho hover:bg-papel"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      aria-label="Diminuir quantidade"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="t-num w-7 text-center text-xs">{quantity}</span>
                    <button
                      className="flex h-9 w-9 items-center justify-center text-marinho hover:bg-papel"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      aria-label="Aumentar quantidade"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="t-label text-[10px] text-concreto underline-offset-4 hover:text-cobalto hover:underline"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-branco p-6">
            <h2 className="t-label text-marinho">Resumo</h2>

            <dl className="mt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-concreto">Subtotal</dt>
                <dd className="t-num">{formatPrice(total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-concreto">Frete</dt>
                <dd className="t-num text-right">{faltaPraGratis <= 0 ? 'Grátis' : 'No checkout'}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t-2 border-marinho pt-4">
                <dt className="t-label text-marinho">Total</dt>
                <dd className="t-num text-xl text-marinho">{formatPrice(total)}</dd>
              </div>
            </dl>

            <p className="mt-4 text-xs text-concreto">
              {faltaPraGratis > 0
                ? `Faltam ${formatPrice(faltaPraGratis)} pro frete grátis.`
                : 'Frete grátis nesse pedido.'}
            </p>

            <Link to="/checkout" className="btn btn-primary mt-6 w-full">Ir pro checkout</Link>
            <p className="t-label mt-4 text-center text-[10px] text-concreto">PIX · Crédito · Débito</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

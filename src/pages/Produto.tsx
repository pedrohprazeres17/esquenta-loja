import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronDown, ArrowLeft, Minus, Plus } from 'lucide-react'
import { getProductBySlug, getAllProducts } from '@/data/products'
import { getProductDetails } from '@/data/productDetails'
import type { Product } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { categoryLabel } from '@/lib/categories'
import { useCart } from '@/contexts/CartContext'
import { Lote, Mira, Selo18 } from '@/components/brand'
import { ProductCard } from '@/components/product/ProductCard'

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-linha">
      <button
        className="flex w-full items-center justify-between py-4 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="t-label text-marinho">{title}</span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={cn('text-cobalto transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && <div className="pb-5 text-[15px] leading-relaxed text-preto/80">{children}</div>}
    </div>
  )
}

export function Produto() {
  const { slug } = useParams<{ slug: string }>()
  const { addItem } = useCart()
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [related, setRelated] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    let active = true
    // Reset intencional ao trocar de produto (slug muda).
    /* eslint-disable react-hooks/set-state-in-effect */
    setLoading(true)
    setActiveImg(0)
    setQty(1)
    /* eslint-enable react-hooks/set-state-in-effect */
    Promise.all([getProductBySlug(slug), getAllProducts()]).then(([p, all]) => {
      if (!active) return
      setProduct(p)
      // Mesma categoria primeiro, depois o resto.
      const others = all.filter(x => x.id !== p?.id)
      const sameCategory = others.filter(x => x.category === p?.category)
      setRelated([...sameCategory, ...others.filter(x => x.category !== p?.category)].slice(0, 4))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return <p className="mx-auto max-w-7xl px-4 py-32 text-center text-concreto">Carregando.</p>
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-28 text-center">
        <h1 className="t-display text-4xl text-marinho">Produto não encontrado.</h1>
        <Link to="/loja" className="btn btn-primary mt-10">Ver jogos</Link>
      </div>
    )
  }

  const details = getProductDetails(product)
  const esgotado = product.stock === 0

  function handleAddToCart() {
    if (!product) return
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 md:pt-10">
        <Link
          to={`/loja?categoria=${product.category}`}
          className="t-label inline-flex items-center gap-2 text-concreto transition-colors hover:text-cobalto"
        >
          <ArrowLeft size={14} strokeWidth={1.5} /> {categoryLabel(product.category)}
        </Link>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
          {/* Imagem */}
          <div className="flex flex-col gap-3">
            <Mira className="bg-branco p-6 sm:p-10">
              <img
                src={product.image_urls[activeImg]}
                alt={product.name}
                className="mx-auto aspect-square w-full max-w-[560px] object-contain"
              />
            </Mira>
            {product.image_urls.length > 1 && (
              <div className="flex gap-2">
                {product.image_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn('h-16 w-16 border-2 bg-branco p-1', activeImg === i ? 'border-cobalto' : 'border-transparent')}
                    aria-label={`Imagem ${i + 1}`}
                  >
                    <img src={url} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
            <p className="t-label text-[10px] text-concreto">Imagem ilustrativa</p>
          </div>

          {/* Informação */}
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3">
              <span className="t-label text-cobalto">{categoryLabel(product.category)}</span>
              <Selo18 className="text-marinho" />
              {product.is_limited && product.edition_number && product.max_edition && (
                <Lote numero={product.edition_number} total={product.max_edition} className="text-marinho" />
              )}
            </div>

            <h1 className="t-display mt-4 text-[clamp(2.2rem,4.6vw,3.75rem)] text-marinho">{product.name}</h1>
            <p className="mt-5 text-lg leading-relaxed text-preto/85">{product.description}</p>

            <div className="mt-8 border-t border-linha pt-6">
              <p className="t-num text-[2rem] leading-none text-marinho">{formatPrice(product.price_cents)}</p>
              <p className="t-label mt-3 text-concreto">
                {formatPrice(Math.floor(product.price_cents * 0.95))} no PIX · 5% off
              </p>
            </div>

            <div className="mt-6 flex gap-3">
              <div className="flex items-center border border-marinho/40 bg-branco">
                <button
                  className="flex h-[52px] w-11 items-center justify-center text-marinho transition-colors hover:bg-papel disabled:opacity-40"
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={14} />
                </button>
                <span className="t-num w-8 text-center text-sm" aria-live="polite">{qty}</span>
                <button
                  className="flex h-[52px] w-11 items-center justify-center text-marinho transition-colors hover:bg-papel disabled:opacity-40"
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button onClick={handleAddToCart} className="btn btn-primary min-w-0 flex-1" disabled={esgotado}>
                {added ? 'No carrinho' : esgotado ? 'Esgotado' : (
                  <>
                    <span className="sm:hidden">Adicionar</span>
                    <span className="hidden sm:inline">Adicionar ao carrinho</span>
                  </>
                )}
              </button>
            </div>

            {product.stock <= 10 && product.stock > 0 && (
              <p className="t-label mt-4 text-cobalto">Últimas {product.stock} unidades</p>
            )}

            <ul className="mt-5 flex flex-col gap-1 text-sm text-concreto">
              <li>7 dias pra devolver. Sem pergunta.</li>
              <li>Frete grátis acima de R$ 150.</li>
            </ul>

            {/* Etiqueta */}
            {details.ficha.length > 0 && (
              <div className="mt-10">
                <h2 className="t-label text-marinho">Ficha</h2>
                <dl className="mt-3 border-t-2 border-marinho">
                  {details.ficha.map(row => (
                    <div key={row.label} className="flex items-baseline justify-between gap-6 border-b border-linha py-3">
                      <dt className="t-label text-[10px] text-concreto">{row.label}</dt>
                      <dd className="t-num text-right text-sm text-preto">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-8 border-t border-linha">
              {details.caixa.length > 0 && (
                <Accordion title="O que vem na caixa">
                  <ul className="flex flex-col gap-1">
                    {details.caixa.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </Accordion>
              )}
              {details.comoJoga && <Accordion title="Como joga">{details.comoJoga}</Accordion>}
              <Accordion title="Frete e troca">
                Frete calculado pelo CEP no checkout, com prazo de acordo com a região. Grátis acima de R$ 150.
                7 dias pra devolver, sem pergunta: produto sem uso e na embalagem original.
              </Accordion>
            </div>
          </div>
        </div>
      </div>

      {/* Barra fixa no celular */}
      <div className="sticky bottom-0 z-40 flex items-center justify-between gap-4 border-t border-linha bg-branco px-4 py-3 lg:hidden">
        <span className="t-num text-lg text-marinho">{formatPrice(product.price_cents)}</span>
        <button onClick={handleAddToCart} className="btn btn-primary max-w-xs flex-1" disabled={esgotado}>
          {added ? 'No carrinho' : esgotado ? 'Esgotado' : 'Adicionar'}
        </button>
      </div>

      {related.length > 0 && (
        <section className="border-t border-linha">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="t-display text-[clamp(1.75rem,3.5vw,2.75rem)] text-marinho">Veja também.</h2>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

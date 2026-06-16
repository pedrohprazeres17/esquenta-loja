import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronDown, ShoppingCart, ArrowLeft } from 'lucide-react'
import { getProductBySlug, getAllProducts } from '@/data/products'
import type { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import { EdicaoLimitada, Badge18, Carimbo } from '@/components/brand'
import { ProductCard } from '@/components/product/ProductCard'

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-t-2" style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)' }}>
      <button
        className="w-full flex items-center justify-between py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-mono text-sm uppercase tracking-wider" style={{ color: 'var(--papel)' }}>
          {title}
        </span>
        <ChevronDown
          size={16}
          style={{ color: 'var(--vermelho)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
        />
      </button>
      {open && (
        <div className="pb-4 font-mono text-sm" style={{ color: 'color-mix(in srgb, var(--papel) 70%, transparent)', lineHeight: 1.8 }}>
          {children}
        </div>
      )}
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
    /* eslint-enable react-hooks/set-state-in-effect */
    Promise.all([getProductBySlug(slug), getAllProducts()]).then(([p, all]) => {
      if (!active) return
      setProduct(p)
      setRelated(all.filter(x => x.id !== p?.id).slice(0, 4))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <p className="font-mono" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>Carregando...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 text-center">
        <p className="font-mono" style={{ color: 'var(--papel)' }}>Produto nao encontrado.</p>
        <Link to="/loja" className="btn btn-outline mt-8 inline-flex">VER LOJA</Link>
      </div>
    )
  }

  const hasDrink = ['beer-pong', 'copos'].includes(product.category)

  function handleAddToCart() {
    if (!product) return
    addItem(product, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* back */}
        <Link to="/loja" className="inline-flex items-center gap-2 font-mono text-sm mb-10 hover:text-vermelho transition-colors" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
          <ArrowLeft size={14} /> VOLTAR PRA LOJA
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            {product.image_urls.length > 1 && (
              <div className="flex flex-col gap-2 w-16 shrink-0">
                {product.image_urls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="w-16 h-16 border-2 overflow-hidden"
                    style={{ borderColor: activeImg === i ? 'var(--vermelho)' : 'var(--papel)' }}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            {/* Main image */}
            <div className="flex-1 border-2 overflow-hidden relative" style={{ borderColor: 'var(--papel)' }}>
              <img
                src={product.image_urls[activeImg]}
                alt={product.name}
                className="w-full object-cover"
                style={{ aspectRatio: '3/4' }}
              />
              {product.is_featured && (
                <div className="absolute top-4 right-4">
                  <Carimbo size={90} />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-4">
            {/* Category + badges */}
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-widest" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
                {product.category.replace('-', ' ')}
              </span>
              {hasDrink && <Badge18 />}
            </div>

            {/* Name */}
            <h1
              className="section-title"
              style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2.5rem, 6vw, 5rem)', color: 'var(--papel)', lineHeight: 0.95 }}
            >
              {product.name}
            </h1>

            {product.is_limited && product.edition_number && product.max_edition && (
              <EdicaoLimitada numero={product.edition_number} total={product.max_edition} />
            )}

            {/* Price */}
            <div className="flex items-baseline gap-1 mt-2">
              <span className="font-mono text-sm" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>R$</span>
              <span
                className="section-title"
                style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--vermelho)' }}
              >
                {(product.price_cents / 100).toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* PIX note */}
            <p className="font-mono text-xs" style={{ color: 'var(--amarelo)' }}>
              5% de desconto no PIX — {formatPrice(Math.floor(product.price_cents * 0.95))}
            </p>

            {/* Description */}
            <p className="font-mono text-sm mt-2" style={{ color: 'color-mix(in srgb, var(--papel) 80%, transparent)', lineHeight: 1.8 }}>
              {product.description}
            </p>

            {/* Quantity + CTA */}
            <div className="flex gap-3 mt-4">
              <div className="flex border-2" style={{ borderColor: 'var(--papel)' }}>
                <button
                  className="w-10 h-10 font-mono text-lg flex items-center justify-center hover:bg-vermelho hover:text-papel transition-colors"
                  style={{ color: 'var(--papel)' }}
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                >
                  -
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-mono" style={{ color: 'var(--papel)' }}>
                  {qty}
                </span>
                <button
                  className="w-10 h-10 font-mono text-lg flex items-center justify-center hover:bg-vermelho hover:text-papel transition-colors"
                  style={{ color: 'var(--papel)' }}
                  onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                disabled={product.stock === 0}
              >
                <ShoppingCart size={16} />
                {added ? 'ADICIONADO!' : product.stock === 0 ? 'ESGOTADO' : 'ADICIONAR AO CARRINHO'}
              </button>
            </div>

            <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}>
              Ressaca devolve em 7 dias. Frete gratis acima de R$ 150.
            </p>

            {/* Accordions */}
            <div className="mt-4">
              {product.category === 'cartas' && (
                <Accordion title="REGRAS DO JOGO">
                  220 cartas divididas em 4 categorias. Cada rodada, o carteador embaralha e distribui 3 cartas pra cada jogador. Quem puxar a carta de acao executa ou distribui. Minimo 3 pessoas. Recomendado 4-8. Duracao media: 60 minutos (ou ate alguem ir embora).
                </Accordion>
              )}
              <Accordion title="CONTEUDO DA CAIXA">
                {product.category === 'cartas' && '220 cartas impressas · Regras em PT-BR · Embalagem colecao'}
                {product.category === 'beer-pong' && 'Mesa dobravel 240cm · 22 copos ESQUENTA · 4 bolinhas de ping-pong · Manual de regras'}
                {product.category === 'copos' && 'Copo dupla camada 500ml · Tampa com encaixe · Certificado de autenticidade'}
                {product.category === 'kits' && 'Cartas ESQUENTA (220un) · Copo 500ml · Dados pack (6un) · Caixa exclusiva numerada'}
                {product.category === 'acessorios' && '6 dados personalizados · Bolsa de veludo · Instrucoes'}
              </Accordion>
              <Accordion title="FRETE E TROCA">
                Frete gratis pra todo o Brasil em pedidos acima de R$ 150. Prazo de 5-10 dias uteis. Devolucao em ate 7 dias apos recebimento. Produto precisa estar sem uso e na embalagem original.
              </Accordion>
            </div>

            {/* Stock */}
            {product.stock <= 10 && product.stock > 0 && (
              <p className="font-mono text-xs" style={{ color: 'var(--amarelo)' }}>
                ULTIMAS {product.stock} UNIDADES
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sticky mobile bar */}
      <div
        className="lg:hidden sticky bottom-0 z-50 border-t-2 px-4 py-3 flex items-center justify-between gap-4"
        style={{ backgroundColor: 'var(--preto)', borderColor: 'var(--vermelho)' }}
      >
        <span className="section-title text-xl" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}>
          {formatPrice(product.price_cents)}
        </span>
        <button onClick={handleAddToCart} className="btn btn-primary flex-1 max-w-xs">
          {added ? 'ADICIONADO!' : 'COMPRAR'}
        </button>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <h2
            className="section-title mb-8"
            style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: 'var(--papel)' }}
          >
            QUEM COMPROU LEVOU TAMBEM
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  )
}

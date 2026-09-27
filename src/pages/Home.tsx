import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Globo, Lote, Mira } from '@/components/brand'
import { ProductCard } from '@/components/product/ProductCard'
import { getAllProducts } from '@/data/products'
import { CATEGORIES } from '@/lib/categories'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/contexts/CartContext'
import type { Product } from '@/types'

const KIT_DESTAQUE = 'kit-pre-game'

export function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    getAllProducts().then(setProducts)
  }, [])

  const kit = products.find(p => p.slug === KIT_DESTAQUE)
  const destaques = products.filter(p => p.is_featured && p.slug !== KIT_DESTAQUE).slice(0, 4)
  const porCategoria = (c: string) => products.filter(p => p.category === c).length

  return (
    <div>
      {/* ── Abertura ───────────────────────────────────────────── */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-10 sm:px-6 md:grid-cols-[1.05fr_1fr] md:gap-14 md:pb-24 md:pt-16">
        <div>
          <p className="t-label text-cobalto">Jogos e acessórios pro pré · 18+</p>
          <h1 className="t-display mt-5 text-[clamp(2.9rem,7vw,6rem)] text-marinho">
            A sexta
            <br />
            começa antes.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-preto/80">
            Cartas, copos e jogos pro pré. Envio pro Brasil todo.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/loja" className="btn btn-primary btn-lg">Ver jogos</Link>
            <Link to="/loja?categoria=kits" className="btn btn-outline btn-lg">Kits</Link>
          </div>
        </div>

        <Mira className="p-4 sm:p-6">
          <img
            src="produtos/linha.webp"
            alt="Linha Spark: cartas, copos, bolinhas de beer pong, roleta e a caixa do kit"
            className="mx-auto aspect-square w-full max-w-[560px] object-contain"
          />
        </Mira>
      </section>

      {/* ── Categorias ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24">
        <SectionHead titulo="Escolha o jogo." link={{ to: '/loja', label: 'Ver tudo' }} />
        <div className="no-scrollbar -mx-4 mt-8 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
          {CATEGORIES.map(c => (
            <Link
              key={c.value}
              to={`/loja?categoria=${c.value}`}
              className="group flex w-[42%] shrink-0 snap-start flex-col bg-branco sm:w-auto"
            >
              <div className="aspect-square overflow-hidden p-4">
                <img
                  src={c.capa}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex items-center justify-between border-t border-linha px-3 py-3">
                <span className="t-label text-marinho group-hover:text-cobalto">{c.label}</span>
                {products.length > 0 && <span className="t-num text-[11px] text-concreto">{porCategoria(c.value)}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Kit em destaque ────────────────────────────────────── */}
      {kit && (
        <section className="bg-cobalto text-branco">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:gap-16 md:py-20">
            <Link to={`/produto/${kit.slug}`} className="block bg-papel p-6 sm:p-10">
              <img src={kit.image_urls[0]} alt={kit.name} loading="lazy" className="mx-auto aspect-square w-full max-w-[460px] object-contain" />
            </Link>
            <div>
              <div className="flex items-center gap-4">
                <span className="t-label text-branco/70">Kit</span>
                {kit.is_limited && kit.edition_number && kit.max_edition && (
                  <Lote numero={kit.edition_number} total={kit.max_edition} className="text-branco" />
                )}
              </div>
              <h2 className="t-display mt-5 text-[clamp(2.4rem,5.5vw,4.5rem)]">{kit.name}</h2>
              <p className="mt-5 max-w-md text-lg leading-relaxed text-branco/85">{kit.description}</p>
              <p className="t-num mt-8 text-3xl">{formatPrice(kit.price_cents)}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to={`/produto/${kit.slug}`} className="btn btn-light">Ver o kit</Link>
                <button onClick={() => addItem(kit)} className="btn btn-outline-light" disabled={kit.stock === 0}>
                  Adicionar ao carrinho
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Destaques ──────────────────────────────────────────── */}
      {destaques.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24">
          <SectionHead titulo="Destaques." link={{ to: '/loja', label: 'Ver tudo' }} />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {destaques.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ── Como compra ────────────────────────────────────────── */}
      <section className="border-t border-linha">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3 md:gap-8 md:py-16">
          <Info titulo="Envio pro Brasil todo" icone={<Globo className="w-16" />}>
            Frete calculado pelo CEP no checkout. Grátis acima de R$ 150.
          </Info>
          <Info titulo="7 dias pra devolver" icone={<span className="t-num text-3xl leading-none text-marinho">7</span>}>
            Sem pergunta. Produto sem uso, na embalagem original.
          </Info>
          <Info titulo="5% off no PIX" icone={<span className="t-num text-2xl leading-none text-marinho">5%</span>}>
            O desconto entra direto no total do pedido.
          </Info>
        </div>
      </section>
    </div>
  )
}

function SectionHead({ titulo, link }: { titulo: string; link: { to: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-6">
      <h2 className="t-display text-[clamp(1.9rem,4vw,3.25rem)] text-marinho">{titulo}</h2>
      <Link to={link.to} className="t-label hidden items-center gap-2 text-cobalto hover:text-marinho sm:flex">
        {link.label} <ArrowRight size={14} strokeWidth={1.5} />
      </Link>
    </div>
  )
}

function Info({ titulo, icone, children }: { titulo: string; icone: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-5">
      <div className="flex h-12 w-16 shrink-0 items-center justify-center">{icone}</div>
      <div>
        <h3 className="t-label text-marinho">{titulo}</h3>
        <p className="mt-2 text-[15px] leading-relaxed text-preto/75">{children}</p>
      </div>
    </div>
  )
}

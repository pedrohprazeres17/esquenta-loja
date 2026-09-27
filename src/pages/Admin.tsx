import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Edit, Plus, Upload, X, Link as LinkIcon } from 'lucide-react'
import { getAllProducts } from '@/data/products'
import { authApi, isSupabaseConfigured, productsApi, productSupplyApi, supabase } from '@/lib/supabase'
import type { Product, ProductSupply } from '@/types'
import { cn, formatPrice, slugify } from '@/lib/utils'
import { CATEGORIES, categoryLabel } from '@/lib/categories'
import { Logo } from '@/components/brand'
import { Field } from '@/components/form/Field'

const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  slug: z.string().min(2, 'Slug obrigatório'),
  category: z.enum(['cartas', 'beer-pong', 'copos', 'kits', 'acessorios']),
  price_brl: z.string().min(1, 'Preço obrigatório'),
  supplier_price_brl: z.string().optional(),
  description: z.string().min(10, 'Descrição obrigatória'),
  stock: z.number().min(0),
  is_featured: z.boolean(),
  is_limited: z.boolean(),
  edition_number: z.coerce.number().optional(),
  max_edition: z.coerce.number().optional(),
  supplier_id: z.string().optional(),
  supplier_sku: z.string().optional(),
  supplier_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

type ProductForm = z.infer<typeof productSchema>

export function Admin() {
  const navigate = useNavigate()
  const [authChecking, setAuthChecking] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageUrlInput, setImageUrlInput] = useState('')

  useEffect(() => {
    let active = true
    async function init() {
      // Gate de acesso: só admin entra (no modo mock/dev não há auth, libera).
      if (isSupabaseConfigured) {
        const session = await authApi.getSession()
        if (!session) { navigate('/conta'); return }
        const { data: prof } = await supabase
          .from('profiles').select('role').eq('user_id', session.user.id).single()
        if (prof?.role !== 'admin') { navigate('/'); return }
      }
      // Produtos (públicos) + custo/fornecedor (só admin) → mescla pra exibir.
      const prods = await getAllProducts()
      let supplyMap: Record<string, ProductSupply> = {}
      if (isSupabaseConfigured) {
        try {
          const supply = await productSupplyApi.getAll()
          supplyMap = Object.fromEntries(supply.map(s => [s.product_id, s]))
        } catch { /* sem permissão de custo: segue sem ele */ }
      }
      if (!active) return
      setProducts(prods.map(p => ({
        ...p,
        supplier_id: supplyMap[p.id]?.supplier_id ?? p.supplier_id,
        supplier_sku: supplyMap[p.id]?.supplier_sku ?? p.supplier_sku,
        supplier_price_cents: supplyMap[p.id]?.supplier_price_cents ?? p.supplier_price_cents,
        supplier_url: supplyMap[p.id]?.supplier_url ?? p.supplier_url,
      })))
      setAuthChecking(false)
    }
    init()
    return () => { active = false }
  }, [navigate])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductForm>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(productSchema) as any,
    defaultValues: { is_featured: false, is_limited: false, stock: 0, category: 'cartas' },
  })

  const isLimited = watch('is_limited')

  function openNew() {
    reset({ is_featured: false, is_limited: false, stock: 0, category: 'cartas' })
    setImageUrls([])
    setEditingId(null)
    setShowForm(true)
  }

  function openEdit(product: Product) {
    reset({
      name: product.name,
      slug: product.slug,
      category: product.category,
      price_brl: (product.price_cents / 100).toFixed(2).replace('.', ','),
      supplier_price_brl: product.supplier_price_cents ? (product.supplier_price_cents / 100).toFixed(2).replace('.', ',') : '',
      description: product.description,
      stock: product.stock,
      is_featured: product.is_featured,
      is_limited: product.is_limited,
      edition_number: product.edition_number,
      max_edition: product.max_edition,
      supplier_id: product.supplier_id ?? '',
      supplier_sku: product.supplier_sku ?? '',
      supplier_url: product.supplier_url ?? '',
    })
    setImageUrls(product.image_urls)
    setEditingId(product.id)
    setShowForm(true)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Deletar produto?')) return
    if (isSupabaseConfigured) {
      try {
        await productsApi.delete(id)
      } catch (e) {
        alert('Erro ao deletar no Supabase: ' + (e as Error).message)
        return
      }
    }
    setProducts(ps => ps.filter(p => p.id !== id))
  }

  const parseBRL = (v: string) => Math.round(parseFloat(v.replace(',', '.')) * 100) || 0

  async function onSubmit(data: ProductForm): Promise<void> {
    // Produto (público) e custo/fornecedor (só admin) são gravados separados.
    const productPayload = {
      name: data.name,
      slug: data.slug,
      category: data.category,
      price_cents: parseBRL(data.price_brl),
      description: data.description,
      stock: data.stock,
      is_featured: data.is_featured,
      is_limited: data.is_limited,
      edition_number: data.is_limited ? data.edition_number : undefined,
      max_edition: data.is_limited ? data.max_edition : undefined,
      image_urls: imageUrls.length ? imageUrls : ['https://placehold.co/800x800/0041D2/FEFEFE?text=' + encodeURIComponent(data.name)],
    }
    const supply = {
      supplier_id: data.supplier_id || undefined,
      supplier_sku: data.supplier_sku || undefined,
      supplier_price_cents: data.supplier_price_brl ? parseBRL(data.supplier_price_brl) : undefined,
      supplier_url: data.supplier_url || undefined,
    }

    if (isSupabaseConfigured) {
      // Persiste de verdade no banco (requer login como admin — ver RLS)
      try {
        if (editingId) {
          const updated = await productsApi.update(editingId, productPayload)
          await productSupplyApi.upsert(editingId, supply)
          setProducts(ps => ps.map(p => (p.id === editingId ? { ...updated, ...supply } : p)))
        } else {
          const created = await productsApi.create(productPayload as Omit<Product, 'id' | 'created_at'>)
          await productSupplyApi.upsert(created.id, supply)
          setProducts(ps => [{ ...created, ...supply }, ...ps])
        }
      } catch (e) {
        alert('Erro ao salvar no Supabase: ' + (e as Error).message)
        return
      }
    } else {
      // Modo mock — só estado local (some ao recarregar; conecte o Supabase pra persistir)
      if (editingId) {
        setProducts(ps => ps.map(p => (p.id === editingId ? { ...p, ...productPayload, ...supply } : p)))
      } else {
        const newProduct: Product = {
          id: String(Date.now()),
          created_at: new Date().toISOString(),
          ...productPayload,
          ...supply,
        } as Product
        setProducts(ps => [newProduct, ...ps])
      }
    }

    setShowForm(false)
    reset()
    setImageUrls([])
    setImageUrlInput('')
  }

  function addImageUrl() {
    const url = imageUrlInput.trim()
    if (!url) return
    setImageUrls(prev => [...prev, url])
    setImageUrlInput('')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
    files.forEach(file => {
      const url = URL.createObjectURL(file)
      setImageUrls(prev => [...prev, url])
    })
  }, [])

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-papel">
        <p className="t-label text-concreto">Verificando acesso</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-cobalto text-branco">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-5">
            <Logo versao="branco" />
            <span className="t-label border border-branco/60 px-2 py-1 text-[10px]">Admin</span>
          </div>
          <Link to="/" className="t-label text-branco/80 hover:text-branco">Ver loja</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="t-label text-cobalto">{products.length} {products.length === 1 ? 'produto' : 'produtos'}</p>
            <h1 className="t-display mt-3 text-5xl text-marinho">Produtos.</h1>
            <span
              className={cn(
                't-label mt-4 inline-block px-2 py-1 text-[10px]',
                isSupabaseConfigured ? 'bg-cobalto text-branco' : 'border border-marinho text-marinho',
              )}
            >
              {isSupabaseConfigured ? 'Banco conectado · alterações salvam de verdade' : 'Modo mock · conecte o Supabase pra salvar'}
            </span>
          </div>
          <button onClick={openNew} className="btn btn-primary">
            <Plus size={16} /> Novo produto
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-marinho/60 px-4 py-10">
            <div className="w-full max-w-2xl bg-branco p-6 sm:p-8">
              <div className="mb-8 flex items-center justify-between">
                <h2 className="t-display text-3xl text-marinho">{editingId ? 'Editar produto' : 'Novo produto'}</h2>
                <button onClick={() => setShowForm(false)} className="text-marinho hover:text-cobalto" aria-label="Fechar">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nome do produto" error={errors.name?.message} className="sm:col-span-2">
                    <input
                      {...register('name')}
                      placeholder="Ex: SPARK CARTAS"
                      onChange={e => {
                        setValue('name', e.target.value)
                        if (!editingId) setValue('slug', slugify(e.target.value))
                      }}
                    />
                  </Field>

                  <Field label="Slug (URL)" error={errors.slug?.message}>
                    <input {...register('slug')} placeholder="spark-cartas" />
                  </Field>

                  <Field label="Categoria" error={errors.category?.message}>
                    <select {...register('category')}>
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Preço (R$)" error={errors.price_brl?.message}>
                    <input {...register('price_brl')} placeholder="89,90" inputMode="decimal" />
                  </Field>

                  <Field label="Estoque" error={errors.stock?.message}>
                    <input {...register('stock', { valueAsNumber: true })} type="number" min="0" placeholder="0" />
                  </Field>

                  <Field label="Descrição" error={errors.description?.message} className="sm:col-span-2">
                    <textarea {...register('description')} rows={4} placeholder="Curta e com o número que importa." className="resize-y" />
                  </Field>
                </div>

                <h3 className="t-label border-t border-linha pt-5 text-marinho">Fornecedor · só admin</h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Fornecedor ID">
                    <input {...register('supplier_id')} placeholder="sup-001" />
                  </Field>
                  <Field label="SKU do fornecedor">
                    <input {...register('supplier_sku')} placeholder="SP-CARTAS-001" />
                  </Field>
                  <Field label="Custo (R$)">
                    <input {...register('supplier_price_brl')} placeholder="35,00" inputMode="decimal" />
                  </Field>
                  <Field label="URL do fornecedor" error={errors.supplier_url?.message}>
                    <input {...register('supplier_url')} placeholder="https://..." />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-6 border-t border-linha pt-5">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" {...register('is_featured')} className="h-4 w-4" />
                    <span className="text-sm">Destaque na home</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" {...register('is_limited')} className="h-4 w-4" />
                    <span className="text-sm">Edição limitada (lote)</span>
                  </label>
                </div>

                {isLimited && (
                  <div className="grid grid-cols-2 gap-4 bg-papel p-4">
                    <Field label="Nº do lote">
                      <input {...register('edition_number')} type="number" placeholder="1" />
                    </Field>
                    <Field label="Total da edição">
                      <input {...register('max_edition')} type="number" placeholder="500" />
                    </Field>
                  </div>
                )}

                {/* Imagens */}
                <div>
                  <span className="field-label">Imagens</span>
                  <div
                    className="cursor-pointer border-2 border-dashed border-marinho/30 p-6 text-center transition-colors hover:border-cobalto"
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <Upload size={24} className="mx-auto mb-2 text-marinho/50" />
                    <p className="text-sm text-concreto">Arraste as imagens ou clique pra escolher</p>
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={e => {
                        Array.from(e.target.files ?? []).forEach(f => {
                          setImageUrls(prev => [...prev, URL.createObjectURL(f)])
                        })
                      }}
                    />
                  </div>

                  {/* Colar URL — pra usar a foto hospedada do fornecedor (persiste no banco) */}
                  <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                    <div className="flex flex-1 items-center gap-2 border border-preto/20 bg-branco pl-3">
                      <LinkIcon size={14} className="shrink-0 text-concreto" />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() } }}
                        placeholder="Colar URL da foto"
                        className="border-0 shadow-none focus:shadow-none"
                      />
                    </div>
                    <button type="button" onClick={addImageUrl} className="btn btn-outline btn-sm">Adicionar</button>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative h-16 w-16 border border-linha bg-branco">
                          <img src={url} alt="" className="h-full w-full object-contain" />
                          <button
                            type="button"
                            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-marinho text-branco"
                            onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                            aria-label="Remover imagem"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-2 flex gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Salvando' : editingId ? 'Salvar alterações' : 'Criar produto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="overflow-x-auto bg-branco">
          <div className="min-w-[760px]">
            <div
              className="t-label grid gap-4 border-b-2 border-marinho px-4 py-3 text-[10px] text-concreto"
              style={{ gridTemplateColumns: '2.2fr 1fr 1fr 1fr 0.7fr auto' }}
            >
              <span>Produto</span>
              <span>Categoria</span>
              <span>Preço</span>
              <span>Custo</span>
              <span>Estoque</span>
              <span className="w-[76px]">Ações</span>
            </div>

            {products.map(product => (
              <div
                key={product.id}
                className="grid items-center gap-4 border-b border-linha px-4 py-3 transition-colors hover:bg-papel/50"
                style={{ gridTemplateColumns: '2.2fr 1fr 1fr 1fr 0.7fr auto' }}
              >
                <div className="flex items-center gap-3">
                  <img src={product.image_urls[0]} alt="" className="h-12 w-12 shrink-0 object-contain" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase leading-tight">{product.name}</p>
                    <p className="t-num mt-1 truncate text-[10px] text-concreto">{product.slug}</p>
                    {product.supplier_sku && <p className="t-num text-[10px] text-cobalto">{product.supplier_sku}</p>}
                  </div>
                </div>
                <span className="t-label text-[10px] text-concreto">{categoryLabel(product.category)}</span>
                <span className="t-num text-sm text-marinho">{formatPrice(product.price_cents)}</span>
                <span className={cn('t-num text-sm', product.supplier_price_cents ? 'text-preto' : 'text-concreto/60')}>
                  {product.supplier_price_cents ? formatPrice(product.supplier_price_cents) : '—'}
                </span>
                <span className={cn('t-num text-sm', product.stock <= 5 ? 'font-semibold text-cobalto' : 'text-preto')}>
                  {product.stock}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="border border-linha p-2 text-marinho transition-colors hover:border-cobalto hover:text-cobalto"
                    aria-label={`Editar ${product.name}`}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="border border-linha p-2 text-marinho transition-colors hover:border-cobalto hover:text-cobalto"
                    aria-label={`Deletar ${product.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

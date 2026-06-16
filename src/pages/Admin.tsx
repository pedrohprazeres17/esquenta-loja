import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2, Edit, Plus, Upload, X, Link as LinkIcon } from 'lucide-react'
import { getAllProducts } from '@/data/products'
import { authApi, isSupabaseConfigured, productsApi, productSupplyApi, supabase } from '@/lib/supabase'
import type { Product, ProductSupply } from '@/types'
import { formatPrice, slugify } from '@/lib/utils'
import { FitaObra, Logo } from '@/components/brand'

const productSchema = z.object({
  name: z.string().min(2, 'Nome obrigatorio'),
  slug: z.string().min(2, 'Slug obrigatorio'),
  category: z.enum(['cartas', 'beer-pong', 'copos', 'kits', 'acessorios']),
  price_brl: z.string().min(1, 'Preco obrigatorio'),
  supplier_price_brl: z.string().optional(),
  description: z.string().min(10, 'Descricao obrigatoria'),
  stock: z.number().min(0),
  is_featured: z.boolean(),
  is_limited: z.boolean(),
  edition_number: z.coerce.number().optional(),
  max_edition: z.coerce.number().optional(),
  supplier_id: z.string().optional(),
  supplier_sku: z.string().optional(),
  supplier_url: z.string().url('URL invalida').optional().or(z.literal('')),
})

type ProductForm = z.infer<typeof productSchema>

const CATEGORIES = [
  { value: 'cartas', label: 'Cartas' },
  { value: 'beer-pong', label: 'Beer Pong' },
  { value: 'copos', label: 'Copos' },
  { value: 'kits', label: 'Kits' },
  { value: 'acessorios', label: 'Acessorios' },
]

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="font-mono text-xs uppercase block mb-1" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)', letterSpacing: '0.1em' }}>
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{message}</p>
}

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
      image_urls: imageUrls.length ? imageUrls : ['https://placehold.co/600x800/0E0D0B/FF2A1F?text=' + encodeURIComponent(data.name)],
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
      <div style={{ backgroundColor: 'var(--preto)', minHeight: '100vh' }} className="flex items-center justify-center">
        <p className="font-mono" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>Verificando acesso…</p>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: 'var(--preto)', minHeight: '100vh' }}>
      {/* Admin header */}
      <div className="border-b-2 px-6 py-4 flex items-center justify-between" style={{ borderColor: 'var(--vermelho)', backgroundColor: 'var(--preto)' }}>
        <div className="flex items-center gap-4">
          <Logo size="sm" />
          <span className="font-mono text-xs uppercase px-2 py-1 border" style={{ borderColor: 'var(--vermelho)', color: 'var(--vermelho)' }}>
            ADMIN
          </span>
        </div>
      </div>

      <FitaObra height="6px" />

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="section-title text-5xl" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
              PRODUTOS
            </h1>
            <p className="font-mono text-sm mt-1" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
              {products.length} produto(s) cadastrado(s)
            </p>
            <span
              className="inline-block font-mono text-xs uppercase px-2 py-1 mt-2"
              style={{
                letterSpacing: '0.1em',
                color: isSupabaseConfigured ? 'var(--preto)' : 'var(--amarelo)',
                backgroundColor: isSupabaseConfigured ? 'var(--amarelo)' : 'transparent',
                border: isSupabaseConfigured ? 'none' : '1px solid var(--amarelo)',
              }}
            >
              {isSupabaseConfigured ? '● BANCO CONECTADO — alterações salvam de verdade' : '○ MODO MOCK — conecte o Supabase pra persistir'}
            </span>
          </div>
          <button onClick={openNew} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> NOVO PRODUTO
          </button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-10 px-4" style={{ backgroundColor: 'rgba(14,13,11,0.95)' }}>
            <div className="w-full max-w-2xl border-2 p-8" style={{ backgroundColor: 'var(--preto)', borderColor: 'var(--papel)' }}>
              <div className="flex items-center justify-between mb-8">
                <h2 className="section-title text-3xl" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
                  {editingId ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}
                </h2>
                <button onClick={() => setShowForm(false)} className="text-papel hover:text-vermelho transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label>NOME DO PRODUTO</Label>
                    <input
                      {...register('name')}
                      placeholder="Ex: ESQUENTA CARTAS"
                      onChange={e => {
                        setValue('name', e.target.value)
                        if (!editingId) setValue('slug', slugify(e.target.value))
                      }}
                    />
                    <FieldError message={errors.name?.message} />
                  </div>

                  <div>
                    <Label>SLUG (URL)</Label>
                    <input {...register('slug')} placeholder="esquenta-cartas" />
                    <FieldError message={errors.slug?.message} />
                  </div>

                  <div>
                    <Label>CATEGORIA</Label>
                    <select {...register('category')} style={{ backgroundColor: 'var(--preto)', color: 'var(--papel)' }}>
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                    <FieldError message={errors.category?.message} />
                  </div>

                  <div>
                    <Label>PRECO (R$)</Label>
                    <input {...register('price_brl')} placeholder="89,90" />
                    <FieldError message={errors.price_brl?.message} />
                  </div>

                  <div>
                    <Label>ESTOQUE</Label>
                    <input {...register('stock', { valueAsNumber: true })} type="number" min="0" placeholder="0" />
                    <FieldError message={errors.stock?.message} />
                  </div>

                  <div className="sm:col-span-2">
                    <Label>DESCRICAO</Label>
                    <textarea {...register('description')} rows={4} placeholder="Descricao do produto..." style={{ resize: 'vertical' }} />
                    <FieldError message={errors.description?.message} />
                  </div>
                </div>

                <FitaObra height="4px" />
                <p className="font-mono text-xs uppercase" style={{ color: 'var(--amarelo)', letterSpacing: '0.1em' }}>DROPSHIPPING</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label>FORNECEDOR ID</Label>
                    <input {...register('supplier_id')} placeholder="sup-001" />
                  </div>
                  <div>
                    <Label>SKU FORNECEDOR</Label>
                    <input {...register('supplier_sku')} placeholder="EQ-CARTAS-001" />
                  </div>
                  <div>
                    <Label>CUSTO FORNECEDOR (R$)</Label>
                    <input {...register('supplier_price_brl')} placeholder="35,00" />
                  </div>
                  <div>
                    <Label>URL FORNECEDOR</Label>
                    <input {...register('supplier_url')} placeholder="https://..." />
                    <FieldError message={errors.supplier_url?.message} />
                  </div>
                </div>

                <FitaObra height="4px" />

                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_featured')} className="w-4 h-4" style={{ accentColor: 'var(--vermelho)' }} />
                    <span className="font-mono text-sm" style={{ color: 'var(--papel)' }}>FEATURED (home)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('is_limited')} className="w-4 h-4" style={{ accentColor: 'var(--vermelho)' }} />
                    <span className="font-mono text-sm" style={{ color: 'var(--papel)' }}>EDICAO LIMITADA</span>
                  </label>
                </div>

                {isLimited && (
                  <div className="grid grid-cols-2 gap-4 p-4 border" style={{ borderColor: 'var(--amarelo)' }}>
                    <div>
                      <Label>N.º DA EDICAO</Label>
                      <input {...register('edition_number')} type="number" placeholder="1" />
                    </div>
                    <div>
                      <Label>TOTAL DA EDICAO</Label>
                      <input {...register('max_edition')} type="number" placeholder="500" />
                    </div>
                  </div>
                )}

                {/* Image upload */}
                <div>
                  <Label>IMAGENS</Label>
                  <div
                    className="border-2 p-6 text-center cursor-pointer transition-colors"
                    style={{ borderColor: 'color-mix(in srgb, var(--papel) 30%, transparent)', borderStyle: 'dashed' }}
                    onDrop={handleDrop}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => document.getElementById('file-input')?.click()}
                  >
                    <Upload size={24} className="mx-auto mb-2" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }} />
                    <p className="font-mono text-sm" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
                      Arraste imagens ou clique pra selecionar
                    </p>
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
                  <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-2 flex-1 border px-3" style={{ borderColor: 'color-mix(in srgb, var(--papel) 25%, transparent)' }}>
                      <LinkIcon size={14} style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }} />
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl() } }}
                        placeholder="Colar URL da foto (ex: do fornecedor)"
                        className="flex-1 border-0 bg-transparent py-2 font-mono text-sm"
                        style={{ color: 'var(--papel)' }}
                      />
                    </div>
                    <button type="button" onClick={addImageUrl} className="btn btn-outline btn-sm">ADD</button>
                  </div>
                  {imageUrls.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {imageUrls.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 border" style={{ borderColor: 'var(--papel)' }}>
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-xs"
                            style={{ backgroundColor: 'var(--vermelho)', color: 'var(--papel)' }}
                            onClick={() => setImageUrls(prev => prev.filter((_, j) => j !== i))}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">
                    CANCELAR
                  </button>
                  <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'SALVANDO...' : editingId ? 'SALVAR ALTERACOES' : 'CRIAR PRODUTO'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Products table */}
        <div className="border-2 overflow-hidden" style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)' }}>
          <div
            className="grid font-mono text-xs uppercase px-4 py-3 border-b-2"
            style={{
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
              borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--papel) 5%, transparent)',
              color: 'color-mix(in srgb, var(--papel) 50%, transparent)',
              letterSpacing: '0.1em',
            }}
          >
            <span>PRODUTO</span>
            <span>CATEGORIA</span>
            <span>PRECO</span>
            <span>CUSTO</span>
            <span>ESTOQUE</span>
            <span>ACOES</span>
          </div>

          {products.map(product => (
            <div
              key={product.id}
              className="grid items-center px-4 py-4 border-b transition-colors hover:bg-papel/5"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto',
                borderColor: 'color-mix(in srgb, var(--papel) 10%, transparent)',
              }}
            >
              <div className="flex items-center gap-3">
                <img src={product.image_urls[0]} alt="" className="w-10 h-10 object-cover border" style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)' }} />
                <div>
                  <p className="font-display text-sm" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>{product.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}>{product.slug}</p>
                  {product.supplier_sku && <p className="font-mono text-xs" style={{ color: 'var(--amarelo)', opacity: 0.7 }}>{product.supplier_sku}</p>}
                </div>
              </div>
              <span className="font-mono text-xs uppercase" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>
                {product.category.replace('-', ' ')}
              </span>
              <span className="font-mono text-sm" style={{ color: 'var(--vermelho)' }}>
                {formatPrice(product.price_cents)}
              </span>
              <span className="font-mono text-sm" style={{ color: product.supplier_price_cents ? 'var(--amarelo)' : 'color-mix(in srgb, var(--papel) 30%, transparent)' }}>
                {product.supplier_price_cents ? formatPrice(product.supplier_price_cents) : '—'}
              </span>
              <span className="font-mono text-sm" style={{ color: product.stock <= 5 ? 'var(--vermelho)' : 'var(--papel)' }}>
                {product.stock}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(product)}
                  className="p-2 border transition-colors hover:border-vermelho hover:text-vermelho"
                  style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)', color: 'var(--papel)' }}
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => deleteProduct(product.id)}
                  className="p-2 border transition-colors hover:border-vermelho hover:text-vermelho"
                  style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)', color: 'var(--papel)' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

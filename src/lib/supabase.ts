import { createClient } from '@supabase/supabase-js'
import type { Product, ProductSupply, Supplier, Order, Profile } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

/**
 * true só quando há credenciais REAIS preenchidas no .env.
 * Ignora os placeholders do .env.example pra não ligar o banco por engano.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('seu-projeto') &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('sua-anon-key'),
)

if (!isSupabaseConfigured) {
  console.warn('Supabase não configurado — rodando em modo mock (produtos do mockProducts.ts)')
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

/* ── Database types ──────────────────────────────────────── */
export type Database = {
  public: {
    Tables: {
      products: {
        Row: Product
        Insert: Omit<Product, 'id' | 'created_at'>
        Update: Partial<Omit<Product, 'id' | 'created_at'>>
      }
      suppliers: {
        Row: Supplier
        Insert: Omit<Supplier, 'id' | 'created_at'>
        Update: Partial<Omit<Supplier, 'id' | 'created_at'>>
      }
      orders: {
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at'>
        Update: Partial<Omit<Order, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id'>
        Update: Partial<Omit<Profile, 'id'>>
      }
    }
  }
}

/* ── Product queries ─────────────────────────────────────── */
export const productsApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Product[]
  },

  async getBySlug(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error) throw error
    return data as Product
  },

  async getByCategory(category: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Product[]
  },

  async getFeatured() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .limit(4)
    if (error) throw error
    return data as Product[]
  },

  async create(product: Database['public']['Tables']['products']['Insert']) {
    const { data, error } = await supabase.from('products').insert(product).select().single()
    if (error) throw error
    return data as Product
  },

  async update(id: string, updates: Database['public']['Tables']['products']['Update']) {
    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data as Product
  },

  async delete(id: string) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
  },
}

/* ── Supplier queries ────────────────────────────────────── */
export const suppliersApi = {
  async getAll() {
    const { data, error } = await supabase.from('suppliers').select('*').order('name')
    if (error) throw error
    return data as Supplier[]
  },

  async create(supplier: Database['public']['Tables']['suppliers']['Insert']) {
    const { data, error } = await supabase.from('suppliers').insert(supplier).select().single()
    if (error) throw error
    return data as Supplier
  },
}

/* ── Product supply (custo/fornecedor — só admin via RLS) ── */
export const productSupplyApi = {
  async getAll() {
    const { data, error } = await supabase.from('product_supply').select('*')
    if (error) throw error
    return data as ProductSupply[]
  },

  async upsert(productId: string, supply: Omit<ProductSupply, 'product_id'>) {
    const { error } = await supabase
      .from('product_supply')
      .upsert({ product_id: productId, ...supply })
    if (error) throw error
  },
}

/* ── Order queries ───────────────────────────────────────── */
export const ordersApi = {
  async create(order: Database['public']['Tables']['orders']['Insert']) {
    const { data, error } = await supabase.from('orders').insert(order).select().single()
    if (error) throw error
    return data as Order
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as Order[]
  },

  async updateStatus(id: string, status: Order['status']) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) throw error
  },
}

/* ── Auth helpers ────────────────────────────────────────── */
export const authApi = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getSession() {
    const { data } = await supabase.auth.getSession()
    return data.session
  },
}

/* ── Storage helpers ─────────────────────────────────────── */
export const storageApi = {
  async uploadProductImage(file: File, productId: string): Promise<string> {
    const ext = file.name.split('.').pop()
    const path = `${productId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('products').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('products').getPublicUrl(path)
    return data.publicUrl
  },

  async deleteProductImage(url: string) {
    const path = url.split('/products/')[1]
    const { error } = await supabase.storage.from('products').remove([path])
    if (error) throw error
  },
}

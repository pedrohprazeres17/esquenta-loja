/* ── Product ─────────────────────────────────────────────── */
export type ProductCategory =
  | 'cartas'
  | 'beer-pong'
  | 'copos'
  | 'kits'
  | 'acessorios'

export interface Product {
  id: string
  slug: string
  name: string
  description: string
  price_cents: number
  category: ProductCategory
  image_urls: string[]
  stock: number
  is_featured: boolean
  is_limited: boolean
  edition_number?: number
  max_edition?: number
  created_at: string
  // Dropshipping fields
  supplier_id?: string
  supplier_sku?: string
  supplier_price_cents?: number
  supplier_url?: string
  // Shipping (Melhor Envio)
  weight_grams?: number
  width_cm?: number
  height_cm?: number
  length_cm?: number
}

/* ── Product supply (custo/fornecedor — só admin) ─────────── */
// Vive em tabela separada (product_supply) com RLS só-admin, pra NÃO vazar
// custo/SKU na leitura pública de products. No app só o /admin lê isso.
export interface ProductSupply {
  product_id: string
  supplier_id?: string | null
  supplier_sku?: string | null
  supplier_price_cents?: number | null
  supplier_url?: string | null
}

/* ── Supplier ────────────────────────────────────────────── */
export type SupplierType = 'aliexpress' | 'shopify' | 'manual' | 'api'

export interface Supplier {
  id: string
  name: string
  website?: string
  type: SupplierType
  api_url?: string
  api_key?: string
  notes?: string
  created_at: string
}

/* ── Cart ────────────────────────────────────────────────── */
export interface CartItem {
  product: Product
  quantity: number
}

/* ── Order ───────────────────────────────────────────────── */
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderAddress {
  name: string
  cpf: string
  phone: string
  cep: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
}

export interface OrderItem {
  product_id: string
  product_name: string
  quantity: number
  price_cents: number
  supplier_id?: string
  supplier_sku?: string
}

export interface Order {
  id: string
  user_id?: string
  items: OrderItem[]
  total_cents: number
  status: OrderStatus
  address: OrderAddress
  payment_id?: string
  payment_method?: 'pix' | 'credit_card' | 'debit_card'
  supplier_order_ids?: Record<string, string>
  tracking_codes?: Record<string, string>
  created_at: string
}

/* ── Profile ─────────────────────────────────────────────── */
export interface Profile {
  id: string
  user_id: string
  name: string
  phone?: string
  default_address?: OrderAddress
}

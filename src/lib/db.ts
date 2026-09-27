/**
 * Banco da loja, local no navegador (localStorage).
 *
 * Produtos, pedidos e contas ficam salvos neste navegador, sem servidor.
 * Na primeira visita o banco nasce com o catálogo da Spark (data/mockProducts).
 * Cada navegador tem o seu: o que for cadastrado num aparelho não aparece em outro.
 *
 * A versão com servidor (Postgres no Supabase) está em supabase/, fora de uso.
 */
import type { Order, Product } from '@/types'
import { mockProducts } from '@/data/mockProducts'

const KEY = 'spark-db'
// Subir quando o catálogo inicial mudar: recarrega os produtos e mantém pedidos e contas.
const CATALOG_VERSION = 1

export interface Account {
  id: string
  name: string
  email: string
  created_at: string
}

interface StoredAccount extends Account {
  salt: string
  hash: string
}

interface Database {
  catalog: number
  products: Product[]
  orders: Order[]
  accounts: StoredAccount[]
  session: string | null
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

function fresh(): Database {
  return { catalog: CATALOG_VERSION, products: clone(mockProducts), orders: [], accounts: [], session: null }
}

function load(): Database {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const db = JSON.parse(raw) as Database
      if (db.catalog !== CATALOG_VERSION) return { ...db, catalog: CATALOG_VERSION, products: clone(mockProducts) }
      return db
    }
  } catch {
    /* banco ilegível: começa do zero */
  }
  return fresh()
}

function save(db: Database) {
  try {
    localStorage.setItem(KEY, JSON.stringify(db))
  } catch {
    throw new Error('O navegador ficou sem espaço pra salvar. Use imagens menores.')
  }
}

/* ── Produtos ────────────────────────────────────────────── */
export const productsDb = {
  async getAll(): Promise<Product[]> {
    return load().products
  },

  async getBySlug(slug: string): Promise<Product | null> {
    return load().products.find(p => p.slug === slug) ?? null
  },

  async create(data: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const db = load()
    if (db.products.some(p => p.slug === data.slug)) throw new Error('Já existe um produto com esse slug.')
    const product = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() } as Product
    db.products.unshift(product)
    save(db)
    return product
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const db = load()
    if (data.slug && db.products.some(p => p.slug === data.slug && p.id !== id)) {
      throw new Error('Já existe um produto com esse slug.')
    }
    const i = db.products.findIndex(p => p.id === id)
    if (i < 0) throw new Error('Produto não encontrado.')
    db.products[i] = { ...db.products[i], ...data }
    save(db)
    return db.products[i]
  },

  async delete(id: string) {
    const db = load()
    db.products = db.products.filter(p => p.id !== id)
    save(db)
  },

  /** Volta o catálogo pro original. Pedidos e contas ficam. */
  async reset() {
    const db = load()
    db.products = clone(mockProducts)
    save(db)
  },
}

/* ── Pedidos ─────────────────────────────────────────────── */
export const ordersDb = {
  async create(data: Omit<Order, 'id' | 'number' | 'created_at'>): Promise<Order> {
    const db = load()
    const number = db.orders.reduce((max, o) => Math.max(max, o.number ?? 0), 0) + 1
    const order: Order = { ...data, id: crypto.randomUUID(), number, created_at: new Date().toISOString() }
    db.orders.unshift(order)
    save(db)
    return order
  },

  async getAll(): Promise<Order[]> {
    return load().orders
  },

  async getByEmail(email: string): Promise<Order[]> {
    const e = email.trim().toLowerCase()
    return load().orders.filter(o => o.email?.toLowerCase() === e)
  },
}

/* ── Contas ──────────────────────────────────────────────── */
// Senha nunca é guardada: só o hash SHA-256 com sal.
async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

const toAccount = ({ id, name, email, created_at }: StoredAccount): Account => ({ id, name, email, created_at })

export const accountsDb = {
  async signUp(email: string, password: string, name: string): Promise<Account> {
    const db = load()
    const e = email.trim().toLowerCase()
    if (db.accounts.some(a => a.email === e)) throw new Error('Já existe uma conta com esse e-mail.')
    const salt = crypto.randomUUID()
    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: e,
      created_at: new Date().toISOString(),
      salt,
      hash: await sha256(salt + password),
    }
    db.accounts.push(account)
    db.session = account.id
    save(db)
    return toAccount(account)
  },

  async signIn(email: string, password: string): Promise<Account> {
    const db = load()
    const account = db.accounts.find(a => a.email === email.trim().toLowerCase())
    if (!account || account.hash !== (await sha256(account.salt + password))) {
      throw new Error('E-mail ou senha incorretos.')
    }
    db.session = account.id
    save(db)
    return toAccount(account)
  },

  async signOut() {
    const db = load()
    db.session = null
    save(db)
  },

  async current(): Promise<Account | null> {
    const db = load()
    const account = db.accounts.find(a => a.id === db.session)
    return account ? toAccount(account) : null
  },
}

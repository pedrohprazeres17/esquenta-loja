/**
 * Camada de acesso a produtos.
 *
 * Usa o Supabase quando há credenciais reais no .env (isSupabaseConfigured);
 * senão cai no mockProducts.ts — assim o site funciona em dev mesmo sem banco
 * e "liga a chave" automaticamente quando o Supabase é conectado.
 *
 * Se o banco falhar uma vez (ex.: projeto pausado), o resto da sessão usa o
 * mock direto, sem esperar a rede de novo a cada página.
 */
import { isSupabaseConfigured, productsApi } from '@/lib/supabase'
import { mockProducts } from './mockProducts'
import type { Product } from '@/types'

let bancoFora = false

async function fromDb<T>(load: () => Promise<T>, fallback: () => T, what: string): Promise<T> {
  if (!isSupabaseConfigured || bancoFora) return fallback()
  try {
    return await load()
  } catch (e) {
    bancoFora = true
    console.error(`Falha ao carregar ${what} do Supabase — usando mock:`, e)
    return fallback()
  }
}

export function getAllProducts(): Promise<Product[]> {
  return fromDb(() => productsApi.getAll(), () => mockProducts, 'produtos')
}

export function getFeaturedProducts(): Promise<Product[]> {
  return fromDb(
    () => productsApi.getFeatured(),
    () => mockProducts.filter(p => p.is_featured).slice(0, 4),
    'destaques',
  )
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return fromDb(
    () => productsApi.getBySlug(slug),
    () => mockProducts.find(p => p.slug === slug) ?? null,
    'produto',
  )
}

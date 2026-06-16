/**
 * Camada de acesso a produtos.
 *
 * Usa o Supabase quando há credenciais reais no .env (isSupabaseConfigured);
 * senão cai no mockProducts.ts — assim o site funciona em dev mesmo sem banco
 * e "liga a chave" automaticamente quando o Supabase é conectado.
 */
import { isSupabaseConfigured, productsApi } from '@/lib/supabase'
import { mockProducts } from './mockProducts'
import type { Product } from '@/types'

export async function getAllProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return mockProducts
  try {
    return await productsApi.getAll()
  } catch (e) {
    console.error('Falha ao carregar produtos do Supabase — usando mock:', e)
    return mockProducts
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured) return mockProducts.filter(p => p.is_featured).slice(0, 4)
  try {
    return await productsApi.getFeatured()
  } catch (e) {
    console.error('Falha ao carregar destaques do Supabase — usando mock:', e)
    return mockProducts.filter(p => p.is_featured).slice(0, 4)
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured) return mockProducts.find(p => p.slug === slug) ?? null
  try {
    return await productsApi.getBySlug(slug)
  } catch (e) {
    console.error('Falha ao carregar produto do Supabase — usando mock:', e)
    return mockProducts.find(p => p.slug === slug) ?? null
  }
}

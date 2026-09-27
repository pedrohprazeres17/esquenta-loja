/**
 * Camada de acesso a produtos. Lê do banco local (lib/db.ts).
 */
import { productsDb } from '@/lib/db'
import type { Product } from '@/types'

export function getAllProducts(): Promise<Product[]> {
  return productsDb.getAll()
}

export function getProductBySlug(slug: string): Promise<Product | null> {
  return productsDb.getBySlug(slug)
}

import type { ProductCategory } from '@/types'

// Categorias da loja, na ordem do menu. `capa` é a imagem do bloco na home.
export const CATEGORIES: { value: ProductCategory; label: string; capa: string }[] = [
  { value: 'cartas', label: 'Cartas', capa: 'produtos/verdade-ou-gole.webp' },
  { value: 'beer-pong', label: 'Beer pong', capa: 'produtos/kit-beer-pong-profissional.webp' },
  { value: 'copos', label: 'Copos', capa: 'produtos/copo-spark-500ml.webp' },
  { value: 'kits', label: 'Kits', capa: 'produtos/kit-pre-game.webp' },
  { value: 'acessorios', label: 'Acessórios', capa: 'produtos/roleta-do-shot.webp' },
]

export function categoryLabel(category: ProductCategory): string {
  return CATEGORIES.find(c => c.value === category)?.label ?? category
}

export function isCategory(value: string | null): value is ProductCategory {
  return CATEGORIES.some(c => c.value === value)
}

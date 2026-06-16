/**
 * Cálculo de frete (Melhor Envio via Edge Function).
 *
 * Mesma filosofia da camada de produtos: quando o Supabase/Edge não está
 * configurado (ou falha), cai numa TAXA FIXA pra não travar o checkout em dev.
 */
import { isSupabaseConfigured, supabase } from './supabase'
import type { CartItem } from '@/types'

export interface ShippingOption {
  id: number
  name: string
  company: string
  price_cents: number
  delivery_days: number | null
}

export interface ShippingResult {
  options: ShippingOption[]
  /** true = veio da taxa fixa (Melhor Envio indisponível/não configurado) */
  fallback: boolean
}

/** Taxa fixa de segurança (R$ 24,90 / ~7 dias) usada quando o cálculo real falha. */
const FALLBACK_OPTION: ShippingOption = {
  id: 0,
  name: 'Frete padrão',
  company: 'ESQUENTA',
  price_cents: 2490,
  delivery_days: 7,
}

function fallback(): ShippingResult {
  return { options: [FALLBACK_OPTION], fallback: true }
}

export async function calculateShipping(cep: string, items: CartItem[]): Promise<ShippingResult> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) throw new Error('CEP inválido')
  if (items.length === 0) throw new Error('Carrinho vazio')

  if (!isSupabaseConfigured) return fallback()

  try {
    const { data, error } = await supabase.functions.invoke('calculate-shipping', {
      body: {
        to_cep: digits,
        items: items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      },
    })
    if (error) throw error
    if (!data?.configured || !Array.isArray(data.options) || data.options.length === 0) {
      return fallback()
    }
    return { options: data.options as ShippingOption[], fallback: false }
  } catch (e) {
    console.error('Falha ao calcular frete — usando taxa fixa:', e)
    return fallback()
  }
}

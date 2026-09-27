/**
 * Cálculo de frete: região do CEP de destino + peso do pedido.
 *
 * Mesma tabela do motor próprio (supabase/functions/calculate-shipping),
 * rodando no próprio site. Origem: SP, onde fica o fornecedor.
 */
import type { CartItem } from '@/types'

export interface ShippingOption {
  id: number
  name: string
  company: string
  price_cents: number
  delivery_days: number | null
}

// base_cents cobre o 1º kg; per_kg_cents é cobrado por kg adicional (arredondado pra cima).
interface Zone { base_cents: number; per_kg_cents: number; days: number }

function zoneFromCep(cep: string): Zone {
  const d = cep[0]
  if (d === '0' || d === '1') return { base_cents: 1590, per_kg_cents: 200, days: 3 }  // SP
  if (d === '2' || d === '3') return { base_cents: 1990, per_kg_cents: 300, days: 5 }  // RJ/ES/MG
  if (d === '8' || d === '9') return { base_cents: 2290, per_kg_cents: 350, days: 6 }  // Sul
  if (d === '7')              return { base_cents: 2690, per_kg_cents: 400, days: 8 }  // Centro-Oeste
  if (d === '4' || d === '5') return { base_cents: 2990, per_kg_cents: 500, days: 10 } // Nordeste
  return { base_cents: 3490, per_kg_cents: 600, days: 13 }                              // Norte (6)
}

// Peso padrão quando o produto não tem (mínimo dos Correios).
const DEFAULT_WEIGHT_GRAMS = 300

export async function calculateShipping(cep: string, items: CartItem[]): Promise<ShippingOption[]> {
  const digits = cep.replace(/\D/g, '')
  if (digits.length !== 8) throw new Error('CEP inválido')
  if (items.length === 0) throw new Error('Carrinho vazio')

  const totalKg = items.reduce(
    (sum, i) => sum + ((i.product.weight_grams ?? DEFAULT_WEIGHT_GRAMS) * i.quantity) / 1000,
    0,
  )
  const zone = zoneFromCep(digits)
  const billableKg = Math.max(1, Math.ceil(totalKg))
  const standard = zone.base_cents + (billableKg - 1) * zone.per_kg_cents
  const express = Math.round((standard * 1.7) / 10) * 10

  return [
    { id: 1, name: 'Padrão', company: 'Spark Entregas', price_cents: standard, delivery_days: zone.days },
    { id: 2, name: 'Expressa', company: 'Spark Entregas', price_cents: express, delivery_days: Math.max(1, Math.round(zone.days * 0.5)) },
  ]
}

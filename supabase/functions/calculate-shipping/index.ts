// ESQUENTA · Cálculo de frete
//
// Recebe { to_cep, items: [{ product_id, quantity }] }, busca peso/dimensões
// dos produtos no banco (service role) e devolve as opções de frete.
// Funciona pra convidado (não exige usuário logado).
//
// DUAS FONTES, nesta ordem:
//   1. Melhor Envio — se os secrets MELHOR_ENVIO_TOKEN + MELHOR_ENVIO_FROM_CEP
//      estiverem setados (frete real de transportadoras).
//   2. Tabela ESQUENTA — motor próprio por região do CEP + peso (origem SP).
//      Não depende de nada externo: já funciona sem configurar nada.
//
// Secrets (opcionais, só pro Melhor Envio):
//   MELHOR_ENVIO_TOKEN, MELHOR_ENVIO_FROM_CEP, MELHOR_ENVIO_SANDBOX ('true'|'false')

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ME_TOKEN = Deno.env.get('MELHOR_ENVIO_TOKEN') ?? ''
const ME_FROM_CEP = (Deno.env.get('MELHOR_ENVIO_FROM_CEP') ?? '').replace(/\D/g, '')
const ME_SANDBOX = (Deno.env.get('MELHOR_ENVIO_SANDBOX') ?? 'true') !== 'false'
const ME_BASE = ME_SANDBOX
  ? 'https://sandbox.melhorenvio.com.br'
  : 'https://www.melhorenvio.com.br'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface ItemInput {
  product_id: string
  quantity: number
}

interface ProductDims {
  id: string
  price_cents: number
  weight_grams: number
  width_cm: number
  height_cm: number
  length_cm: number
}

// Dimensões padrão quando o produto não tem (mínimo dos Correios).
const DEFAULTS = { price_cents: 0, weight_grams: 300, width_cm: 11, height_cm: 5, length_cm: 16 }

// Serviço retornado pelo Melhor Envio (só os campos que usamos).
interface MeService {
  id: number
  name: string
  price?: string
  error?: string
  company?: { name?: string }
  delivery_time?: number
  delivery_range?: { max?: number }
}

// ── Motor de frete próprio (origem: SP) ───────────────────────────
// Tabela por região do CEP de destino. base_cents cobre o 1º kg;
// per_kg_cents é cobrado por kg adicional (arredondado pra cima).
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

function zoneOptions(cep: string, totalKg: number) {
  const z = zoneFromCep(cep)
  const billableKg = Math.max(1, Math.ceil(totalKg))
  const eco = z.base_cents + (billableKg - 1) * z.per_kg_cents
  const exp = Math.round((eco * 1.7) / 10) * 10
  return [
    { id: 1, name: 'Padrão', company: 'ESQUENTA Entregas', price_cents: eco, delivery_days: z.days },
    { id: 2, name: 'Expressa', company: 'ESQUENTA Entregas', price_cents: exp, delivery_days: Math.max(1, Math.round(z.days * 0.5)) },
  ]
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { to_cep, items } = await req.json()

    const toCep = String(to_cep ?? '').replace(/\D/g, '')
    if (toCep.length !== 8) return json({ error: 'CEP inválido' }, 400)
    if (!Array.isArray(items) || items.length === 0) return json({ error: 'Carrinho vazio' }, 400)

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const ids = (items as ItemInput[]).map((i) => i.product_id)
    const { data: products, error } = await supabase
      .from('products')
      .select('id, price_cents, weight_grams, width_cm, height_cm, length_cm')
      .in('id', ids)
    if (error) throw error

    const dimsOf = (id: string): ProductDims =>
      (products as ProductDims[] | null)?.find((p) => p.id === id) ?? { id, ...DEFAULTS }

    const totalKg = (items as ItemInput[]).reduce(
      (sum, i) => sum + (dimsOf(i.product_id).weight_grams * i.quantity) / 1000,
      0,
    )

    // ── Fonte 2 (padrão): motor próprio, sem dependência externa ──
    if (!ME_TOKEN || ME_FROM_CEP.length !== 8) {
      return json({ configured: true, source: 'esquenta', options: zoneOptions(toCep, totalKg) })
    }

    // ── Fonte 1: Melhor Envio (quando configurado) ──
    const meProducts = (items as ItemInput[]).map((i) => {
      const p = dimsOf(i.product_id)
      return {
        id: p.id,
        width: p.width_cm,
        height: p.height_cm,
        length: p.length_cm,
        weight: p.weight_grams / 1000,
        insurance_value: p.price_cents / 100,
        quantity: i.quantity,
      }
    })

    const meRes = await fetch(`${ME_BASE}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ME_TOKEN}`,
        'User-Agent': 'ESQUENTA (pedrohprazeres01@gmail.com)',
      },
      body: JSON.stringify({
        from: { postal_code: ME_FROM_CEP },
        to: { postal_code: toCep },
        products: meProducts,
        options: { receipt: false, own_hand: false },
      }),
    })

    if (!meRes.ok) {
      // Se o Melhor Envio falhar, não trava o checkout: cai no motor próprio.
      return json({ configured: true, source: 'esquenta_fallback', options: zoneOptions(toCep, totalKg) })
    }

    const raw = await meRes.json()
    const options = ((Array.isArray(raw) ? raw : []) as MeService[])
      .filter((s) => !s.error && s.price)
      .map((s) => ({
        id: s.id,
        name: s.name,
        company: s.company?.name ?? '',
        price_cents: Math.round(parseFloat(s.price!) * 100),
        delivery_days: s.delivery_time ?? s.delivery_range?.max ?? null,
      }))
      .sort((a: { price_cents: number }, b: { price_cents: number }) => a.price_cents - b.price_cents)

    // Melhor Envio sem nenhuma opção válida → motor próprio.
    if (options.length === 0) {
      return json({ configured: true, source: 'esquenta_fallback', options: zoneOptions(toCep, totalKg) })
    }

    return json({ configured: true, source: 'melhor_envio', options })
  } catch (err) {
    return json({ error: (err as Error).message }, 400)
  }
})

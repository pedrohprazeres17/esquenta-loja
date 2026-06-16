import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Unauthorized')

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) throw new Error('Unauthorized')

    const { items, address, email } = await req.json()

    // Build MP preference
    const mpItems = items.map((item: { product_name: string; price_cents: number; quantity: number }) => ({
      id: item.product_name,
      title: item.product_name,
      quantity: item.quantity,
      unit_price: item.price_cents / 100,
      currency_id: 'BRL',
    }))

    const webhookUrl = `${SUPABASE_URL}/functions/v1/webhook-mercado-pago`

    const preferenceBody = {
      items: mpItems,
      payer: {
        email,
        address: {
          zip_code: address.cep.replace('-', ''),
          street_name: address.street,
          street_number: address.number,
        },
      },
      payment_methods: {
        excluded_payment_methods: [],
        installments: 12,
      },
      notification_url: webhookUrl,
      statement_descriptor: 'ESQUENTA',
      expires: false,
    }

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preferenceBody),
    })

    if (!mpRes.ok) {
      const err = await mpRes.text()
      throw new Error(`Mercado Pago error: ${err}`)
    }

    const preference = await mpRes.json()

    return new Response(
      JSON.stringify({ preference_id: preference.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

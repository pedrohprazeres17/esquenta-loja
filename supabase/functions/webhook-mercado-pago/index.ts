import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'GET') {
    return new Response('ok')
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const body = await req.json()

    const { type, data } = body

    if (type !== 'payment') {
      return new Response('ignored', { status: 200 })
    }

    const paymentId = data?.id
    if (!paymentId) return new Response('no payment id', { status: 400 })

    // Fetch payment from MP
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
    })
    const payment = await mpRes.json()

    const mpStatusToOrderStatus: Record<string, string> = {
      approved: 'paid',
      pending: 'pending',
      in_process: 'processing',
      rejected: 'cancelled',
      cancelled: 'cancelled',
      refunded: 'refunded',
      charged_back: 'refunded',
    }

    const orderStatus = mpStatusToOrderStatus[payment.status] ?? 'pending'

    // Update order in DB
    const { error } = await supabase
      .from('orders')
      .update({ status: orderStatus, payment_id: String(paymentId) })
      .eq('payment_id', String(paymentId))

    if (error) {
      console.error('DB update error:', error)
    }

    return new Response('ok', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('error', { status: 500 })
  }
})

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/contexts/CartContext'
import { calculateShipping, type ShippingOption } from '@/lib/shipping'
import { formatPrice, formatCEP, formatPhone, formatCPF } from '@/lib/utils'
import { FitaObra } from '@/components/brand'

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome obrigatorio'),
  cpf: z.string().min(14, 'CPF invalido'),
  email: z.string().email('Email invalido'),
  phone: z.string().min(14, 'Telefone invalido'),
  cep: z.string().min(9, 'CEP invalido'),
  street: z.string().min(3, 'Rua obrigatoria'),
  number: z.string().min(1, 'Numero obrigatorio'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatorio'),
  city: z.string().min(2, 'Cidade obrigatoria'),
  state: z.string().length(2, 'UF invalida'),
  payment_method: z.enum(['pix', 'credit_card', 'debit_card']),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const PAYMENT_OPTIONS = [
  { value: 'pix', label: 'PIX', desc: '5% de desconto · Aprovacao instantanea' },
  { value: 'credit_card', label: 'CREDITO', desc: 'Ate 12x sem juros' },
  { value: 'debit_card', label: 'DEBITO', desc: 'Aprovacao instantanea' },
] as const

export function Checkout() {
  const navigate = useNavigate()
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState<'address' | 'payment'>('address')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { payment_method: 'pix' },
  })

  const paymentMethod = watch('payment_method')
  const cep = watch('cep')

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingMsg, setShippingMsg] = useState<string | null>(null)

  const cepReady = (cep ?? '').replace(/\D/g, '').length === 8
  const freteGratis = total >= 15000
  const freteCents = freteGratis ? 0 : selectedShipping?.price_cents ?? 0
  const discount = paymentMethod === 'pix' ? Math.floor(total * 0.05) : 0
  const totalFinal = total + freteCents - discount

  async function handleCalcShipping() {
    setLoadingShipping(true)
    setShippingMsg(null)
    setSelectedShipping(null)
    try {
      const { options, fallback } = await calculateShipping(cep ?? '', items)
      setShippingOptions(options)
      setSelectedShipping(options[0] ?? null)
      if (fallback) setShippingMsg('Cálculo em tempo real indisponível — taxa padrão aplicada.')
    } catch (e) {
      setShippingOptions([])
      setShippingMsg((e as Error).message)
    } finally {
      setLoadingShipping(false)
    }
  }

  async function onSubmit() {
    // TODO: integrar Mercado Pago (gravar pedido com frete/transportadora escolhidos)
    await new Promise(r => setTimeout(r, 1000))
    clearCart()
    navigate('/')
  }

  if (items.length === 0) {
    navigate('/carrinho')
    return null
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="section-title mb-2" style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--papel)' }}>
        CHECKOUT.
      </h1>
      <p className="font-mono text-sm mb-10" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
        Frete gratis pra Brasil acima de R$ 150.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Step tabs */}
            <div className="flex border-2" style={{ borderColor: 'var(--papel)' }}>
              {(['address', 'payment'] as const).map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(s)}
                  className="flex-1 py-3 font-display uppercase text-sm transition-colors"
                  style={{
                    fontFamily: 'Anton, sans-serif',
                    backgroundColor: step === s ? 'var(--vermelho)' : 'transparent',
                    color: step === s ? 'var(--papel)' : 'color-mix(in srgb, var(--papel) 60%, transparent)',
                    borderRight: i === 0 ? '2px solid var(--papel)' : 'none',
                  }}
                >
                  {i + 1}. {s === 'address' ? 'ENDERECO' : 'PAGAMENTO'}
                </button>
              ))}
            </div>

            {/* Address */}
            {step === 'address' && (
              <div className="flex flex-col gap-4">
                <h2 className="section-title text-xl" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>DADOS PESSOAIS</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>NOME COMPLETO</label>
                    <input {...register('name')} placeholder="Seu nome" />
                    {errors.name && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>CPF</label>
                    <input
                      {...register('cpf')}
                      placeholder="000.000.000-00"
                      onChange={e => setValue('cpf', formatCPF(e.target.value))}
                    />
                    {errors.cpf && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.cpf.message}</p>}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>EMAIL</label>
                    <input {...register('email')} type="email" placeholder="seu@email.com" />
                    {errors.email && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>TELEFONE</label>
                    <input
                      {...register('phone')}
                      placeholder="(11) 99999-9999"
                      onChange={e => setValue('phone', formatPhone(e.target.value))}
                    />
                    {errors.phone && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.phone.message}</p>}
                  </div>
                </div>

                <FitaObra height="6px" className="my-2" />
                <h2 className="section-title text-xl" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>ENDERECO DE ENTREGA</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>CEP</label>
                    <input
                      {...register('cep')}
                      placeholder="00000-000"
                      onChange={e => setValue('cep', formatCEP(e.target.value))}
                    />
                    {errors.cep && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.cep.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>RUA</label>
                    <input {...register('street')} placeholder="Nome da rua" />
                    {errors.street && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.street.message}</p>}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>NUMERO</label>
                    <input {...register('number')} placeholder="123" />
                    {errors.number && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.number.message}</p>}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>COMPLEMENTO</label>
                    <input {...register('complement')} placeholder="Apto, bloco..." />
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>BAIRRO</label>
                    <input {...register('neighborhood')} placeholder="Seu bairro" />
                    {errors.neighborhood && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.neighborhood.message}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>CIDADE</label>
                    <input {...register('city')} placeholder="Sua cidade" />
                    {errors.city && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>UF</label>
                    <input {...register('state')} placeholder="SP" maxLength={2} style={{ textTransform: 'uppercase' }} />
                    {errors.state && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{errors.state.message}</p>}
                  </div>
                </div>

                <FitaObra height="6px" className="my-2" />
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="section-title text-xl" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>FRETE</h2>
                  <button
                    type="button"
                    onClick={handleCalcShipping}
                    disabled={!cepReady || loadingShipping}
                    className="btn btn-outline"
                  >
                    {loadingShipping ? 'CALCULANDO...' : 'CALCULAR FRETE'}
                  </button>
                </div>
                <p className="font-mono text-xs -mt-2" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
                  {freteGratis
                    ? 'Pedido acima de R$ 150 — frete por nossa conta. Escolha a entrega.'
                    : 'Preencha o CEP e calcule o frete.'}
                </p>

                {shippingMsg && (
                  <p className="font-mono text-xs" style={{ color: 'var(--amarelo)' }}>{shippingMsg}</p>
                )}

                {shippingOptions.length > 0 && (
                  <div className="flex flex-col gap-3">
                    {shippingOptions.map(opt => (
                      <label
                        key={opt.id}
                        className="flex items-center gap-4 border-2 p-4 cursor-pointer transition-colors"
                        style={{
                          borderColor: selectedShipping?.id === opt.id ? 'var(--vermelho)' : 'color-mix(in srgb, var(--papel) 20%, transparent)',
                          backgroundColor: selectedShipping?.id === opt.id ? 'color-mix(in srgb, var(--vermelho) 5%, transparent)' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping?.id === opt.id}
                          onChange={() => setSelectedShipping(opt)}
                          className="sr-only"
                        />
                        <div
                          className="w-4 h-4 border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: selectedShipping?.id === opt.id ? 'var(--vermelho)' : 'var(--papel)' }}
                        >
                          {selectedShipping?.id === opt.id && (
                            <div className="w-2 h-2" style={{ backgroundColor: 'var(--vermelho)' }} />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="section-title text-base" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
                            {[opt.company, opt.name].filter(Boolean).join(' ')}
                          </p>
                          {opt.delivery_days != null && (
                            <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
                              Prazo: {opt.delivery_days} {opt.delivery_days === 1 ? 'dia útil' : 'dias úteis'}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-sm" style={{ color: freteGratis ? 'var(--amarelo)' : 'var(--papel)' }}>
                          {freteGratis ? 'GRÁTIS' : formatPrice(opt.price_cents)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  disabled={!selectedShipping}
                  className="btn btn-primary self-end"
                >
                  CONTINUAR
                </button>
              </div>
            )}

            {/* Payment */}
            {step === 'payment' && (
              <div className="flex flex-col gap-6">
                <h2 className="section-title text-xl" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>FORMA DE PAGAMENTO</h2>

                <div className="flex flex-col gap-3">
                  {PAYMENT_OPTIONS.map(opt => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-4 border-2 p-4 cursor-pointer transition-colors"
                      style={{
                        borderColor: paymentMethod === opt.value ? 'var(--vermelho)' : 'color-mix(in srgb, var(--papel) 20%, transparent)',
                        backgroundColor: paymentMethod === opt.value ? 'color-mix(in srgb, var(--vermelho) 5%, transparent)' : 'transparent',
                      }}
                    >
                      <input
                        type="radio"
                        value={opt.value}
                        {...register('payment_method')}
                        className="sr-only"
                      />
                      <div
                        className="w-4 h-4 border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: paymentMethod === opt.value ? 'var(--vermelho)' : 'var(--papel)' }}
                      >
                        {paymentMethod === opt.value && (
                          <div className="w-2 h-2" style={{ backgroundColor: 'var(--vermelho)' }} />
                        )}
                      </div>
                      <div>
                        <p className="section-title text-base" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>{opt.label}</p>
                        <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Mercado Pago placeholder */}
                <div
                  className="border-2 p-6 text-center"
                  style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)', borderStyle: 'dashed' }}
                >
                  <p className="font-mono text-sm" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
                    [ MERCADO PAGO BRICK SERA CARREGADO AQUI ]
                  </p>
                  <p className="font-mono text-xs mt-2" style={{ color: 'color-mix(in srgb, var(--papel) 30%, transparent)' }}>
                    Integrar com VITE_MERCADO_PAGO_PUBLIC_KEY
                  </p>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep('address')} className="btn btn-outline">
                    VOLTAR
                  </button>
                  <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'PROCESSANDO...' : `PAGAR ${formatPrice(totalFinal)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="border-2 p-6 sticky top-28" style={{ borderColor: 'var(--papel)' }}>
              <h2 className="section-title text-xl mb-4" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>
                PEDIDO
              </h2>
              <div className="flex flex-col gap-3 mb-4">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex justify-between font-mono text-sm">
                    <span style={{ color: 'color-mix(in srgb, var(--papel) 70%, transparent)' }}>
                      {product.name} × {quantity}
                    </span>
                    <span style={{ color: 'var(--papel)' }}>{formatPrice(product.price_cents * quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t font-mono text-sm" style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)' }}>
                <div className="flex justify-between">
                  <span style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>
                    Frete{selectedShipping ? ` · ${selectedShipping.company}` : ''}
                  </span>
                  <span style={{ color: freteCents === 0 && selectedShipping ? 'var(--amarelo)' : 'var(--papel)' }}>
                    {!selectedShipping ? '—' : freteCents === 0 ? 'GRATIS' : formatPrice(freteCents)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: 'var(--amarelo)' }}>Desconto PIX (-5%)</span>
                    <span style={{ color: 'var(--amarelo)' }}>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t" style={{ borderColor: 'color-mix(in srgb, var(--papel) 20%, transparent)' }}>
                  <span className="section-title" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--papel)' }}>TOTAL</span>
                  <span className="section-title" style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}>{formatPrice(totalFinal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

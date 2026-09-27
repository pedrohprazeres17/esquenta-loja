import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/contexts/CartContext'
import { calculateShipping, type ShippingOption } from '@/lib/shipping'
import { cn, formatPrice, formatCEP, formatPhone, formatCPF } from '@/lib/utils'
import { Field } from '@/components/form/Field'

const checkoutSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  cpf: z.string().min(14, 'CPF inválido'),
  email: z.string().email('E-mail inválido'),
  phone: z.string().min(14, 'Telefone inválido'),
  cep: z.string().min(9, 'CEP inválido'),
  street: z.string().min(3, 'Rua obrigatória'),
  number: z.string().min(1, 'Número obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro obrigatório'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'UF inválida'),
  payment_method: z.enum(['pix', 'credit_card', 'debit_card']),
})

type CheckoutForm = z.infer<typeof checkoutSchema>

// Campos validados antes de ir pro pagamento.
const ADDRESS_FIELDS = ['name', 'cpf', 'email', 'phone', 'cep', 'street', 'number', 'neighborhood', 'city', 'state'] as const

const PAYMENT_OPTIONS = [
  { value: 'pix', label: 'PIX', desc: '5% de desconto. Aprovação na hora.' },
  { value: 'credit_card', label: 'Crédito', desc: 'Até 12x sem juros.' },
  { value: 'debit_card', label: 'Débito', desc: 'Aprovação na hora.' },
] as const

type Step = 'address' | 'payment'

export function Checkout() {
  const { items, total, clearCart } = useCart()
  const [step, setStep] = useState<Step>('address')
  const [done, setDone] = useState<{ total: number } | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
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
      if (fallback) setShippingMsg('Cálculo em tempo real indisponível. Aplicamos a taxa padrão.')
    } catch (e) {
      setShippingOptions([])
      setShippingMsg((e as Error).message)
    } finally {
      setLoadingShipping(false)
    }
  }

  async function goToPayment() {
    const valid = await trigger([...ADDRESS_FIELDS])
    if (!valid) return
    if (!selectedShipping) {
      setShippingMsg('Calcule o frete antes de continuar.')
      return
    }
    setStep('payment')
    window.scrollTo({ top: 0 })
  }

  async function onSubmit() {
    // TODO: integrar Mercado Pago (gravar pedido com frete/transportadora escolhidos)
    await new Promise(r => setTimeout(r, 800))
    setDone({ total: totalFinal })
    clearCart()
    window.scrollTo({ top: 0 })
  }

  if (done) return <Confirmacao total={done.total} />
  if (items.length === 0) return <Navigate to="/carrinho" replace />

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 md:pt-14">
      <p className="t-label text-cobalto">Checkout / {step === 'address' ? 'Entrega' : 'Pagamento'}</p>
      <h1 className="t-display mt-3 text-[clamp(2.2rem,5.5vw,4rem)] text-marinho">
        {step === 'address' ? 'Qual é o destino?' : 'Escolha como pagar.'}
      </h1>

      <ol className="mt-8 flex gap-8 border-b border-linha">
        {([
          ['address', '01', 'Entrega'],
          ['payment', '02', 'Pagamento'],
        ] as const).map(([s, n, label]) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => (s === 'address' ? setStep('address') : goToPayment())}
              aria-current={step === s ? 'step' : undefined}
              className={cn(
                't-label -mb-px flex items-center gap-3 border-b-2 pb-3 transition-colors',
                step === s ? 'border-cobalto text-marinho' : 'border-transparent text-concreto hover:text-marinho',
              )}
            >
              <span className="t-num">{n}</span>
              {label}
            </button>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit, () => setStep('address'))} noValidate>
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {step === 'address' && (
              <>
                <Panel titulo="Dados pessoais">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Nome completo" error={errors.name?.message}>
                      <input {...register('name')} placeholder="Seu nome" autoComplete="name" />
                    </Field>
                    <Field label="CPF" error={errors.cpf?.message}>
                      <input
                        {...register('cpf')}
                        placeholder="000.000.000-00"
                        inputMode="numeric"
                        onChange={e => setValue('cpf', formatCPF(e.target.value))}
                      />
                    </Field>
                    <Field label="E-mail" error={errors.email?.message}>
                      <input {...register('email')} type="email" placeholder="seu@email.com" autoComplete="email" />
                    </Field>
                    <Field label="Telefone" error={errors.phone?.message}>
                      <input
                        {...register('phone')}
                        placeholder="(00) 00000-0000"
                        inputMode="tel"
                        autoComplete="tel"
                        onChange={e => setValue('phone', formatPhone(e.target.value))}
                      />
                    </Field>
                  </div>
                </Panel>

                <Panel titulo="Endereço">
                  <div className="grid gap-4 sm:grid-cols-6">
                    <Field label="CEP" error={errors.cep?.message} className="sm:col-span-2">
                      <input
                        {...register('cep')}
                        placeholder="00000-000"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        onChange={e => setValue('cep', formatCEP(e.target.value))}
                      />
                    </Field>
                    <Field label="Rua" error={errors.street?.message} className="sm:col-span-4">
                      <input {...register('street')} placeholder="Nome da rua" autoComplete="address-line1" />
                    </Field>
                    <Field label="Número" error={errors.number?.message} className="sm:col-span-2">
                      <input {...register('number')} placeholder="123" />
                    </Field>
                    <Field label="Complemento" className="sm:col-span-4">
                      <input {...register('complement')} placeholder="Apto, bloco" autoComplete="address-line2" />
                    </Field>
                    <Field label="Bairro" error={errors.neighborhood?.message} className="sm:col-span-2">
                      <input {...register('neighborhood')} placeholder="Bairro" />
                    </Field>
                    <Field label="Cidade" error={errors.city?.message} className="sm:col-span-3">
                      <input {...register('city')} placeholder="Cidade" autoComplete="address-level2" />
                    </Field>
                    <Field label="UF" error={errors.state?.message} className="sm:col-span-1">
                      <input {...register('state')} placeholder="UF" maxLength={2} className="uppercase" autoComplete="address-level1" />
                    </Field>
                  </div>
                </Panel>

                <Panel titulo="Frete">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <p className="text-sm text-preto/75">
                      {freteGratis
                        ? 'Pedido acima de R$ 150: o frete é por nossa conta. Escolha a entrega.'
                        : 'Cálculo pela região do CEP e pelo peso dos produtos.'}
                    </p>
                    <button
                      type="button"
                      onClick={handleCalcShipping}
                      disabled={!cepReady || loadingShipping}
                      className="btn btn-outline"
                    >
                      {loadingShipping ? 'Calculando' : 'Calcular frete'}
                    </button>
                  </div>

                  {!cepReady && shippingOptions.length === 0 && (
                    <p className="t-label mt-4 text-[10px] text-concreto">Preencha o CEP pra calcular</p>
                  )}
                  {shippingMsg && <p className="mt-4 text-sm font-semibold text-marinho">{shippingMsg}</p>}

                  {shippingOptions.length > 0 && (
                    <div className="mt-5 flex flex-col gap-3">
                      {shippingOptions.map(opt => (
                        <Choice
                          key={opt.id}
                          name="shipping"
                          checked={selectedShipping?.id === opt.id}
                          onChange={() => setSelectedShipping(opt)}
                          label={opt.name}
                          tag={opt.company}
                          desc={opt.delivery_days != null
                            ? `Prazo: ${opt.delivery_days} ${opt.delivery_days === 1 ? 'dia útil' : 'dias úteis'}`
                            : undefined}
                          aside={freteGratis ? 'Grátis' : formatPrice(opt.price_cents)}
                        />
                      ))}
                    </div>
                  )}
                </Panel>

                <div className="flex justify-end">
                  <button type="button" onClick={goToPayment} className="btn btn-primary btn-lg w-full sm:w-auto">
                    Continuar
                  </button>
                </div>
              </>
            )}

            {step === 'payment' && (
              <>
                <Panel titulo="Forma de pagamento">
                  <div className="flex flex-col gap-3">
                    {PAYMENT_OPTIONS.map(opt => (
                      <Choice
                        key={opt.value}
                        checked={paymentMethod === opt.value}
                        label={opt.label}
                        desc={opt.desc}
                        input={<input type="radio" value={opt.value} {...register('payment_method')} className="sr-only" />}
                      />
                    ))}
                  </div>
                </Panel>

                <div className="border-l-2 border-cobalto bg-branco p-5">
                  <p className="t-label text-marinho">Integração em andamento</p>
                  <p className="mt-2 text-sm leading-relaxed text-preto/80">
                    O pagamento pelo Mercado Pago entra na próxima etapa do projeto. Este checkout não faz cobrança.
                  </p>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button type="button" onClick={() => setStep('address')} className="btn btn-outline">
                    Voltar
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg flex-1" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando' : `Finalizar pedido · ${formatPrice(totalFinal)}`}
                  </button>
                </div>
              </>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-branco p-6">
              <h2 className="t-label text-marinho">Pedido</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {items.map(({ product, quantity }) => (
                  <li key={product.id} className="flex items-center gap-3">
                    <img src={product.image_urls[0]} alt="" className="h-14 w-14 shrink-0 object-contain" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold uppercase leading-tight">{product.name}</p>
                      <p className="t-num mt-1 text-[11px] text-concreto">
                        {quantity} × {formatPrice(product.price_cents)}
                      </p>
                    </div>
                    <span className="t-num text-xs">{formatPrice(product.price_cents * quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 flex flex-col gap-2 border-t border-linha pt-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-concreto">Subtotal</dt>
                  <dd className="t-num">{formatPrice(total)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-concreto">Frete{selectedShipping ? ` · ${selectedShipping.name}` : ''}</dt>
                  <dd className="t-num">{!selectedShipping ? '—' : freteCents === 0 ? 'Grátis' : formatPrice(freteCents)}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-concreto">Desconto PIX (5%)</dt>
                    <dd className="t-num">-{formatPrice(discount)}</dd>
                  </div>
                )}
                <div className="mt-2 flex items-baseline justify-between gap-4 border-t-2 border-marinho pt-4">
                  <dt className="t-label text-marinho">Total</dt>
                  <dd className="t-num text-xl text-marinho">{formatPrice(totalFinal)}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </form>
    </div>
  )
}

function Panel({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-branco p-5 sm:p-6">
      <h2 className="t-label mb-5 text-marinho">{titulo}</h2>
      {children}
    </section>
  )
}

// Opção de rádio em cartão (frete e pagamento).
function Choice({
  checked,
  label,
  desc,
  tag,
  aside,
  name,
  onChange,
  input,
}: {
  checked: boolean
  label: string
  desc?: string
  tag?: string
  aside?: string
  name?: string
  onChange?: () => void
  input?: React.ReactNode
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-4 border p-4 transition-colors',
        checked ? 'border-cobalto bg-cobalto/[0.04] shadow-[inset_0_0_0_1px_var(--color-cobalto)]' : 'border-linha hover:border-marinho/50',
      )}
    >
      {input ?? <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />}
      <span
        className={cn(
          'flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-[1.5px]',
          checked ? 'border-cobalto' : 'border-concreto',
        )}
        aria-hidden="true"
      >
        {checked && <span className="h-2 w-2 rounded-full bg-cobalto" />}
      </span>
      <span className="flex-1">
        {tag && <span className="t-label block text-[10px] text-concreto">{tag}</span>}
        <span className="block font-semibold text-preto">{label}</span>
        {desc && <span className="mt-0.5 block text-sm text-concreto">{desc}</span>}
      </span>
      {aside && <span className="t-num text-sm text-marinho">{aside}</span>}
    </label>
  )
}

function Confirmacao({ total }: { total: number }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <p className="t-label text-cobalto">Checkout / Concluído</p>
      <h1 className="t-display mt-4 text-[clamp(2.4rem,6vw,4rem)] text-marinho">Pedido simulado.</h1>
      <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-preto/80">
        Nenhuma cobrança foi feita. O pagamento pelo Mercado Pago entra na próxima etapa do projeto.
      </p>
      <p className="t-num mt-6 text-marinho">Total: {formatPrice(total)}</p>
      <Link to="/loja" className="btn btn-primary mt-10">Voltar pra loja</Link>
    </div>
  )
}

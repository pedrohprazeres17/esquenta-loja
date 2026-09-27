import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { accountsDb, ordersDb, type Account } from '@/lib/db'
import type { Order } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABEL, itemCount, orderNumber } from '@/lib/orders'
import { Field } from '@/components/form/Field'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
})

const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Nome obrigatório'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'As senhas não batem',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export function Conta() {
  const [account, setAccount] = useState<Account | null>(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    accountsDb.current().then(a => {
      setAccount(a)
      setChecking(false)
    })
  }, [])

  if (checking) return null

  return account
    ? <MinhaConta account={account} onSignOut={() => setAccount(null)} />
    : <Entrar onEnter={setAccount} />
}

function Entrar({ onEnter }: { onEnter: (account: Account) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onLogin(data: LoginForm) {
    setError('')
    try {
      onEnter(await accountsDb.signIn(data.email, data.password))
    } catch (err) {
      setError((err as Error).message)
    }
  }

  async function onRegister(data: RegisterForm) {
    setError('')
    try {
      onEnter(await accountsDb.signUp(data.email, data.password, data.name))
    } catch (err) {
      setError((err as Error).message || 'Não deu pra criar a conta. Tente de novo.')
    }
  }

  const le = loginForm.formState.errors
  const re = registerForm.formState.errors

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-10 md:pt-14">
      <p className="t-label text-cobalto">Conta</p>
      <h1 className="t-display mt-3 text-[clamp(2.4rem,6vw,3.75rem)] text-marinho">
        {mode === 'login' ? 'Entrar.' : 'Criar conta.'}
      </h1>
      <p className="mt-4 text-preto/75">
        {mode === 'login' ? 'Pra acompanhar pedido e salvar endereço.' : 'Cadastro só pra maiores de 18.'}
      </p>

      <div className="mt-8 flex border-b border-linha">
        {(['login', 'register'] as const).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError('') }}
            aria-pressed={mode === m}
            className={cn(
              't-label -mb-px flex-1 border-b-2 pb-3 transition-colors',
              mode === m ? 'border-cobalto text-marinho' : 'border-transparent text-concreto hover:text-marinho',
            )}
          >
            {m === 'login' ? 'Entrar' : 'Cadastrar'}
          </button>
        ))}
      </div>

      {error && <p className="mt-6 border-l-2 border-marinho bg-branco p-4 text-sm font-semibold text-marinho">{error}</p>}

      {mode === 'login' ? (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="mt-6 flex flex-col gap-4" noValidate>
          <Field label="E-mail" error={le.email?.message}>
            <input {...loginForm.register('email')} type="email" placeholder="seu@email.com" autoComplete="email" />
          </Field>
          <Field label="Senha" error={le.password?.message}>
            <input {...loginForm.register('password')} type="password" placeholder="••••••••" autoComplete="current-password" />
          </Field>
          <button type="submit" className="btn btn-primary mt-2 w-full" disabled={loginForm.formState.isSubmitting}>
            {loginForm.formState.isSubmitting ? 'Entrando' : 'Entrar'}
          </button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(onRegister)} className="mt-6 flex flex-col gap-4" noValidate>
          <Field label="Nome" error={re.name?.message}>
            <input {...registerForm.register('name')} placeholder="Seu nome" autoComplete="name" />
          </Field>
          <Field label="E-mail" error={re.email?.message}>
            <input {...registerForm.register('email')} type="email" placeholder="seu@email.com" autoComplete="email" />
          </Field>
          <Field label="Senha" error={re.password?.message}>
            <input {...registerForm.register('password')} type="password" placeholder="••••••••" autoComplete="new-password" />
          </Field>
          <Field label="Confirmar senha" error={re.confirmPassword?.message}>
            <input {...registerForm.register('confirmPassword')} type="password" placeholder="••••••••" autoComplete="new-password" />
          </Field>
          <button type="submit" className="btn btn-primary mt-2 w-full" disabled={registerForm.formState.isSubmitting}>
            {registerForm.formState.isSubmitting ? 'Criando' : 'Criar conta'}
          </button>
        </form>
      )}
    </div>
  )
}

function MinhaConta({ account, onSignOut }: { account: Account; onSignOut: () => void }) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    ordersDb.getByEmail(account.email).then(setOrders)
  }, [account.email])

  async function signOut() {
    await accountsDb.signOut()
    onSignOut()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-10 md:pt-14">
      <p className="t-label text-cobalto">Conta</p>
      <h1 className="t-display mt-3 text-[clamp(2.4rem,6vw,3.75rem)] text-marinho">
        Olá, {account.name.split(' ')[0]}.
      </h1>
      <p className="mt-4 text-preto/75">{account.email}</p>

      <h2 className="t-label mt-12 text-marinho">Pedidos</h2>
      {orders.length === 0 ? (
        <div className="mt-4 bg-branco p-6">
          <p className="text-preto/75">Nenhum pedido com esse e-mail ainda.</p>
          <Link to="/loja" className="btn btn-primary mt-5">Ver jogos</Link>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {orders.map(o => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 bg-branco p-5">
              <div>
                <p className="t-num text-sm text-marinho">Pedido {orderNumber(o)}</p>
                <p className="mt-1 text-sm text-concreto">
                  {new Date(o.created_at).toLocaleDateString('pt-BR')} · {itemCount(o)} itens
                </p>
              </div>
              <div className="text-right">
                <p className="t-num text-sm">{formatPrice(o.total_cents)}</p>
                <p className="t-label mt-1 text-[10px] text-cobalto">{ORDER_STATUS_LABEL[o.status]}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button onClick={signOut} className="btn btn-outline mt-10">Sair</button>
    </div>
  )
}

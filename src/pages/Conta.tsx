import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/supabase'
import { cn } from '@/lib/utils'
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
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onLogin(data: LoginForm) {
    setError('')
    setNotice('')
    try {
      await authApi.signIn(data.email, data.password)
      navigate('/')
    } catch {
      setError('E-mail ou senha incorretos.')
    }
  }

  async function onRegister(data: RegisterForm) {
    setError('')
    setNotice('')
    try {
      const res = await authApi.signUp(data.email, data.password, data.name)
      if (res.session) {
        navigate('/')
      } else {
        // Projeto com confirmação de e-mail ligada: sessão só vem após confirmar.
        setMode('login')
        setNotice('Conta criada. Se chegar um e-mail de confirmação, confirme e depois entre.')
      }
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
      {notice && <p className="mt-6 border-l-2 border-cobalto bg-branco p-4 text-sm text-preto">{notice}</p>}

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

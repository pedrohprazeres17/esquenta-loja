import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/lib/supabase'
import { FitaObra } from '@/components/brand'

const loginSchema = z.object({
  email: z.string().email('Email invalido'),
  password: z.string().min(6, 'Minimo 6 caracteres'),
})

const registerSchema = loginSchema.extend({
  name: z.string().min(3, 'Nome obrigatorio'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Senhas nao conferem',
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
      setError('Email ou senha incorretos.')
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
        setNotice('Conta criada! Se pedirem, confirme o e-mail e então entre.')
      }
    } catch (err) {
      setError((err as Error).message || 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1
        className="section-title mb-2"
        style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(2rem, 6vw, 4rem)', color: 'var(--papel)' }}
      >
        {mode === 'login' ? 'ENTRAR.' : 'CRIAR CONTA.'}
      </h1>
      <p className="font-mono text-sm mb-10" style={{ color: 'color-mix(in srgb, var(--papel) 50%, transparent)' }}>
        {mode === 'login' ? 'Acesse sua conta ESQUENTA.' : 'Crie sua conta. E-commerce adult BR.'}
      </p>

      <FitaObra height="6px" className="mb-8" />

      {/* Tab switcher */}
      <div className="flex border-2 mb-8" style={{ borderColor: 'var(--papel)' }}>
        {(['login', 'register'] as const).map((m, i) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError('') }}
            className="flex-1 py-3 font-display uppercase text-sm transition-colors"
            style={{
              fontFamily: 'Anton, sans-serif',
              backgroundColor: mode === m ? 'var(--vermelho)' : 'transparent',
              color: mode === m ? 'var(--papel)' : 'color-mix(in srgb, var(--papel) 60%, transparent)',
              borderRight: i === 0 ? '2px solid var(--papel)' : 'none',
            }}
          >
            {m === 'login' ? 'ENTRAR' : 'CADASTRAR'}
          </button>
        ))}
      </div>

      {error && (
        <p className="font-mono text-sm mb-4 p-3 border-2" style={{ borderColor: 'var(--vermelho)', color: 'var(--vermelho)' }}>
          {error}
        </p>
      )}

      {notice && (
        <p className="font-mono text-sm mb-4 p-3 border-2" style={{ borderColor: 'var(--amarelo)', color: 'var(--amarelo)' }}>
          {notice}
        </p>
      )}

      {mode === 'login' ? (
        <form onSubmit={loginForm.handleSubmit(onLogin)} className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>EMAIL</label>
            <input {...loginForm.register('email')} type="email" placeholder="seu@email.com" />
            {loginForm.formState.errors.email && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{loginForm.formState.errors.email.message}</p>}
          </div>
          <div>
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>SENHA</label>
            <input {...loginForm.register('password')} type="password" placeholder="••••••••" />
            {loginForm.formState.errors.password && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{loginForm.formState.errors.password.message}</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={loginForm.formState.isSubmitting}>
            {loginForm.formState.isSubmitting ? 'ENTRANDO...' : 'ENTRAR'}
          </button>
        </form>
      ) : (
        <form onSubmit={registerForm.handleSubmit(onRegister)} className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>NOME</label>
            <input {...registerForm.register('name')} placeholder="Seu nome" />
            {registerForm.formState.errors.name && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{registerForm.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>EMAIL</label>
            <input {...registerForm.register('email')} type="email" placeholder="seu@email.com" />
            {registerForm.formState.errors.email && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{registerForm.formState.errors.email.message}</p>}
          </div>
          <div>
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>SENHA</label>
            <input {...registerForm.register('password')} type="password" placeholder="••••••••" />
            {registerForm.formState.errors.password && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{registerForm.formState.errors.password.message}</p>}
          </div>
          <div>
            <label className="font-mono text-xs uppercase mb-1 block" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>CONFIRMAR SENHA</label>
            <input {...registerForm.register('confirmPassword')} type="password" placeholder="••••••••" />
            {registerForm.formState.errors.confirmPassword && <p className="font-mono text-xs mt-1" style={{ color: 'var(--vermelho)' }}>{registerForm.formState.errors.confirmPassword.message}</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full mt-2" disabled={registerForm.formState.isSubmitting}>
            {registerForm.formState.isSubmitting ? 'CRIANDO...' : 'CRIAR CONTA'}
          </button>
        </form>
      )}
    </div>
  )
}

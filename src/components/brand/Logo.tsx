import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import logoBranco from '@/assets/brand/logo-branco.svg'
import logoMarinho from '@/assets/brand/logo-marinho.svg'

// Logo oficial em contorno (marca/logo). Não redesenhar nem distorcer.
// Marinho sobre papel é a principal; branco sobre cobalto é a negativa.
// Mínimo de 200 px de largura na tela.
const versoes = {
  marinho: logoMarinho,
  branco: logoBranco,
}

interface LogoProps {
  versao?: keyof typeof versoes
  className?: string
}

export function LogoStatic({ versao = 'marinho', className }: LogoProps) {
  return (
    <img
      src={versoes[versao]}
      alt="Spark"
      width={200}
      height={36}
      className={cn('block h-auto w-[200px] select-none', className)}
      draggable={false}
    />
  )
}

export function Logo({ linkTo = '/', ...props }: LogoProps & { linkTo?: string }) {
  return (
    <Link to={linkTo} className="shrink-0">
      <LogoStatic {...props} />
    </Link>
  )
}

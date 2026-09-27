import { Link } from 'react-router-dom'
import { LogoStatic, Selo18 } from '@/components/brand'

const blocos = [
  {
    n: '01',
    titulo: 'O que tem',
    texto: 'Jogos de carta, beer pong, copos e kits. Tudo pensado pra jogar em grupo.',
  },
  {
    n: '02',
    titulo: 'Pra quem',
    texto: 'Pra quem tem de 18 a 30 anos e junta a galera antes de sair. Venda só pra maiores de 18.',
  },
  {
    n: '03',
    titulo: 'O que não tem',
    texto: 'Bebida. A Spark não vende álcool, e os jogos funcionam com ou sem.',
  },
  {
    n: '04',
    titulo: 'Entrega',
    texto: 'Envio pro Brasil todo, com frete calculado pelo CEP. Grátis acima de R$ 150.',
  },
]

export function Sobre() {
  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 md:pb-20 md:pt-16">
        <p className="t-label text-cobalto">Sobre a Spark</p>
        <h1 className="t-display mt-5 text-[clamp(2.9rem,7vw,6rem)] text-marinho">
          A sexta
          <br />
          começa antes.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-preto/85">
          Spark é faísca: o que dá a partida. A gente vende jogos e acessórios pro pré, o encontro antes da festa.
        </p>
      </section>

      <section className="border-t border-linha">
        <div className="mx-auto grid max-w-7xl gap-x-8 gap-y-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20 lg:grid-cols-4">
          {blocos.map(b => (
            <div key={b.n} className="border-t-2 border-marinho pt-5">
              <p className="t-num text-sm text-cobalto">{b.n}</p>
              <h2 className="t-label mt-3 text-marinho">{b.titulo}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-preto/80">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-branco">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <LogoStatic versao="marinho" className="w-[220px]" />
            <Selo18 className="text-marinho" />
          </div>
          <div className="flex items-center gap-6">
            <p className="t-label text-concreto">Est. 2026</p>
            <Link to="/loja" className="btn btn-primary">Ver jogos</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

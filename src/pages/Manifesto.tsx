import { FitaObra, LogoStatic } from '@/components/brand'

export function Manifesto() {
  return (
    <div>
      <section
        className="grain relative px-6 pt-20 pb-16"
        style={{ backgroundColor: 'var(--papel)' }}
      >
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-sm uppercase mb-4" style={{ color: 'var(--vinho)', letterSpacing: '0.2em' }}>
            ★ EST · 2026 · BR ★
          </p>
          <h1
            className="section-title mb-6"
            style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(3rem, 8vw, 7rem)', color: 'var(--preto)', lineHeight: 0.9 }}
          >
            A GENTE NAO VENDE FESTA. A GENTE ESQUENTA.
          </h1>
        </div>
      </section>

      <FitaObra height="8px" />

      <section className="max-w-4xl mx-auto px-6 py-20 flex flex-col gap-16">
        <div className="flex flex-col gap-6">
          <h2
            className="section-title text-4xl"
            style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}
          >
            01 · O PRODUTO
          </h2>
          <p className="font-mono text-base" style={{ lineHeight: 1.9, color: 'color-mix(in srgb, var(--papel) 85%, transparent)' }}>
            Curadoria, nao catalogo. Cada produto da ESQUENTA existe porque alguem
            testou em real, numa real, e voltou dizendo que precisava existir.
            Nada de item generico de marketplace. Nada de foto de stock.
            Cada jogo, cada copo, cada kit foi pensado pra uma coisa: puxar o role.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <h2
            className="section-title text-4xl"
            style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}
          >
            02 · A VOZ
          </h2>
          <p className="font-mono text-base" style={{ lineHeight: 1.9, color: 'color-mix(in srgb, var(--papel) 85%, transparent)' }}>
            Brasileira, sem sotaque de gringa. A ESQUENTA fala como quem ja chegou.
            Sem "bem-vindos" corporativo. Sem exclamacao de loja de festa infantil.
            Seco. Certo. Na veia.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <h2
            className="section-title text-4xl"
            style={{ fontFamily: 'Anton, sans-serif', color: 'var(--vermelho)' }}
          >
            03 · O CANAL
          </h2>
          <p className="font-mono text-base" style={{ lineHeight: 1.9, color: 'color-mix(in srgb, var(--papel) 85%, transparent)' }}>
            Feita pra ser filmada. Cada embalagem, cada copo, cada carta
            foi desenhado pra aparecer bem no stories. Nao porque a gente
            e uma marca de conteudo — mas porque produto bom merece imagem boa.
          </p>
        </div>

        <div
          className="border-l-4 pl-6 py-2"
          style={{ borderColor: 'var(--vermelho)' }}
        >
          <p
            className="section-title"
            style={{ fontFamily: 'Anton, sans-serif', fontSize: 'clamp(1.5rem, 4vw, 3rem)', color: 'var(--papel)' }}
          >
            ESQUENTA AI. A GENTE PUXA O RESTO.
          </p>
        </div>

        <div className="flex items-center gap-4 pt-8 border-t-2" style={{ borderColor: 'color-mix(in srgb, var(--papel) 15%, transparent)' }}>
          <LogoStatic variant="monogram" size="sm" />
          <div>
            <p className="font-mono text-sm" style={{ color: 'color-mix(in srgb, var(--papel) 60%, transparent)' }}>Pedro · Projeto Ind. 2026</p>
            <p className="font-mono text-xs" style={{ color: 'color-mix(in srgb, var(--papel) 40%, transparent)' }}>Guia de Marca v0.1 · Rascunho</p>
          </div>
        </div>
      </section>
    </div>
  )
}

import type { Product } from '@/types'

// Ficha técnica (componente "etiqueta" do manual) e conteúdo da caixa.
// Os números vêm do catálogo. Produto novo, criado pelo /admin, fica só com
// peso e medidas até ganhar uma entrada aqui.
interface ProductDetails {
  ficha: { label: string; value: string }[]
  caixa: string[]
  comoJoga?: string
}

const details: Record<string, ProductDetails> = {
  'spark-cartas-001': {
    ficha: [
      { label: 'Cartas', value: '220' },
      { label: 'Categorias', value: '4' },
      { label: 'Jogadores', value: '3 a 8' },
      { label: 'Partida', value: '60 min' },
    ],
    caixa: ['220 cartas', 'Regras em português', 'Caixa numerada'],
    comoJoga: 'Quem dá as cartas distribui 3 pra cada um. Quem puxar carta de ação cumpre ou passa pra alguém da roda.',
  },
  'kit-beer-pong-profissional': {
    ficha: [
      { label: 'Mesa', value: '240 cm' },
      { label: 'Copos', value: '22' },
      { label: 'Bolinhas', value: '4' },
    ],
    caixa: ['Mesa dobrável de 240 cm', '22 copos', '4 bolinhas laváveis', 'Regras'],
  },
  'copo-spark-500ml': {
    ficha: [
      { label: 'Capacidade', value: '500 ml' },
      { label: 'Parede', value: 'Dupla' },
      { label: 'Gelado por', value: '6 h' },
    ],
    caixa: ['1 copo de 500 ml', 'Tampa com encaixe'],
  },
  'kit-completo-drop-001': {
    ficha: [
      { label: 'Cartas', value: '220' },
      { label: 'Copo', value: '500 ml' },
      { label: 'Dados', value: '6' },
    ],
    caixa: ['Spark Cartas (220 cartas)', 'Copo Spark 500 ml', 'Dados Spark Pack (6 dados)', 'Caixa numerada'],
  },
  'dados-spark-pack': {
    ficha: [{ label: 'Dados', value: '6' }],
    caixa: ['6 dados com as ações do jogo', 'Bolsa de veludo', 'Instruções'],
  },
  'shots-spark': {
    ficha: [
      { label: 'Copos', value: '6' },
      { label: 'Capacidade', value: '60 ml' },
    ],
    caixa: ['6 copos de shot de 60 ml'],
  },
  'verdade-ou-gole': {
    ficha: [{ label: 'Cartas', value: '150' }],
    caixa: ['150 cartas de pergunta', 'Regras em português'],
  },
  'eu-nunca-deluxe': {
    ficha: [
      { label: 'Cartas', value: '200' },
      { label: 'Papel', value: 'Premium' },
    ],
    caixa: ['200 cartas de eu nunca', 'Regras em português'],
  },
  'roleta-do-shot': {
    ficha: [{ label: 'Copos', value: '16' }],
    caixa: ['Roleta giratória', '16 copos de shot numerados'],
  },
  'beer-pong-neon-glow': {
    ficha: [
      { label: 'Copos', value: '24' },
      { label: 'Bolinhas', value: '6' },
      { label: 'Luz negra', value: '1' },
    ],
    caixa: ['24 copos neon', '6 bolinhas que brilham no escuro', '1 luz negra'],
  },
  'caneca-chopp-1l': {
    ficha: [
      { label: 'Capacidade', value: '1 L' },
      { label: 'Material', value: 'Vidro' },
    ],
    caixa: ['1 caneca de vidro de 1 litro'],
  },
  'kit-pre-game': {
    ficha: [
      { label: 'Cartas', value: '150' },
      { label: 'Roleta', value: '1' },
      { label: 'Copos', value: '4' },
    ],
    caixa: ['Verdade ou Gole (150 cartas)', 'Roleta do Shot', '4 copos'],
  },
}

function formatWeight(grams: number) {
  return grams >= 1000 ? `${(grams / 1000).toLocaleString('pt-BR')} kg` : `${grams} g`
}

export function getProductDetails(product: Product) {
  const extra = details[product.slug]
  const ficha = [...(extra?.ficha ?? [])]
  if (product.weight_grams) ficha.push({ label: 'Peso', value: formatWeight(product.weight_grams) })
  if (product.length_cm && product.width_cm && product.height_cm) {
    ficha.push({ label: 'Medidas', value: `${product.length_cm} × ${product.width_cm} × ${product.height_cm} cm` })
  }
  return { ficha, caixa: extra?.caixa ?? [], comoJoga: extra?.comoJoga }
}

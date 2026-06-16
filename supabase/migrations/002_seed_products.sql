-- ESQUENTA · Seed de produtos reais (DROP 001) com dados de dropshipping
-- Rode DEPOIS do 001_initial_schema.sql, no SQL Editor do Supabase.
-- Idempotente: pode rodar mais de uma vez sem duplicar (on conflict do nothing).

-- ─── Fornecedor ───────────────────────────────────────────
-- Distribuidora nacional (postagem rápida, sem alfândega). Troque os dados
-- pelo fornecedor real que você fechar. type 'manual' = você dispara o pedido.
insert into public.suppliers (id, name, website, type, notes) values
  (
    '11111111-1111-1111-1111-111111111111',
    'Distribuidora Festa Brasil',
    'https://www.originalfestas.com.br',
    'manual',
    'Fornecedor nacional (SP). Postagem D+1, entrega 3-7 dias via Melhor Envio. Confirmar custo e foto reais por SKU antes de publicar.'
  )
on conflict (id) do nothing;

-- ─── Produtos (DROP 001) ──────────────────────────────────
-- price_cents = preço de venda · supplier_price_cents = seu custo (margem explícita)
-- image_urls: troque pelos links das fotos reais do fornecedor pelo /admin.
insert into public.products
  (slug, name, description, price_cents, category, image_urls, stock,
   is_featured, is_limited, edition_number, max_edition,
   supplier_id, supplier_sku, supplier_price_cents, supplier_url)
values
  (
    'esquenta-cartas-001',
    'ESQUENTA CARTAS',
    'O jogo de cartas mais honesto do mercado. 220 cartas pra puxar rolê, criar mico e garantir que a sexta não vai ser esquecida. Sem filtro. Sem julgamento. Com muito drink.',
    8990, 'cartas',
    array['https://placehold.co/600x800/0E0D0B/FF2A1F?text=CARTAS+001&font=montserrat'],
    47, true, true, 1, 500,
    '11111111-1111-1111-1111-111111111111', 'EQ-CARTAS-001', 3500, null
  ),
  (
    'kit-beer-pong-profissional',
    'KIT BEER PONG PRO',
    'Mesa oficial 240cm, 22 copos ESQUENTA, 4 bolinhas laváveis e regras do rolê. Tudo que você precisa pra montar o campeonato mais legítimo da república.',
    14990, 'beer-pong',
    array['https://placehold.co/600x800/0E0D0B/FF2A1F?text=BEER+PONG&font=montserrat'],
    23, true, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-BP-PRO', 6000, 'https://www.originalfestas.com.br/kit-beer-pong-descartavel-500m-12-copos-e-2-bolinhas'
  ),
  (
    'copo-esquenta-500ml',
    'COPO ESQUENTA 500ML',
    'Copo de festa que dura mais que a ressaca. 500ml, dupla camada, mantém o drink gelado por 6h. Wordmark em relevo. Lavável na máquina. Sobrevive à república.',
    3990, 'copos',
    array['https://placehold.co/600x800/0E0D0B/E8E1D2?text=COPO+500ML&font=montserrat'],
    150, true, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-COPO-500', 1500, null
  ),
  (
    'kit-completo-drop-001',
    'KIT DROP 001',
    'Cartas + Copo + Dados. Tudo num kit pra quem não quer chegar na sexta na mão. Embalagem exclusiva do Drop 001. Edição numerada.',
    12990, 'kits',
    array['https://placehold.co/600x800/6F1009/E8E1D2?text=KIT+DROP+001&font=montserrat'],
    30, true, true, 1, 200,
    '11111111-1111-1111-1111-111111111111', 'EQ-KIT-D001', 5200, null
  ),
  (
    'dados-esquenta-pack',
    'DADOS ESQUENTA PACK',
    '6 dados personalizados com as ações do rolê. Versão compacta pra levar no bolso. Funciona com ou sem bebida (mas melhor com).',
    2490, 'acessorios',
    array['https://placehold.co/600x800/0E0D0B/FFE800?text=DADOS&font=montserrat'],
    200, false, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-DADOS-001', 900, null
  ),
  (
    'copo-shot-esquenta',
    'SHOTS ESQUENTA (6-PACK)',
    'Pack com 6 copos de shot de 60ml. Cada um com uma frase do rolê. Pra quando o jogo pede consequências reais.',
    2990, 'copos',
    array['https://placehold.co/600x800/0E0D0B/FF2A1F?text=SHOTS+6PACK&font=montserrat'],
    80, false, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-SHOT-6PK', 1200, null
  )
on conflict (slug) do nothing;

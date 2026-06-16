-- ESQUENTA · Imagens reais (Unsplash) + ampliação do catálogo (DROP 001)
-- Imagens verificadas (200 image/jpeg) e revisadas visualmente uma a uma.

-- ─── 1. Troca placehold.co por fotos reais nos 6 produtos existentes ──
update public.products set image_urls = array['https://images.unsplash.com/photo-1556195332-95503f664ced?w=900&h=1100&fit=crop&q=80&auto=format'] where slug = 'esquenta-cartas-001';
update public.products set image_urls = array['https://images.unsplash.com/photo-1616428317393-acd93938b4fa?w=900&h=1100&fit=crop&q=80&auto=format'] where slug = 'kit-beer-pong-profissional';
update public.products set image_urls = array['https://images.unsplash.com/photo-1680868164610-c085a6bf8c70?w=900&h=1100&fit=crop&q=80&auto=format'] where slug = 'copo-esquenta-500ml';
update public.products set image_urls = array['https://images.unsplash.com/photo-1485872299829-c673f5194813?w=900&h=1100&fit=crop&q=80&auto=format'] where slug = 'kit-completo-drop-001';
update public.products set image_urls = array['https://images.unsplash.com/photo-1551431009-a802eeec77b1?w=900&h=1100&fit=crop&q=80&auto=format'] where slug = 'dados-esquenta-pack';
update public.products set image_urls = array['https://images.unsplash.com/photo-1707340726386-611f5e9398f3?w=900&h=1100&fit=crop&q=80&auto=format'] where slug = 'copo-shot-esquenta';

-- ─── 2. Novos produtos (mesmo fornecedor nacional) ───────────────────
insert into public.products
  (slug, name, description, price_cents, category, image_urls, stock,
   is_featured, is_limited, edition_number, max_edition,
   supplier_id, supplier_sku, supplier_price_cents,
   weight_grams, width_cm, height_cm, length_cm)
values
  (
    'verdade-ou-gole', 'VERDADE OU GOLE',
    $$Esqueça o 'verdade ou desafio' de criança. 150 cartas de perguntas que ninguém quer responder sóbrio. Ou você fala a real, ou vira o gole. Spoiler: todo mundo vira o gole.$$,
    4990, 'cartas',
    array['https://images.unsplash.com/photo-1636583133884-fbefc7ac3fb3?w=900&h=1100&fit=crop&q=80&auto=format'],
    60, false, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-VOG-150', 2000,
    350, 11, 4, 16
  ),
  (
    'eu-nunca-deluxe', 'EU NUNCA — DELUXE',
    $$O clássico que detona amizade e começa romance. 200 cartas de 'eu nunca' que vão de inocente a 'peraí, QUANDO foi isso?'. Papel premium, zero vergonha inclusa.$$,
    4490, 'cartas',
    array['https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=900&h=1100&fit=crop&q=80&auto=format'],
    75, false, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-NUNCA-200', 1800,
    350, 11, 4, 16
  ),
  (
    'roleta-do-shot', 'ROLETA DO SHOT',
    $$A sorte decide quem bebe. Roleta giratória + 16 copos de shot numerados. Gira, reza e torce pra não cair no seu número. O brinquedo mais democrático do rolê.$$,
    5990, 'acessorios',
    array['https://images.unsplash.com/photo-1703201162166-4185fe1aaad6?w=900&h=1100&fit=crop&q=80&auto=format'],
    40, true, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-ROLETA-16', 2600,
    900, 30, 12, 30
  ),
  (
    'beer-pong-neon-glow', 'BEER PONG NEON',
    $$Mesma regra, outro nível. Kit beer pong que brilha no escuro: 24 copos neon, 6 bolinhas glow e luz negra de brinde. Apaga a luz e deixa o jogo virar pista.$$,
    8990, 'beer-pong',
    array['https://images.unsplash.com/photo-1680404961803-6e3e119dcfe3?w=900&h=1100&fit=crop&q=80&auto=format'],
    35, true, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-BP-NEON', 4000,
    1200, 28, 12, 40
  ),
  (
    'caneca-chopp-1l', 'CANECA CHOPP 1L',
    $$Um litro porque meio litro é pra quem tem hora pra ir embora. Caneca de vidro grosso, alça reforçada, wordmark gravado a laser. Aguenta o tranco e a mesa de bar.$$,
    5490, 'copos',
    array['https://images.unsplash.com/photo-1608270586620-248524c67de9?w=900&h=1100&fit=crop&q=80&auto=format'],
    90, false, false, null, null,
    '11111111-1111-1111-1111-111111111111', 'EQ-CANECA-1L', 2200,
    700, 14, 16, 16
  ),
  (
    'kit-pre-game', 'KIT PRÉ-GAME',
    $$O esquenta antes do esquenta. Cartas Verdade ou Gole + Roleta do Shot + 4 copos. Pra quando a galera chega cedo e ninguém quer esperar a festa começar. Ela começa aqui.$$,
    9990, 'kits',
    array['https://images.unsplash.com/photo-1591243315780-978fd00ff9db?w=900&h=1100&fit=crop&q=80&auto=format'],
    25, true, true, 1, 300,
    '11111111-1111-1111-1111-111111111111', 'EQ-KIT-PREGAME', 4200,
    1500, 30, 14, 30
  )
on conflict (slug) do nothing;

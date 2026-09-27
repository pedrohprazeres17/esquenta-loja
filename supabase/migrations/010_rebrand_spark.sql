-- Spark · Rebrand do catálogo (ex-ESQUENTA, set/2026)
-- Nomes, slugs, textos na voz da marca nova, imagens e destaques da home.
-- As imagens moram no site (public/produtos) e são referenciadas por caminho
-- relativo, que funciona no GitHub Pages e no dev.
-- Idempotente: casa pelo slug antigo ou pelo novo.

update public.products set
  slug = 'spark-cartas-001',
  name = 'SPARK CARTAS',
  description = '220 cartas em 4 categorias. De 3 a 8 pessoas, uma hora de jogo.',
  image_urls = array['produtos/spark-cartas-001.webp'],
  is_featured = false
where slug in ('esquenta-cartas-001', 'spark-cartas-001');

update public.products set
  description = 'Mesa dobrável de 240 cm, 22 copos e 4 bolinhas laváveis. Regras na caixa.',
  image_urls = array['produtos/kit-beer-pong-profissional.webp'],
  is_featured = true
where slug = 'kit-beer-pong-profissional';

update public.products set
  slug = 'copo-spark-500ml',
  name = 'COPO SPARK 500 ML',
  description = '500 ml, parede dupla. Mantém gelado por 6 horas e vai na lava-louça.',
  image_urls = array['produtos/copo-spark-500ml.webp'],
  is_featured = true
where slug in ('copo-esquenta-500ml', 'copo-spark-500ml');

update public.products set
  description = 'Spark Cartas, Copo 500 ml e 6 dados na mesma caixa. Edição numerada de 200.',
  image_urls = array['produtos/kit-completo-drop-001.webp'],
  is_featured = false
where slug = 'kit-completo-drop-001';

update public.products set
  slug = 'dados-spark-pack',
  name = 'DADOS SPARK PACK',
  description = '6 dados com as ações do jogo. Cabe no bolso e funciona com ou sem bebida.',
  image_urls = array['produtos/dados-spark-pack.webp'],
  is_featured = false
where slug in ('dados-esquenta-pack', 'dados-spark-pack');

update public.products set
  slug = 'shots-spark',
  name = 'SHOTS SPARK (6 UN.)',
  description = '6 copos de shot de 60 ml, cada um com uma frase diferente.',
  image_urls = array['produtos/shots-spark.webp'],
  is_featured = false
where slug in ('copo-shot-esquenta', 'shots-spark');

update public.products set
  description = '150 perguntas. Responde ou bebe.',
  image_urls = array['produtos/verdade-ou-gole.webp'],
  is_featured = true
where slug = 'verdade-ou-gole';

update public.products set
  name = 'EU NUNCA DELUXE',
  description = '200 cartas de eu nunca. Começa leve e piora. Papel premium.',
  image_urls = array['produtos/eu-nunca-deluxe.webp'],
  is_featured = false
where slug = 'eu-nunca-deluxe';

update public.products set
  description = 'Roleta com 16 copos de shot numerados. Gira e ela escolhe quem bebe.',
  image_urls = array['produtos/roleta-do-shot.webp'],
  is_featured = true
where slug = 'roleta-do-shot';

update public.products set
  description = '24 copos neon, 6 bolinhas que brilham e uma luz negra. Pra jogar com a luz apagada.',
  image_urls = array['produtos/beer-pong-neon-glow.webp'],
  is_featured = false
where slug = 'beer-pong-neon-glow';

update public.products set
  name = 'CANECA CHOPP 1 L',
  description = '1 litro, vidro grosso e alça reforçada. Logo gravado a laser.',
  image_urls = array['produtos/caneca-chopp-1l.webp'],
  is_featured = false
where slug = 'caneca-chopp-1l';

update public.products set
  description = 'Verdade ou Gole, Roleta do Shot e 4 copos. Pra quando a galera chega cedo.',
  image_urls = array['produtos/kit-pre-game.webp'],
  is_featured = true
where slug = 'kit-pre-game';

-- SKUs internos saem do prefixo da marca antiga.
update public.product_supply
set supplier_sku = 'SP-' || substr(supplier_sku, 4)
where supplier_sku like 'EQ-%';

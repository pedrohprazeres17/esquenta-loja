-- ESQUENTA · Ajustes de imagem após auditoria visual produto-a-produto
-- 3 trocas pra fidelidade com o produto (revisadas uma a uma):
--   SHOTS 6-PACK: 1 copo vazio -> 3 shots (mostra que é pack)
--   EU NUNCA:     coquetéis    -> leque de cartas (é jogo de cartas)
--   ROLETA DO SHOT: garrafa    -> roleta (mostra o jogo/sorte)

update public.products
  set image_urls = array['https://images.unsplash.com/photo-1608635360956-5ebde7952ed6?w=900&h=1100&fit=crop&q=80&auto=format']
  where slug = 'copo-shot-esquenta';

update public.products
  set image_urls = array['https://images.unsplash.com/photo-1623522264952-8dff960ec8f2?w=900&h=1100&fit=crop&q=80&auto=format']
  where slug = 'eu-nunca-deluxe';

update public.products
  set image_urls = array['https://images.unsplash.com/photo-1625888791210-40ea41c1d0f3?w=900&h=1100&fit=crop&q=80&auto=format']
  where slug = 'roleta-do-shot';

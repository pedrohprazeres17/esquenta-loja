-- ESQUENTA · Dimensões de envio nos produtos (necessário pro Melhor Envio)
-- Peso em gramas, medidas em cm. Defaults respeitam o mínimo dos Correios
-- (largura >= 11, altura >= 2, comprimento >= 16).

alter table public.products
  add column if not exists weight_grams integer not null default 300 check (weight_grams > 0),
  add column if not exists width_cm     integer not null default 11  check (width_cm  >= 11),
  add column if not exists height_cm    integer not null default 5   check (height_cm >= 2),
  add column if not exists length_cm    integer not null default 16  check (length_cm >= 16);

-- Valores reais por produto do DROP 001
update public.products set weight_grams = 350,  width_cm = 11, height_cm = 4,  length_cm = 16 where slug = 'esquenta-cartas-001';
update public.products set weight_grams = 2500, width_cm = 30, height_cm = 12, length_cm = 62 where slug = 'kit-beer-pong-profissional';
update public.products set weight_grams = 250,  width_cm = 11, height_cm = 12, length_cm = 16 where slug = 'copo-esquenta-500ml';
update public.products set weight_grams = 800,  width_cm = 20, height_cm = 12, length_cm = 25 where slug = 'kit-completo-drop-001';
update public.products set weight_grams = 120,  width_cm = 11, height_cm = 4,  length_cm = 16 where slug = 'dados-esquenta-pack';
update public.products set weight_grams = 450,  width_cm = 13, height_cm = 9,  length_cm = 18 where slug = 'copo-shot-esquenta';

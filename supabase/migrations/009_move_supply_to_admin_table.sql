-- ESQUENTA · Tranca custo/fornecedor (deixa de vazar na leitura pública de products)
-- Move supplier_* pra uma tabela própria com RLS só-admin. A leitura pública de
-- products passa a NÃO ter mais custo nem dados de fornecedor.

create table public.product_supply (
  product_id           uuid primary key references public.products(id) on delete cascade,
  supplier_id          uuid references public.suppliers(id) on delete set null,
  supplier_sku         text,
  supplier_price_cents integer check (supplier_price_cents is null or supplier_price_cents >= 0),
  supplier_url         text
);

alter table public.product_supply enable row level security;

-- Só admin lê/escreve (using vale também como with_check no FOR ALL).
create policy "product_supply_admin_all" on public.product_supply
  for all using (
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );

-- Migra os dados que hoje estão em products.
insert into public.product_supply (product_id, supplier_id, supplier_sku, supplier_price_cents, supplier_url)
select id, supplier_id, supplier_sku, supplier_price_cents, supplier_url
from public.products;

-- Remove as colunas vazadas de products (o índice idx_products_supplier_id cai junto).
alter table public.products
  drop column supplier_id,
  drop column supplier_sku,
  drop column supplier_price_cents,
  drop column supplier_url;

-- ESQUENTA · Performance: índices + RLS otimizada (resolve advisor de performance)

-- ─── 1. Índices em foreign keys ─────────────────────────────────
create index if not exists idx_orders_user_id     on public.orders(user_id);
create index if not exists idx_products_supplier_id on public.products(supplier_id);

-- ─── 2. Índices das queries reais do catálogo ───────────────────
create index if not exists idx_products_category    on public.products(category);
create index if not exists idx_products_is_featured  on public.products(is_featured) where is_featured = true;

-- ─── 3. RLS otimizada: (select auth.uid()) avaliado 1x por query ──
-- Também separa o write de admin em INSERT/UPDATE/DELETE pra não
-- sobrepor o SELECT público em products (multiple_permissive_policies).

-- products
drop policy if exists "products_public_read" on public.products;
drop policy if exists "products_admin_write" on public.products;

create policy "products_public_read" on public.products
  for select using (true);

create policy "products_admin_insert" on public.products
  for insert with check (
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );
create policy "products_admin_update" on public.products
  for update using (
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );
create policy "products_admin_delete" on public.products
  for delete using (
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );

-- suppliers
drop policy if exists "suppliers_admin_only" on public.suppliers;
create policy "suppliers_admin_only" on public.suppliers
  for all using (
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );

-- profiles
drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (user_id = (select auth.uid()));

-- orders
drop policy if exists "orders_own_read" on public.orders;
drop policy if exists "orders_insert" on public.orders;
drop policy if exists "orders_admin_update" on public.orders;

create policy "orders_own_read" on public.orders
  for select using (
    user_id = (select auth.uid())
    or exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );
create policy "orders_insert" on public.orders
  for insert with check (user_id = (select auth.uid()) or user_id is null);
create policy "orders_admin_update" on public.orders
  for update using (
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );

-- storage.objects (bucket products)
drop policy if exists "products_images_admin_upload" on storage.objects;
drop policy if exists "products_images_admin_delete" on storage.objects;

create policy "products_images_admin_upload" on storage.objects
  for insert with check (
    bucket_id = 'products' and
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );
create policy "products_images_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'products' and
    exists (select 1 from public.profiles where user_id = (select auth.uid()) and role = 'admin')
  );

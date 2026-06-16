-- ESQUENTA · Schema inicial com suporte a dropshipping

-- Extensões
create extension if not exists "uuid-ossp";

-- ─── Suppliers ────────────────────────────────────────────
create table public.suppliers (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  website     text,
  type        text not null check (type in ('aliexpress', 'shopify', 'manual', 'api')),
  api_url     text,
  notes       text,
  created_at  timestamptz default now()
);

-- ─── Products ─────────────────────────────────────────────
create table public.products (
  id                   uuid primary key default uuid_generate_v4(),
  slug                 text unique not null,
  name                 text not null,
  description          text not null default '',
  price_cents          integer not null check (price_cents >= 0),
  category             text not null check (category in ('cartas','beer-pong','copos','kits','acessorios')),
  image_urls           text[] not null default '{}',
  stock                integer not null default 0 check (stock >= 0),
  is_featured          boolean not null default false,
  is_limited           boolean not null default false,
  edition_number       integer,
  max_edition          integer,
  -- dropshipping
  supplier_id          uuid references public.suppliers(id) on delete set null,
  supplier_sku         text,
  supplier_price_cents integer,
  supplier_url         text,
  created_at           timestamptz default now()
);

-- ─── Profiles ─────────────────────────────────────────────
create table public.profiles (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid unique references auth.users(id) on delete cascade,
  name                 text not null,
  phone                text,
  default_address      jsonb,
  role                 text not null default 'customer' check (role in ('customer','admin')),
  created_at           timestamptz default now()
);

-- ─── Orders ───────────────────────────────────────────────
create table public.orders (
  id                   uuid primary key default uuid_generate_v4(),
  user_id              uuid references auth.users(id) on delete set null,
  items                jsonb not null,
  total_cents          integer not null check (total_cents >= 0),
  status               text not null default 'pending'
    check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  address              jsonb not null,
  payment_id           text,
  payment_method       text check (payment_method in ('pix','credit_card','debit_card')),
  supplier_order_ids   jsonb default '{}',
  tracking_codes       jsonb default '{}',
  created_at           timestamptz default now()
);

-- ─── Row Level Security ───────────────────────────────────

alter table public.products enable row level security;
alter table public.suppliers enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- Products: leitura pública, escrita só admin
create policy "products_public_read" on public.products
  for select using (true);

create policy "products_admin_write" on public.products
  for all using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Suppliers: só admin
create policy "suppliers_admin_only" on public.suppliers
  for all using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Profiles: user lê/edita o proprio
create policy "profiles_own" on public.profiles
  for all using (user_id = auth.uid());

-- Orders: user vê os proprios, admin vê todos
create policy "orders_own_read" on public.orders
  for select using (
    user_id = auth.uid() or
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "orders_insert" on public.orders
  for insert with check (true);

create policy "orders_admin_update" on public.orders
  for update using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── Função: criar profile ao registrar ──────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Storage bucket para imagens ─────────────────────────
insert into storage.buckets (id, name, public) values ('products', 'products', true)
  on conflict do nothing;

create policy "products_images_public_read" on storage.objects
  for select using (bucket_id = 'products');

create policy "products_images_admin_upload" on storage.objects
  for insert with check (
    bucket_id = 'products' and
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

create policy "products_images_admin_delete" on storage.objects
  for delete using (
    bucket_id = 'products' and
    exists (
      select 1 from public.profiles
      where user_id = auth.uid() and role = 'admin'
    )
  );

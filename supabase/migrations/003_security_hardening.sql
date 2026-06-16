-- ESQUENTA · Hardening de segurança (resolve avisos do Supabase advisor)

-- ─── 1. handle_new_user: search_path fixo + sem EXECUTE público ──
-- Recria com search_path travado (impede hijack via objeto homônimo).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

-- Função é trigger interna; não deve ser chamável via RPC (/rest/v1/rpc).
-- Revogar EXECUTE não afeta o trigger (roda como owner da tabela auth.users).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ─── 2. orders_insert: restringe ao próprio usuário ou convidado ──
-- Antes: with check (true) = qualquer um insere qualquer pedido.
-- Agora: logado só cria pedido pra si; convidado (sem login) usa user_id null.
drop policy if exists "orders_insert" on public.orders;
create policy "orders_insert" on public.orders
  for insert
  with check (user_id = auth.uid() or user_id is null);

-- ─── 3. Bucket público: remove listagem ampla ───────────────────
-- Bucket 'products' é público: URLs (getPublicUrl) servem direto pelo CDN
-- sem precisar dessa policy. Ela só habilitava listar TODOS os arquivos.
drop policy if exists "products_images_public_read" on storage.objects;

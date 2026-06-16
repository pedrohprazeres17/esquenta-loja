-- ESQUENTA · Auto-promove o dono da loja a admin no cadastro
-- Remove o passo manual de "rodar UPDATE depois do signup".
-- Qualquer outro e-mail entra como 'customer' (padrão).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (user_id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    case when lower(new.email) = 'pedrohprazeres01@gmail.com' then 'admin' else 'customer' end
  );
  return new;
end;
$$;

-- Mantém a função fora do RPC público (não é chamável por anon/authenticated).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

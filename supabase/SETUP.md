# Ligar o banco de produtos (Supabase) — ~10 min

Enquanto não fizer isso, o site roda em **modo mock** (produtos do `src/data/mockProducts.ts`,
nada persiste). Depois destes passos, o `/admin` salva de verdade e a loja lê do banco.

## 1. Criar o projeto (grátis)
1. Entre em https://supabase.com → **New project**
2. Nome: `esquenta` · defina uma senha de banco · região **South America (São Paulo)**
3. Espere ~2 min provisionar

## 2. Rodar as migrations
No painel do projeto → **SQL Editor** → **New query**, cole e rode (RUN) na ordem:
1. Todo o conteúdo de `supabase/migrations/001_initial_schema.sql` (cria tabelas + RLS + storage)
2. Todo o conteúdo de `supabase/migrations/002_seed_products.sql` (insere os 6 produtos do DROP 001)

## 3. Pegar as credenciais
**Settings → API**, copie:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

Cole no arquivo `.env` (na raiz de `/site`) e **reinicie o `npm run dev`**.
O badge no `/admin` deve virar **● BANCO CONECTADO**.

## 4. Virar admin (pra poder salvar produtos)
As regras de RLS só deixam **admin** escrever em produtos.
O trigger `handle_new_user` (migration 005) **já promove o e-mail do dono**
(`pedrohprazeres01@gmail.com`) a admin no cadastro — basta criar a conta em `/conta`.

Pra promover **outro** e-mail manualmente, no **SQL Editor**:
```sql
update public.profiles set role = 'admin'
where user_id = (select id from auth.users where email = 'voce@email.com');
```

## 5. Frete — Edge Function `calculate-shipping` (JÁ FUNCIONA)
A função está **deployada** e o checkout já calcula o frete **sem você configurar nada**.
Ela tem duas fontes:

- **Motor ESQUENTA (padrão):** tabela própria por região do CEP (origem SP) + peso do
  carrinho. Devolve duas opções — **Padrão** e **Expressa** — com preço e prazo. Zero
  dependência externa. Ex.: SP ~R$ 15,90/3d · Nordeste ~R$ 39,90/10d · Norte ~R$ 34,90/13d.
- **Melhor Envio (opcional, upgrade):** se você setar os secrets abaixo, a função passa a
  usar transportadoras reais (Correios/Jadlog) e só cai no motor próprio se a API falhar.

Peso/dimensões saem da tabela `products` (`weight_grams`, `width_cm`, `height_cm`,
`length_cm`, migration 006). Ajuste por produto no `/admin` conforme a embalagem real.

### (Opcional) Ligar o Melhor Envio depois
1. Conta sandbox: https://sandbox.melhorenvio.com.br → **Configurações → Tokens** → gere um
   token (escopo `shipping-calculate`).
2. Secrets da Edge Function (Dashboard → **Edge Functions → calculate-shipping → Secrets**):
   ```bash
   supabase secrets set MELHOR_ENVIO_TOKEN="seu-token-sandbox"
   supabase secrets set MELHOR_ENVIO_FROM_CEP="01001000"   # CEP de origem da loja
   supabase secrets set MELHOR_ENVIO_SANDBOX="true"          # 'false' em produção
   ```

## Próximos passos (não bloqueiam hoje)
- **Fotos reais**: no `/admin`, cole a URL da foto do fornecedor (campo "Colar URL") ou suba arquivo.
- **Pagamento**: Mercado Pago já está escolhido e scaffoldado (`create-payment-preference`).

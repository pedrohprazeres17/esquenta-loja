# Spark

E-commerce de jogos e acessórios pro pré: cartas, beer pong, copos e kits. Projeto de TCC. A marca se chamava ESQUENTA até set/2026; o manual da Spark fica em `../marca/`.

**Stack:** Vite + React + TypeScript + Tailwind · Supabase (banco, auth, storage) · Mercado Pago (pagamento) · GitHub Pages (deploy).

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
```

O site lê produtos do Supabase quando há credenciais reais no `.env`; senão cai
no catálogo mock (`src/data/mockProducts.ts`). Se o banco falhar uma vez (ex.:
projeto pausado), o resto da sessão usa o mock direto.

## Marca

Tokens em `src/index.css` (cobalto, marinho, papel; Saira e Michroma), logo oficial
em `src/assets/brand/` e componentes do manual em `src/components/brand/`.
Imagens de produto em `public/produtos/`: mockups do pitch e embalagens
renderizadas no padrão do manual. Todas ilustrativas.

## Deploy (GitHub Pages)

Push na branch `main` dispara o workflow `.github/workflows/deploy.yml`, que faz
`npm run build` e publica a pasta `dist/` no Pages. O roteamento usa `HashRouter`
(URLs com `/#/`) pra funcionar em subpath sem configuração extra.

> A `VITE_SUPABASE_ANON_KEY` no `.env.production` é pública por design (protegida
> por Row Level Security). A `service_role` nunca vai pro repositório — fica só
> nos secrets das Edge Functions do Supabase.

## Banco de dados

Migrations versionadas em `supabase/migrations/` (schema, RLS, seed de produtos,
hardening, frete, catálogo). Edge function de frete em `supabase/functions/calculate-shipping/`.
Guia de setup em `supabase/SETUP.md`.

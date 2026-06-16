# ESQUENTA

E-commerce de jogos de festa e acessórios pra rolê adulto brasileiro (cartas autorais, kit beer pong, copos, dados). Projeto de TCC.

**Stack:** Vite + React + TypeScript + Tailwind + shadcn/ui · Supabase (banco, auth, storage) · Mercado Pago (pagamento) · GitHub Pages (deploy).

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
```

O site lê produtos do Supabase quando há credenciais reais no `.env`; senão cai
no catálogo mock (`src/data/mockProducts.ts`).

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

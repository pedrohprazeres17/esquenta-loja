# Spark

E-commerce de jogos e acessórios pro pré: cartas, beer pong, copos e kits. Projeto de TCC. A marca se chamava ESQUENTA até set/2026; o manual da Spark fica em `../marca/`.

**Stack:** Vite + React + TypeScript + Tailwind · banco local no navegador · Mercado Pago (pagamento, pendente) · GitHub Pages (deploy).

## Rodar localmente

```bash
npm install
npm run dev      # http://localhost:5173
```

Não precisa de `.env` nem de servidor: o banco é local (ver abaixo).

## Marca

Tokens em `src/index.css` (cobalto, marinho, papel; Saira e Michroma), logo oficial
em `src/assets/brand/` e componentes do manual em `src/components/brand/`.
Imagens de produto em `public/produtos/`: mockups do pitch e embalagens
renderizadas no padrão do manual. Todas ilustrativas.

## Deploy (GitHub Pages)

Push na branch `main` dispara o workflow `.github/workflows/deploy.yml`, que faz
`npm run build` e publica a pasta `dist/` no Pages. O roteamento usa `HashRouter`
(URLs com `/#/`) pra funcionar em subpath sem configuração extra.

## Banco de dados

A loja usa um banco local no navegador (`src/lib/db.ts`, em cima do
localStorage). Não tem servidor nem conta pra criar:

- **Produtos:** nascem com o catálogo de `src/data/mockProducts.ts` e são editados no `/#/admin`.
- **Pedidos:** gravados no checkout, com status "aguardando pagamento", e listados no admin.
- **Contas:** cadastro e login. A senha é guardada só como hash SHA-256 com sal.

Cada navegador tem o seu banco: o que for cadastrado num aparelho não aparece
em outro. O botão "Restaurar catálogo" no admin volta os produtos pro original.

O frete é calculado no próprio site pela região do CEP e pelo peso (`src/lib/shipping.ts`).

A versão com servidor (Postgres no Supabase, com RLS, migrations e edge
functions) ficou em `supabase/`, fora de uso. O projeto do Supabase pausou por
inatividade em jun/2026.

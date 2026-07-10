# Estrutura Monorepo ProSis

Data da migracao inicial: 10/07/2026

## Estrutura

- Raiz do repositorio: front-end Next.js do ProSis.
- `apps/api`: API Fastify/Prisma migrada do antigo repositorio `bot-api-ff`.

O front foi mantido na raiz para preservar o fluxo atual de deploy da Hostinger via GitHub. A API fica versionada no mesmo repositorio, mas com `package.json`, `package-lock.json`, `tsconfig.json`, `prisma` e `src` proprios.

## Comandos

Na raiz do ProSis:

```bash
npm run dev
npm run dev:all
npm run build
npm run lint
```

Use `npm run dev` quando quiser subir apenas o front. Use `npm run dev:all` para subir front e API juntos em desenvolvimento local. O login local depende da API respondendo em `http://127.0.0.1:3333`.

API dentro do monorepo:

```bash
npm run api:install
npm run api:dev
npm run api:build
npm run api:start
```

Validacao completa dos dois projetos:

```bash
npm run build:all
```

## Variaveis de ambiente

O arquivo real `.env` da API nao foi copiado para o repositorio. Use `apps/api/.env.example` como base para criar `apps/api/.env` no ambiente local ou configurar as variaveis no painel da hospedagem.

## Observacoes de deploy

- O deploy atual do front pode continuar usando a raiz do repositorio.
- A API deve ser configurada na Hostinger apontando para `apps/api`.
- Em desenvolvimento, o front continua podendo chamar a API local em `http://127.0.0.1:3333`.

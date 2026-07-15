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
npm run build:all
npm start
npm run lint
```

Use `npm run dev` quando quiser subir apenas o front. Use `npm run dev:all` para subir front e API juntos em desenvolvimento local. O login local depende da API respondendo em `http://127.0.0.1:3333`.

Depois de executar `npm run build:all`, `npm start` inicia o Next.js e a API juntos em modo de producao. O Next.js usa `PORT` (porta publica) e a API usa `API_PORT` (porta interna, padrao `3333`).

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

- O deploy usa a raiz do repositorio e inicia front e API dentro do mesmo servico.
- O navegador acessa apenas o Next.js. As chamadas para `/api/proxy/*` sao encaminhadas internamente para a API em `http://127.0.0.1:3333`.
- `railway.json` instala e compila os dois projetos, inicia os dois processos e valida `/api/proxy/health` antes de publicar uma nova versao.
- Nao e necessario configurar `NEXT_PUBLIC_API_URL` nem expor a porta da API publicamente.
- O passo a passo completo esta em `docs/railway-deploy.md`.

# Estrutura Monorepo ProSis

Data da migração inicial: 10/07/2026. Revisado em 01/10/2026.

## Estrutura

- Raiz: Next.js do ProSis, interfaces e endpoints públicos.
- `apps/api`: Fastify/Prisma/MySQL, com package, lock, TypeScript e schema próprios.
- `apps/api/src/app.ts`: construção do Fastify sem abrir porta.
- `apps/api/src/server.ts`: listener para desenvolvimento e API independente.

Os pacotes têm dependências separadas e não usam npm workspaces. A raiz permanece como diretório de deploy da Hostinger via GitHub.

## Desenvolvimento

Execute `npm ci` na raiz e `npm run api:install`. Crie `apps/api/.env` somente se ainda não existir, usando o exemplo como referência. Configure banco e segredos.

`npm run dev` verifica a configuração e inicia Next e Fastify em processos separados; se um encerra, o outro também encerra. O Next usa a porta 3000 e encaminha `/api/proxy/*` à API em `http://127.0.0.1:3333`. `API_PORT` e `INTERNAL_API_URL` permitem ajustar esse ambiente. `npm run dev:web` inicia somente o Next; `npm run api:dev` inicia somente a API.

## Produção

`npm run build` executa a instalação da API pelo lock, compila a API e então compila o Next. O rastreamento inclui `apps/api/dist`, dependências e cliente/mecanismo nativo do Prisma em `.next/standalone`. O pós-build verifica esses arquivos e copia `public` e `.next/static`. `npm run build:all` pula a instalação; `npm run build:web` pressupõe a API já compilada.

`npm start` executa `.next/standalone/server.js`. As requisições a `/api/proxy/*` são passadas diretamente ao Fastify dentro do Next, e o login chama a mesma API internamente. A API é preparada sob demanda, sem processo filho nem porta interna. Só a porta pública do Next recebe conexões. O build não inicia a API nem consulta MySQL.

Configure os segredos como variáveis de execução da hospedagem. Os arquivos locais `.env` não são enviados pelo Git; cópias dos quatro arquivos de ambiente da raiz são removidas do standalone pelo pós-build. Não é necessário configurar `NEXT_PUBLIC_API_URL`, `API_PORT` ou `INTERNAL_API_URL` para a integração embutida em produção.

## Hostinger e verificação

No hPanel: preset **Next.js**, branch `main`, Node `22.x`, raiz `./`, comando `npm run build`, saída `.next`. Veja [deploy na Hostinger](hostinger-deploy.md).

Após o build, `npm run test:deploy` verifica o pacote de produção isolado. `npm run test:regression` verifica contratos existentes. Build e testes da integração de 01/10/2026 estão pendentes de execução; deploy e login real ainda precisam de homologação. O healthcheck `/api/proxy/health` deve responder 200, mas não verifica acesso ao MySQL.

Os scripts `scripts/start-production.mjs`, `scripts/run-api-production.mjs` e o comando `start:all` representam a arquitetura anterior e são opcionais. As notas de Railway também são históricas e não configuram o hPanel.

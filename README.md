# ProSis — Gestão do Programa Jovem Aprendiz

Sistema de gestão de aprendizes, rotinas pedagógicas, empresas parceiras e chamados internos de TI. Front-end Next.js na raiz; API Fastify/Prisma/MySQL em `apps/api`.

## Começar localmente

Requisito: Node.js 22 ou superior. Abra esta pasta inteira no VS Code.

```powershell
npm ci
npm run api:install
Copy-Item apps/api/.env.example apps/api/.env
```

Execute a cópia apenas se `apps/api/.env` ainda não existir. Preencha `DATABASE_URL`, `JWT_SECRET` e `COOKIE_SECRET` com a configuração real. Para portas padrão, o front usa automaticamente `http://127.0.0.1:3333`; se necessário, configure `.env.local` na raiz usando `.env.example`. O segredo `LOGIN_PROXY_SECRET`, quando usado, deve ser igual nos dois projetos.

```powershell
npm run dev
```

Acesse `http://localhost:3000`. Esse comando verifica a configuração e inicia os dois serviços. `npm run dev:web` inicia só o front; `npm run api:dev` inicia só a API. As dependências possuem dois arquivos de lock e não são npm workspaces.

## Acompanhar e entender o código

- [Mapa navegável de todos os arquivos](docs/MAPA_CODIGO.md)
- [Revisão de 25/09: mudanças e testes](docs/REVISAO_2026-09-25.md)
- [Refatoração: o que existe e o que falta](docs/plano-refatoracao.md)
- [Revisão de segurança atual](docs/auditoria-seguranca.md)

Execute `npm run test:regression` depois de instalar as dependências dos dois pacotes. Para atualizar o inventário: `node scripts/generate-code-map.mjs`.

## Referências

- [Contexto atual do produto e diagnóstico local](docs/CONTEXTO_PROSIS.md)
- [Estrutura do monorepo](docs/monorepo.md)
- [Deploy na Hostinger via GitHub](docs/hostinger-deploy.md)
- [Deploy no Railway via GitHub](docs/railway-deploy.md)

`npm run build` instala as dependências da API pelo lock, compila a API primeiro e gera o Next.js standalone com API, Prisma e assets. `npm run build:all` faz as mesmas compilações com as dependências já instaladas. `npm start` executa `.next/standalone/server.js`: em produção, o Fastify atende dentro do Next.js, sem processo filho nem porta interna. Em desenvolvimento, os dois processos e a porta 3333 continuam disponíveis.

Na Hostinger, use o preset **Next.js**, branch `main`, Node `22.x`, raiz `./`, build `npm run build` e saída `.next`. Configure os segredos como variáveis de execução no hPanel; o pacote standalone remove os arquivos `.env` locais copiados pelo Next. A API é preparada na primeira requisição; o build não inicia a API nem consulta o banco. `/api/proxy/health` verifica a API, sem consultar MySQL. Execute `npm run test:deploy` após o build para verificar o pacote isolado; o novo deploy e login real ainda precisam de homologação.

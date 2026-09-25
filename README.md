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

`npm run build` instala as dependências da API e compila ambos; `npm run build:all` apenas compila, com as dependências já instaladas. `npm start` executa os dois em produção. Configure as variáveis no painel da hospedagem: os `.env` locais não são enviados pelo Git. O healthcheck `/api/proxy/health` verifica comunicação com a API, mas não consulta o MySQL.

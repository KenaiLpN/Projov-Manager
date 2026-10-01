# Deploy do ProSis na Hostinger

Atualizado em 01/10/2026. O responsável restaurou o preset **Next.js**: o site abriu, mas o inicializador da API separada deixou de ser executado. A integração atual incorpora o Fastify ao processo do Next para funcionar com esse preset.

## Configuração do hPanel

| Campo | Valor |
| --- | --- |
| Configuração predefinida | Next.js |
| Branch | main |
| Versão do Node | 22.x |
| Diretório raiz | ./ |
| Comando de construção | npm run build |
| Gerenciador de pacotes | npm |
| Diretório de saída | .next |

A plataforma instala as dependências da raiz. `npm run build` instala a API pelo lock com dependências de compilação, gera o Prisma, compila a API e então compila o Next. O projeto usa `output: "standalone"`; o pós-build verifica a presença da API/Prisma e copia os assets. O comando padrão `npm start` executa `.next/standalone/server.js`.

A integração também é acionada pelas próprias rotas Next, de modo que não depende do comando customizado do preset Other. O pacote standalone contém a API e suas dependências. Mantenha `.next` como saída no painel; não use exportação estática.

## Como as requisições funcionam

```text
Navegador -> Next.js (porta pública)
              | /api/auth/login -> Fastify em processo -> Prisma -> MySQL
              | /api/proxy/*    -> Fastify em processo -> Prisma -> MySQL
```

O Fastify é criado uma vez por processo, sob demanda, na primeira requisição. Não há listener da API, processo filho, porta 3333 ou healthcheck de inicialização entre processos em produção. O build prepara arquivos e não inicia serviços permanentes nem consulta o banco. `/api/proxy/health` verifica a API e também não consulta MySQL.

Em desenvolvimento, `npm run dev` continua iniciando Next e API separados; o rewrite e o login local usam `http://127.0.0.1:3333`.

## Variáveis no painel

Configure as variáveis para estarem disponíveis **em execução**, além de qualquer configuração que o hPanel disponibilize durante o build:

```dotenv
DATABASE_URL=<URL MySQL válida>
DATABASE_CONNECTION_LIMIT=5
JWT_SECRET=<segredo da aplicação>
COOKIE_SECRET=<outro segredo da aplicação>
LOGIN_PROXY_SECRET=<segredo compartilhado pelo login>
FRONTEND_URL=https://prosis.digital
```

Configure `SMTP_*` se utilizar recuperação de senha. URLs devem ser texto simples, sem sintaxe Markdown. `API_PORT` e `INTERNAL_API_URL` são usados pelo desenvolvimento/servidor independente e não são necessários na integração de produção. A porta pública é fornecida pela plataforma ao Next.

Os `.env` locais são ignorados pelo Git. O pós-build remove do standalone apenas `.env`, `.env.local`, `.env.production` e `.env.production.local` da raiz que o Next possa ter copiado; segredos de produção devem vir do hPanel. Não envie dependências instaladas no Windows para Linux: o build da hospedagem instala e gera o Prisma para seu ambiente.

## Verificação

1. Conferir no build a instalação pelo lock, geração do Prisma, compilação da API e mensagem `[build] Standalone preparado com site, API e Prisma.`.
2. Após publicar, abrir `/login` e `/api/proxy/health`; este deve responder 200 com `{"status":"API Online"}`.
3. Testar login com uma conta válida, criação do cookie HTTP-only e carregamento de listagens.
4. Em falha, coletar status e código sanitizado dos logs de login/proxy. A página abrir não prova que banco e segredos estão configurados corretamente.

A verificação local é `npm run build` seguida de `npm run test:deploy`, que executa o standalone isolado do repositório, e dos testes de regressão pertinentes. **Build e testes locais da integração de 01/10/2026 ainda estão pendentes; deploy e login real também precisam de homologação.** Testes com banco fictício não confirmam autenticação no banco real.

## Histórico: preset Other e API separada

As orientações desta seção descrevem a arquitetura substituída. Não são a configuração atual do hPanel.

- Em 17/09/2026, o site respondia em `/login`, mas o proxy e login falhavam por indisponibilidade da API interna. Os testes locais posteriores aprovaram healthchecks e validação de login com corpo vazio.
- Em 24/09/2026, o supervisor da Hostinger relatou `App did not call listen() within 3 seconds` e reinícios com `EADDRINUSE`. Foi criado `scripts/start-production.mjs`, que abria o HTTP público, preparava o Next e iniciava Fastify por `scripts/run-api-production.mjs`, em filho ligado por IPC.
- Em 25/09/2026, o responsável confirmou login e comunicação com MySQL usando Other. Essa confirmação pertence àquela versão, não homologa o novo pacote.
- Em 29/09/2026, os logs mostravam API ouvindo em 3333 e timeout do healthcheck. `scripts/api-healthcheck.mjs` passou a usar HTTP nativo e registrar motivos sanitizados. O erro específico na Hostinger não foi reproduzido localmente.

Os scripts antigos e `npm run start:all` permanecem como alternativas legadas opcionais; não são necessários ao preset Next.js. As instruções antigas de selecionar Other, saída vazia ou evitar standalone foram substituídas por este documento.

## Referências

- [Hostinger: configuração e reimplantação](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/)
- [Next.js: saída standalone e rastreamento de arquivos](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
- [Next.js: API Routes e resolvers externos](https://nextjs.org/docs/15/pages/building-your-application/routing/api-routes)
- [Fastify: roteamento de requisições HTTP](https://fastify.dev/docs/latest/Reference/Server/#routing)

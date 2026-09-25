# Deploy do ProSis na Hostinger

Atualizado em 17/09/2026. A hospedagem atual informada pelo responsável é a Hostinger, com deploy pelo GitHub. O login local foi confirmado pelo responsável. As configurações do hPanel ainda precisam ser conferidas no ambiente publicado.

## Por que o login publicado pode retornar 503

O navegador chama `POST /api/auth/login` no Next.js. Essa rota faz uma chamada HTTP para a API Fastify interna em `http://127.0.0.1:3333/login`. O 503 com `Erro ao conectar com o servidor.` é produzido quando essa chamada falha antes de receber uma resposta da API. Não significa, por si só, senha de usuário incorreta nem falha de conexão MySQL.

Em 17/09/2026, o site público respondeu 200 em `/login` e 500 em `/api/proxy/health`. Isso confirma a falha da integração publicada, mas não identifica sozinho se a API não iniciou, se faltam variáveis ou se a URL está incorreta. Os logs de execução e os comandos configurados no painel são necessários para distinguir essas causas.

## Configuração esperada do serviço Node.js

| Campo | Valor |
| --- | --- |
| Raiz do projeto | Raiz do repositório, onde está o `package.json` do front |
| Node.js | 22 ou 24 |
| Instalação da raiz | `npm ci` (ou etapa equivalente da plataforma com o lock versionado) |
| Build | `npm run build` |
| Inicialização / Start | `npm start` |
| Porta web | 3000, ou `PORT` fornecida pela plataforma |
| Porta interna da API | `API_PORT=3333` |

O build padrão instala as dependências da API pelo script `api:install` e compila os dois pacotes. `npm start` executa `scripts/start-production.mjs`: o servidor HTTP público e o Next ficam no processo principal; Fastify fica em um processo filho com IPC. Falha na inicialização ou queda da API encerra a aplicação.

`next start`, `npm run start:web` ou um `server.js` gerado apenas para o Next.js não iniciam a API. `railway.json` não configura a Hostinger. Caso o preset Next.js do painel ignore o start personalizado ou publique apenas `.next`, será necessário ajustar o tipo/configuração da aplicação Node.js no painel para preservar e executar os dois pacotes. Não assumir que o preset faz isso automaticamente.

O runtime precisa conter `.next`, `public`, `node_modules`, `scripts`, `apps/api/dist` e `apps/api/node_modules`. Não publicar apenas arquivos estáticos. Não enviar `node_modules` do Windows para o Linux: instalar no ambiente do deploy.

## Variáveis no painel

Os arquivos `.env` locais são ignorados pelo Git e não chegam à hospedagem pelo commit. Configure as variáveis no hPanel, disponíveis para os processos em execução:

```dotenv
API_PORT=3333
INTERNAL_API_URL=http://127.0.0.1:3333
DATABASE_URL=<URL MySQL válida>
DATABASE_CONNECTION_LIMIT=5
JWT_SECRET=<segredo da aplicação>
COOKIE_SECRET=<outro segredo da aplicação>
LOGIN_PROXY_SECRET=<segredo compartilhado entre Next.js e Fastify>
FRONTEND_URL=https://prosis.digital
```

URLs devem ser texto simples, sem sintaxe Markdown. Configure `INTERNAL_API_URL`/`API_PORT` também durante o build: o rewrite do Next.js é gerado nessa etapa. Configure SMTP se for usar recuperação de senha. Não publique segredos em arquivos versionados ou logs.

## Verificação após o redeploy

1. Confirmar nos logs de build a geração do Prisma e a compilação da API, além de Next.js.
2. Confirmar nos logs de execução `Iniciando Next.js`, `Iniciando API Fastify` e a API ouvindo em 3333.
3. Acessar `/api/proxy/health`: deve responder 200 com `{"status":"API Online"}`. Esse endpoint não consulta MySQL.
4. Testar login com conta válida. Conferir se o cookie HTTP-only é criado e se as listagens carregam.
5. Se aparecer 503, procurar `[auth/login] API interna indisponivel` nos logs: `ECONNREFUSED` sugere ausência de serviço na porta; `ENOTFOUND` sugere hostname incorreto; timeout exige verificar disponibilidade/URL. Esse log não inclui credenciais nem o corpo do login.

## Referências

- [Hostinger: redeploy e configuração de build, start e variáveis](https://www.hostinger.com/support/how-to-redeploy-a-node-js-application/)
- [Hostinger: diagnóstico de build e inicialização](https://www.hostinger.com/support/fix-failed-to-build-application-error-hostinger-node-js/)

Alterações locais não confirmam correção do ambiente publicado: é necessário novo deploy e validação no domínio.

## Validação local da revisão

`npm run build` passou após as atualizações de segurança. `npm audit` retornou zero vulnerabilidades conhecidas na raiz e na API. O inicializador de produção foi testado: healthcheck da API e do proxy com HTTP 200, login com payload vazio rejeitado pela API com HTTP 400 e encerramento do front após queda da API. Não houve autenticação com usuário real nesse teste, nem consulta ou alteração no banco.

Next.js/eslint-config-next: 15.5.25; Sharp: 0.35.4; js-yaml: 4.3.2. Os locks também incluem correções compatíveis para as outras dependências apontadas pela auditoria. A correção mínima de Next.js para o problema AVIF está descrita no [aviso oficial](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4); consulte também as versões [Sharp 0.35.4](https://github.com/lovell/sharp/releases/tag/v0.35.4) e [js-yaml 4.3.2](https://github.com/nodeca/js-yaml/releases/tag/4.3.2).

## Ajuste de inicializacao em 24/09/2026

O log da Hostinger confirmou que o supervisor antigo iniciava os dois processos, mas a plataforma informava `App did not call listen() within 3 seconds` e as novas tentativas encontravam a porta 3000 ocupada. O inicializador agora chama `http.Server.listen()` no processo principal antes de importar/preparar o Next. Durante a preparacao responde 503 com Retry-After; libera as requisicoes depois de preparar Next e verificar o healthcheck da API.

Fastify roda pelo auxiliar `scripts/run-api-production.mjs`, ligado por IPC. Quando o pai encerra abruptamente, a desconexao IPC encerra a API. Falha da API encerra tambem o servidor publico.

No hPanel: preset Other, Node 22.x, raiz ./, build npm run build, arquivo de entrada scripts/start-production.mjs. O deploy observado preservou os arquivos da API com diretorio de saida vazio. Manter vazio para esta configuracao; nao selecionar apenas .next. Publicar os dois arquivos de scripts. Reiniciar pelo painel apos o deploy; processos antigos podem exigir limpeza pelo suporte se EADDRINUSE persistir. Nao executar comandos para matar processos de outros sites.

Mensagem esperada: `[startup] Next.js e API Fastify prontos.` Validar /login, /api/proxy/health e login real apos o deploy. A compatibilidade com o supervisor Hostinger ainda precisa ser confirmada no ambiente publicado. O servidor customizado usa a API documentada do Next e deixa de usar next start; nao configurar output standalone.

Validacao local do ajuste: sintaxe dos dois scripts e git diff --check aprovados. Build isolado do Next aprovado. Teste de producao com API ja compilada: /login, /api/proxy/health e /health HTTP 200; login com corpo vazio HTTP 400, sem autenticar nem consultar banco. Encerramento forcado do pai liberou as portas publica e interna, comprovando encerramento da API via IPC. Regeneracao Prisma durante build: bloqueada por EPERM no DLL Windows em uso; nao foi necessario alterar schema ou API. Validacao do supervisor Hostinger e login real permanecem pendentes apos publicacao.

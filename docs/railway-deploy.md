# Deploy do ProSis completo no Railway

Este projeto executa o front-end Next.js e a API Fastify no mesmo servico `Projov-Manager`. O MySQL permanece como um segundo servico do projeto Railway.

```text
Internet -> Next.js ($PORT) -> /api/proxy/* -> Fastify (127.0.0.1:3333) -> MySQL
```

## O que o repositorio automatiza

- `npm run railway:build`: instala as dependencias dos dois projetos e compila front e API.
- `npm run start:all`: inicia Next.js e Fastify no mesmo container e encerra o container caso um deles falhe.
- `railway.json`: configura build, start, healthcheck e reinicio por falha.
- `/api/proxy/health`: valida que o Next.js e a API estao respondendo antes de o Railway ativar o deploy.

## 1. Configuracao do servico Projov-Manager

No Railway, abra `Projov-Manager` e acesse `Settings`:

1. Em `Source`, mantenha o repositorio do ProSis e a branch de producao.
2. Em `Root Directory`, use a raiz do repositorio (`/`) ou deixe o campo vazio.
3. O Railway detectara o arquivo `/railway.json`. Nao e necessario manter comandos manuais de build ou start.
4. Em `Networking`, mantenha o dominio publico apontando para a porta fornecida pelo Railway.
5. Nao crie um dominio nem uma porta publica para `3333`; essa porta pertence somente a API interna.

Se o painel exigir comandos manuais, use:

```text
Build Command: npm run railway:build
Start Command: npm run start:all
Healthcheck Path: /api/proxy/health
```

## 2. Variaveis do Projov-Manager

Configure todas as variaveis abaixo no servico `Projov-Manager`, porque front e API agora executam no mesmo container:

```env
API_PORT=3333
INTERNAL_API_URL=http://127.0.0.1:3333
DATABASE_CONNECTION_LIMIT=5
DATABASE_URL=<consulte a estrategia de banco abaixo>
JWT_SECRET=<novo segredo forte e aleatorio>
COOKIE_SECRET=<outro segredo forte e aleatorio>
LOGIN_PROXY_SECRET=<novo segredo forte e aleatorio>
FRONTEND_URL=https://prosis.digital
BLOCKED_IPS=
SMTP_HOST=<host SMTP>
SMTP_PORT=465
SMTP_USER=<usuario SMTP>
SMTP_PASS=<senha SMTP>
```

Nao configure:

- `NEXT_PUBLIC_API_URL`: a aplicacao nao usa mais uma API publica externa.
- `VERCEL`: o deploy da API nao usa mais a Vercel.
- `PORT`: o Railway injeta essa variavel automaticamente para o Next.js.
- `NODE_ENV`: o inicializador define `production` nos dois processos sem interferir na instalacao das dependencias de build.

O Railway injeta `RAILWAY_PUBLIC_DOMAIN` automaticamente. A API usa essa variavel para aceitar tambem o dominio `*.up.railway.app` durante os testes.

## 3. Estrategia segura para o banco

### Primeira publicacao: manter temporariamente o banco atual

Para validar a mudanca de hospedagem sem misturar uma migracao de dados no mesmo deploy, mantenha inicialmente em `DATABASE_URL` a conexao do banco atual. Depois do deploy, valide login, listagens, criacao e edicao de chamados.

### Segunda etapa: migrar para o MySQL do Railway

O servico MySQL do Railway nao recebe automaticamente as tabelas e os dados do banco atual. Exporte o banco completo, incluindo rotinas, triggers e eventos, e importe no MySQL do Railway. Faca a migracao em uma janela de manutencao para evitar que registros sejam criados depois do backup.

Depois de validar a importacao, altere a variavel no `Projov-Manager` para uma referencia ao servico MySQL:

```env
DATABASE_URL=${{MySQL.MYSQL_URL}}
```

Ao salvar a referencia, faca um novo deploy e valide novamente login, consultas e chamados. Nao execute `prisma db push` como substituto da importacao: esse comando cria estrutura, mas nao transfere os dados existentes, rotinas ou triggers.

## 4. Primeiro deploy

1. Revise e aplique as alteracoes de variaveis no Railway.
2. Acione `Deploy` ou envie o commit para a branch conectada.
3. Nos logs de build, confirme a execucao de `next build`, `prisma generate` e `tsc`.
4. Nos logs de deploy, confirme as mensagens de inicializacao do `Next.js`, da `API Fastify` e `HTTP Server running on port 3333`.
5. Confirme que o healthcheck `/api/proxy/health` recebeu HTTP `200`.

## 5. Validacao depois do deploy

Teste nesta ordem:

1. `GET /api/proxy/health` deve retornar `{"status":"API Online"}`.
2. Login deve responder sem `503` ou referencia a Vercel.
3. `GET /api/proxy/chamados` autenticado deve retornar a lista, nao `Route not found`.
4. Abra um chamado, altere descricao/urgencia e conclua um chamado de teste.
5. Verifique o envio de e-mail de recuperacao de senha, caso o SMTP esteja habilitado.

## 6. Segredos expostos anteriormente

Antes do deploy definitivo, troque a senha do banco, a senha SMTP, `JWT_SECRET`, `COOKIE_SECRET` e `LOGIN_PROXY_SECRET`. Atualize os novos valores no Railway e nos arquivos locais ignorados pelo Git. Nunca envie esses valores ao repositorio.

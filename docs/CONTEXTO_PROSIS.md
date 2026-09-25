# Contexto atual do ProSis

Atualizado em 25/09/2026 a partir do código local e do relato de login em produção. Este documento é o ponto de retomada do desenvolvimento; planos antigos não são prova de que uma funcionalidade esteja concluída. Nome no código: ProSis; repositório/pasta: Projov-Manager.

## Proposta do produto

Centralizar a gestão do Programa Jovem Aprendiz: cadastro e acompanhamento de aprendizes, formação e frequência, relacionamento com empresas parceiras, vagas, relatórios e acessos por perfil. Há também um portal de chamados internos de TI para registrar e acompanhar solicitações dentro do sistema.

O projeto já possui implementação extensa. A continuidade deve evoluir os fluxos existentes, sem partir de uma reescrita. A presença de uma tela ou rota não significa homologação do fluxo com o banco atual.

## Módulos encontrados no código

| Área | Escopo existente |
| --- | --- |
| Aprendizes | Cadastro, ficha, situação, ocorrências, alocação e dados relacionados |
| Cadastros | Unidades, instituições, parceiros, cursos, disciplinas, turmas e tabelas auxiliares |
| Pedagógico | Presença/faltas, capacitação, cronogramas, planos e educadores |
| Empresas e vagas | Perfil da empresa, aprendizes alocados, presença, vagas e avaliações |
| Estatísticas | Consultas e relatórios de participantes, alocações e avaliações |
| Acessos | Usuários e funções do sistema |
| Chamados | Portal do solicitante, painel técnico, departamento, patrimônio, descrição, mensagens, urgência e resolução |
| Autenticação | Login por tipo de acesso, primeiro acesso e recuperação de senha |

Tipos de login: `USUARIO`, `APRENDIZ`, `EDUCADOR`, `EMPRESA`. Perfis internos: `A` administrador, `C` recepção, `P` pedagógico, `T` técnico, `E` empresarial, `S` pesquisa, `D` desligado e `DEV` desenvolvedor. `src/utils/roles.ts` normaliza os códigos. Chamados admitem `A`, `P`, `T`, `DEV`; painel técnico admite `T`, `DEV`.

## Arquitetura real

```text
Navegador -> Next.js :3000
             | /api/auth/login -> Fastify :3333 /login -> Prisma -> MySQL
             | /api/proxy/*    -> Fastify :3333 /*     -> Prisma -> MySQL
```

- Raiz: Next.js 15, React 19, TypeScript, Tailwind 4, PrimeReact, Axios, React Hook Form/Zod.
- `apps/api`: Fastify 5, Prisma 5, MySQL, Zod e autenticação JWT/cookies.
- Monorepo com pacotes e locks independentes, sem configuração de npm workspaces. Instalar a raiz não instala a API.
- `tsconfig.json` da raiz exclui a API; ela tem configuração e compilação próprias.
- `src/services/api.ts`: Axios em `/api/proxy/`, com cookies; o rewrite está em `next.config.ts`.
- `src/app/api/auth/login/route.ts`: encaminha o login, recebe o JWT e grava cookie `token` HTTP-only, com validade de oito horas. O navegador recebe o usuário, não o token no JSON.
- `src/middleware.ts` faz verificações de navegação e expiração; a verificação criptográfica do JWT ocorre na API. `PrivateLayout` aplica restrições de navegação por perfil. O cache `projov_user` não deve ser fonte de autorização no backend.
- API: rotas -> serviços -> Prisma. Schema em `apps/api/prisma/schema.prisma`; banco legado com algumas relações e IDs gerenciados pela aplicação.
- CRUD do front: `src/hooks/useCrud.ts`, serviços em `src/services`, tipos em `src/types`, tabelas e formulários em `src/components`.

## Ambiente local e comandos

Abra `C:\Users\leona\OneDrive\Desktop\Programação\ProSis\Projov-Manager` no VS Code.

1. Node >= 22; execute `npm ci` na raiz e `npm run api:install`.
2. Crie `apps/api/.env` a partir do exemplo, sem sobrescrever configuração existente.
3. Configure MySQL e segredos reais. `.env` e `.env.local` são ignorados pelo Git.
4. Use `npm run dev` para os dois processos. `npm run dev:check` diagnostica dependências e variáveis obrigatórias, sem testar conexão com o banco.
5. Abra `http://localhost:3000`. `npm run dev:web` é a alternativa explícita para iniciar apenas o front.

| Configuração | Onde / observação |
| --- | --- |
| `DATABASE_URL` | `apps/api/.env`; URL MySQL real, com usuário autorizado e banco existente |
| `JWT_SECRET`, `COOKIE_SECRET` | `apps/api/.env`; valores aleatórios locais |
| `API_PORT` | Padrão 3333; se mudar, mantenha front e API alinhados |
| `INTERNAL_API_URL` | `.env.local` da raiz; opcional para a porta padrão |
| `LOGIN_PROXY_SECRET` | Mesmo valor no front e na API quando utilizado |
| `FRONTEND_URL` | API: `http://localhost:3000` em desenvolvimento |
| `SMTP_*` | Necessário para envio de recuperação de senha |

Não copie o `.env` da API inteiro para a raiz: `PORT=3333` pode causar conflito com o servidor web. Não use `prisma db push` para recuperar dados nem execute scripts de alteração do banco apenas para testar login.

## Diagnóstico da retomada em 17/09/2026

- A cópia estava limpa no Git antes das alterações desta revisão.
- `npm run dev` iniciava somente Next.js. Foi ajustado para iniciar os dois serviços, com checagem prévia e encerramento conjunto.
- Não havia `apps/api/node_modules` nem `apps/api/.env`. O ZIP de backup também não continha `.env`. O usuário informou que criará a configuração.
- Não havia serviço escutando em 3000 ou 3333 durante a inspeção inicial. Logs `.dev-server.*` existentes são históricos e não comprovam execução atual.
- O proxy de login já apontava corretamente para a API interna. Sem API disponível, retorna 503; com API mas sem banco acessível, a autenticação continua impedida.
- O erro histórico de `tipoAcesso` não foi reproduzido: o front atual usa os quatro valores aceitos pelo schema da API.
- `npm` funcionava no PowerShell 7, mas falhava no Windows PowerShell com bloqueio de `npm.ps1`. Foi aplicado `RemoteSigned` no escopo `CurrentUser` desse shell; `npm --version` passou (12.0.2). Reabra o terminal do VS Code se uma sessão antiga conservar o bloqueio.

### Verificações concluídas nesta revisão

- Dependências da API instaladas pelo lock (`npm --prefix apps/api ci --include=dev`); cliente Prisma gerado.
- `npm run build:all`: aprovado, incluindo compilação, lint/tipos do Next.js e compilação TypeScript da API.
- Lint e sintaxe do novo `scripts/check-development.mjs`: aprovados. A checagem detectou configuração ausente e, depois, os valores de exemplo no `.env` criado durante a sessão.
- Teste com processos locais temporários e segredos exclusivos do teste: `GET http://127.0.0.1:3333/health` -> 200; `GET http://127.0.0.1:3000/api/proxy/health` -> 200; `POST /api/auth/login` com `{}` -> 400 da validação da API. Os processos de teste foram encerrados.
- Após o usuário preencher o `.env`, a conexão MySQL real foi validada em 17/09/2026 pelo Prisma com `SELECT 1`. Uma consulta somente de leitura a `information_schema.tables` identificou 89 tabelas no banco configurado. Nenhum dado foi alterado ou credencial exibida.
- O responsável confirmou login local bem-sucedido após configurar o ambiente. A falha de `dev:check` foi identificada: os segredos estavam duplicados nos dois `.env`, e os exemplos no fim sobrescreviam os valores preenchidos no início. As duplicatas foram removidas preservando os valores iniciais; `npm run dev:check` passou.

## Deploy e documentos históricos

O responsável confirmou que o deploy atual é na **Hostinger via GitHub**. Veja `docs/hostinger-deploy.md`. `scripts/start-production.mjs` inicia front e API no mesmo serviço, API em porta interna, MySQL separado. `npm run build` agora instala as dependências da API e compila ambos; antes compilava apenas o front. `npm start` inicia ambos. A Hostinger está usando Other com scripts/start-production.mjs; o responsável confirmou login e comunicação com MySQL em 25/09/2026. O servidor público roda no processo principal e Fastify em filho com IPC.

`railway.json` e `docs/railway-deploy.md` representam uma alternativa de hospedagem; não configuram a Hostinger. Referências à API em repositório irmão ou Vercel em documentos antigos são históricas. O plano de refatoração antigo cita build ignorando erros, mas esses ajustes não constam no `next.config.ts` atual. O portal de chamados já tem código; seu plano inicial não representa sozinho o estado implementado.

### Revisão do deploy e dependências em 17/09/2026

- O responsável relatou 503 em `/api/auth/login` no domínio publicado. A leitura pública confirmou `/login` com 200 e `/api/proxy/health` com 500. A API interna está indisponível para o front publicado; a causa exata requer comandos/variáveis/logs do hPanel.
- Next.js e eslint-config-next atualizados para 15.5.25, Sharp para 0.35.4 e js-yaml para 4.3.2. Também foram aplicadas correções compatíveis indicadas por `npm audit fix` nos dois locks, sem `--force`.
- Overrides de Sharp e js-yaml fixam versões mínimas corrigidas; na API, o override de Undici 7.29.1 corrige a versão exata antiga exigida por `@scalar/json-magic`.
- `npm audit` retornou zero vulnerabilidades conhecidas nos dois pacotes após a atualização. Isso não constitui auditoria completa da lógica da aplicação.
- O login agora tem timeout de 15 segundos e registra apenas o código/tipo do erro de conexão no servidor, sem URL, segredos ou corpo da requisição.
- Validação após as atualizações: `npm run build` aprovado (instalação pelo lock da API, build Next.js com lint/tipos e build TypeScript da API); Sharp 0.35.4 converteu PNG para WebP; inicializador real de produção retornou 200 nos dois healthchecks e 400 no login com payload vazio. O supervisor também encerrou o front quando a API foi interrompida no teste. Os testes de produção usaram segredos temporários e não consultaram MySQL.

## Pendências para homologação e continuidade

- Login em produção confirmado pelo responsável em 25/09/2026. Publicar e homologar as novas validações de resposta e sessão desta revisão.
- Repetir `/health` direto e via `/api/proxy/health` com o ambiente real. Esses endpoints não testam MySQL.
- Validar cada perfil e seus dados autorizados com contas de teste apropriadas.
- Executar build dos dois projetos antes do próximo deploy.
- Há uma divergência preexistente a revisar: login de educador redireciona para `/educador/perfil`, enquanto listas de navegação permitida em middleware/PrivateLayout contemplam aprendizes e pedagógico.
- Definir com o responsável a próxima prioridade funcional. Não interpretar propostas antigas como novo escopo autorizado.

Atualize este arquivo ao mudar arquitetura, inicialização, autenticação, hospedagem ou prioridade do produto. Nunca registre senhas, tokens ou dados pessoais aqui.

### Inicializacao Hostinger em 24/09/2026

O log enviado confirmou Next e Fastify iniciando, seguido de `App did not call listen() within 3 seconds` e EADDRINUSE em reinicios. Ajustado scripts/start-production.mjs para abrir o HTTP publico no proprio processo e preparar Next via servidor customizado. API executada pelo auxiliar scripts/run-api-production.mjs com encerramento ao perder IPC com o pai. Ver docs/hostinger-deploy.md para configuracao Other e validacao pendente do deploy. package.json ja tinha alteracao local anterior e foi preservado.

## Revisão de 25/09/2026

- Documentação navegável de todo o código em [MAPA_CODIGO.md](MAPA_CODIGO.md).
- Refatoração anterior confirmada como parcial: oito páginas usam useCrud, apenas GrauParentescoService herda BaseService; componentes de chamados e serviço de CEP já existem. Veja [plano-refatoracao.md](plano-refatoracao.md).
- Respostas inválidas agora são rejeitadas antes de substituir listas em chamados e nos pontos legados revisados. useCrud preserva dados anteriores em falhas; painel técnico exibe aviso. Contratos completos de todos os módulos ainda são uma evolução futura.
- Claims de sessão validadas após assinatura JWT para impedir uso de token de reset como sessão. Demais riscos e decisões de permissão estão em [auditoria-seguranca.md](auditoria-seguranca.md).
- Comando npm run test:regression; detalhes de arquivos, testes e limitações em [REVISAO_2026-09-25.md](REVISAO_2026-09-25.md).

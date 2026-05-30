# Auditoria de Seguranca e Hardening

Data da analise: 30/05/2026

Escopo analisado:

- Front-end: `ProSis`
- API: `../bot-api-ff`
- Tipo de analise: revisao estatica de codigo e configuracao, sem pentest ativo e sem leitura de segredos locais.

Este documento prioriza protecao de dados sensiveis de aprendizes, clientes, empresas, usuarios internos e registros pedagogicos. Ele deve ser tratado como backlog de seguranca.

## Referencias Usadas

- OWASP ASVS 5.0: https://owasp.org/www-project-application-security-verification-standard/
- OWASP API Security Top 10 2023: https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Session Management Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- OWASP SQL Injection Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
- OWASP CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- OWASP Password Storage Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html

## Resumo Executivo

A base tem bons controles iniciais:

- JWT em cookie `httpOnly`.
- Middleware no front aplicando CSP com nonce.
- Headers de seguranca no Next.
- CORS com lista de origens.
- Rate limit em login e fluxos publicos principais.
- Uso de bcrypt para senhas.
- Varios endpoints com Zod.

Mas existem riscos importantes antes de considerar o sistema pronto para dados sensiveis:

1. A autorizacao da API ainda parece ampla demais para usuarios internos que nao sejam `APRENDIZ`.
2. O aprendiz pode chamar `PUT /ca-aprendiz/:id` no proprio cadastro com schema amplo, o que pode permitir edicao de campos administrativos.
3. Existem consultas SQL manuais com `$queryRawUnsafe` e `$executeRawUnsafe`.
4. Erros de validacao podem registrar `request.body` completo em log.
5. O primeiro acesso e reset de senha precisam de controles mais fortes.
6. O front esta com build permissivo e dependencias com vulnerabilidades conhecidas.

## Severidade P0 - Corrigir Primeiro

### P0.1 - Autorizacao central por perfil esta incompleta

Evidencias:

- `../bot-api-ff/src/server.ts` valida JWT globalmente para rotas nao publicas.
- O tratamento especial forte aparece para `APRENDIZ`.
- Usuarios internos autenticados parecem ter acesso amplo aos endpoints, salvo controles pontuais por rota.
- `../bot-api-ff/src/routes/user.routes.ts` expoe CRUD de usuarios sem checagem local de papel administrativo.

Risco:

- Um usuario interno de perfil limitado pode acessar, alterar ou excluir dados fora da sua funcao.
- Isso se encaixa nos riscos de autorizacao do OWASP API Top 10, especialmente Broken Function Level Authorization.

Acoes recomendadas:

1. Criar matriz de permissoes por papel (`A`, `C`, `P`, `T`, `E`, `S`, `DEV`, `APRENDIZ`).
2. Criar middleware `authorize({ resource, action })`.
3. Aplicar em todas as rotas sensiveis.
4. Bloquear por padrao e liberar explicitamente.
5. Criar testes automatizados de permissao por rota.

Exemplo de matriz inicial:

| Recurso | Acao | Perfis permitidos |
|---|---|---|
| Usuarios | criar/editar/excluir | `A`, `DEV` |
| Aprendizes | listar/ver dados completos | `A`, `P`, `T`, `E` conforme regra de negocio |
| Aprendizes | editar campos administrativos | `A`, `P`, `T` conforme campo |
| Aprendiz proprio | ver perfil | proprio `APRENDIZ` |
| Aprendiz proprio | editar dados pessoais permitidos | proprio `APRENDIZ` com allowlist |
| Presenca/faltas | lancar/editar | `P`, `A`, `DEV` |
| Empresa/parceiro | editar | `E`, `A`, `DEV` |

### P0.2 - Atualizacao do proprio aprendiz aceita payload amplo

Evidencias:

- `../bot-api-ff/src/routes/CA_Aprendiz.routes.ts` permite `PUT /ca-aprendiz/:id` para o proprio `APRENDIZ`.
- O body usa `caAprendizSchema.partial()`.
- `../bot-api-ff/src/services/CA_AprendizService.ts` remove alguns campos readonly, mas o schema ainda cobre muitos campos administrativos.

Risco:

- Um aprendiz pode tentar alterar campos que deveriam ser controlados pela equipe, como situacao, turma, parceiro, contrato, datas e dados pedagogicos.
- Mesmo que alguns campos falhem por tipo ou regra, o endpoint precisa negar por politica, nao por acidente.

Acoes recomendadas:

1. Criar schema especifico `updateOwnAprendizSchema`.
2. Permitir somente campos pessoais aprovados.
3. Criar schema separado para edicao administrativa.
4. Fazer diff/auditoria dos campos alterados.
5. Criar testes: aprendiz nao pode alterar situacao, turma, contrato, parceiro, perfil ou campos financeiros/administrativos.

### P0.3 - SQL manual inseguro e geracao de ID com `MAX + 1`

Evidencias:

- `../bot-api-ff/src/services/VagaService.ts` usa `$queryRawUnsafe`.
- `../bot-api-ff/src/lib/nextId.ts` usa `$queryRawUnsafe`.
- `../bot-api-ff/src/alterTable.ts` usa `$executeRawUnsafe`.
- Muitos services usam `getNextId(...)`.

Risco:

- Queries montadas por string aumentam risco de injecao SQL.
- `MAX + 1` pode gerar colisao em criacoes concorrentes.
- Mesmo com escapes manuais, futuras alteracoes podem introduzir falha.

Acoes recomendadas:

1. Trocar para Prisma normal sempre que possivel.
2. Quando raw SQL for indispensavel, usar query parametrizada ou `Prisma.sql`.
3. Validar nomes de tabela/coluna por allowlist quando forem dinamicos.
4. Migrar chaves para `AUTO_INCREMENT` ou controlar ID em transacao segura.
5. Remover scripts one-off do caminho principal da aplicacao.

### P0.4 - Logs podem registrar dados sensiveis

Evidencias:

- `../bot-api-ff/src/server.ts` loga body de POST em desenvolvimento com mascaramento superficial.
- `../bot-api-ff/src/server.ts` inclui `body: request.body` no error handler de validacao.
- `../bot-api-ff/src/lib/logger.ts` grava eventos em arquivos locais.

Risco:

- CPF, telefone, endereco, email, senha ou dados sensiveis de payload podem ficar em logs.
- Logs costumam ser copiados para ferramentas externas e backups.

Acoes recomendadas:

1. Nunca registrar `request.body` inteiro.
2. Criar funcao central de redacao profunda de campos sensiveis.
3. Redigir por nome e por padrao: senha, token, CPF, CNPJ, email, telefone, endereco, cookie.
4. Definir retencao de logs.
5. Separar logs operacionais de auditoria.
6. Proteger logs com permissao de arquivo e, em producao, armazenamento seguro.

## Severidade P1 - Alta Prioridade

### P1.1 - Fluxo de primeiro acesso precisa de prova mais forte

Evidencias:

- `../bot-api-ff/src/routes/auth.routes.ts` expoe `/primeiro-acesso`.
- O fluxo cria senha se a conta do aprendiz ainda nao tem senha.
- A validacao usa identificador do aprendiz e senha nova.

Risco:

- Se alguem souber CPF/codigo de um aprendiz sem senha, pode tentar assumir a conta.

Acoes recomendadas:

1. Usar convite de primeiro acesso com token unico enviado por canal controlado.
2. Expirar token rapidamente.
3. Marcar token como usado.
4. Exigir prova adicional quando necessario, como data de nascimento ou email ja cadastrado.
5. Rate limit por IP e por identificador.
6. Registrar auditoria especifica para tentativas.

### P1.2 - Reset de senha deve usar token de uso unico

Evidencias:

- `../bot-api-ff/src/routes/auth.routes.ts` cria JWT de reset com email e expiracao.
- `reset-password` valida token e altera senha.

Risco:

- Um token valido pode ser reutilizado ate expirar.
- Nao ha revogacao central por troca de senha ou incidente.

Acoes recomendadas:

1. Criar tabela de tokens de reset com `jti` hash, expiracao e `usedAt`.
2. Invalidar token apos uso.
3. Invalidar tokens anteriores quando nova solicitacao for feita.
4. Aplicar rate limit tambem em `/reset-password`.
5. Fazer log de auditoria sem expor token.

### P1.3 - CSRF precisa ser definido explicitamente

Contexto:

- O sistema usa cookie para autenticacao.
- O front usa BFF/proxy em `/api/auth/login` e `/api/proxy`.
- A API permite CORS com credenciais para origens especificas.

Risco:

- Rotas que mudam estado e usam cookie podem ser alvo de CSRF se ficarem acessiveis cross-site.

Acoes recomendadas:

1. Preferir que o navegador fale apenas com o front/BFF de mesmo site.
2. Se a API direta continuar usando cookie cross-site, implementar protecao CSRF.
3. Usar token CSRF sincronizado ou double-submit assinado.
4. Validar `Origin`/`Referer` em metodos que mudam estado.
5. Adicionar Fetch Metadata headers como defesa adicional.

### P1.4 - Politica de senha esta fraca para contas sensiveis

Evidencias:

- Schemas permitem senha minima de 6 caracteres em fluxos como primeiro acesso/reset.
- bcrypt e usado com custo 10.

Risco:

- Senhas fracas aumentam risco de brute force e credential stuffing.

Acoes recomendadas:

1. Subir minimo para pelo menos 12 caracteres em contas sem MFA.
2. Permitir ate 64+ caracteres.
3. Bloquear senhas comuns/vazadas.
4. Adicionar medidor de forca no front.
5. Manter bcrypt no minimo custo 10; considerar 12 apos teste de performance.
6. Considerar Argon2id em uma fase futura, se a infraestrutura permitir.

### P1.5 - Dependencias vulneraveis

Resultado do audit em 30/05/2026:

Front `ProSis`:

- `next`: vulnerabilidades altas reportadas pelo npm audit.
- `js-cookie`: vulnerabilidade alta.
- `postcss`: vulnerabilidade moderada via Next.
- `brace-expansion`: vulnerabilidade moderada.

API `bot-api-ff`:

- `qs`: vulnerabilidade moderada via `body-parser`/`express`.
- `uuid`: vulnerabilidade moderada via `@azure/msal-node`/`@azure/identity`.
- `ws`: vulnerabilidade moderada.

Acoes recomendadas:

1. Rodar `npm audit fix` em branch separada.
2. Atualizar Next para versao corrigida compativel.
3. Verificar se `express` e dependencias Azure sao realmente usadas na API; remover se forem residuais.
4. Rodar build, smoke test e fluxos criticos apos update.
5. Adicionar audit ao checklist de release.

### P1.6 - Build do front nao pode ignorar TypeScript/ESLint

Evidencias:

- `next.config.ts` ignora erros de ESLint e TypeScript no build.

Risco:

- Bugs e contratos quebrados podem ir para producao.

Acoes recomendadas:

1. Corrigir erros atuais.
2. Reativar bloqueio de build.
3. Rodar validacao em CI/local antes de deploy.

## Severidade P2 - Melhorias Importantes

### P2.1 - Middleware do front decodifica JWT sem verificar assinatura

Evidencias:

- `src/middleware.ts` faz parse do JWT para validar expiracao e papel visual.

Observacao:

- A decisao real precisa continuar na API. O middleware do front e util para UX, mas nao deve ser considerado controle de seguranca definitivo.

Acoes recomendadas:

1. Documentar que o front so faz guarda de navegacao.
2. Garantir que toda regra sensivel exista na API.
3. Evitar derivar permissao critica de `localStorage`.

### P2.2 - `localStorage` guarda usuario cacheado

Evidencias:

- `src/components/PrivateLayout/index.tsx` e outras partes usam `projov_user`.

Risco:

- Dado em `localStorage` fica acessivel a qualquer XSS.
- Mesmo sem token, pode expor metadados do usuario.

Acoes recomendadas:

1. Reduzir conteudo do `projov_user` ao minimo.
2. Tratar como cache de UI, nunca como autoridade.
3. Limpar no logout, 401 e troca de usuario.
4. Considerar endpoint `/me` para hidratar sessao de forma controlada.

### P2.3 - Retorno de dados sensiveis deve ser minimizado

Evidencias:

- Services de aprendiz retornam CPF, telefone, email, nascimento e outros campos.
- `CA_AprendizService` zera `Apr_senha`, mas o campo ainda aparece no objeto serializado.

Risco:

- Vazamento acidental por tela, log, cache ou exportacao.

Acoes recomendadas:

1. Criar DTOs por caso de uso.
2. Mascarar CPF/CNPJ quando o usuario nao precisar do valor completo.
3. Remover campos de senha da resposta, em vez de enviar string vazia.
4. Auditar quem acessa relatorios com dados completos.

### P2.4 - Cookies e sessao precisam de politica unica

Evidencias:

- Front proxy seta cookie `token` com `sameSite: "lax"`.
- Backend em producao usa `sameSite: "none"` e `partitioned`.

Risco:

- Duas politicas diferentes podem causar comportamento inconsistente e ampliar superficie CSRF se a API direta ficar exposta.

Acoes recomendadas:

1. Decidir arquitetura: BFF same-site ou API cross-site.
2. Se BFF same-site for o caminho, manter `SameSite=Lax` ou `Strict` onde possivel.
3. Se API cross-site for necessaria, combinar `SameSite=None; Secure` com CSRF forte.
4. Considerar rotacao de token e endpoint `/session`.

### P2.5 - Hard delete em dados sensiveis

Evidencias:

- Services genericos e especificos usam `delete` direto.

Risco:

- Dificulta auditoria, restauracao e cumprimento de politica de retencao.

Acoes recomendadas:

1. Definir politica LGPD/retencao por entidade.
2. Usar soft delete em entidades sensiveis.
3. Manter trilha de auditoria para alteracoes e exclusoes.

## Plano de Hardening

### Etapa 1 - Fechar riscos P0

- Matriz de permissoes.
- Middleware central de autorizacao.
- Allowlist de campos para `APRENDIZ`.
- Remocao de body completo dos logs.
- Troca de SQL unsafe em `VagaService` e `nextId`.

### Etapa 2 - Fortalecer autenticacao

- Primeiro acesso com convite/token.
- Reset de senha com token de uso unico.
- Politica de senha revisada.
- Rate limit por IP e identificador.
- Auditoria de login, reset, troca de senha e bloqueios.

### Etapa 3 - Proteger sessao e navegador

- Decisao unica de arquitetura BFF/API direta.
- CSRF em rotas de escrita.
- Verificacao de `Origin`/`Referer`.
- Revisao de cookies.
- `localStorage` minimizado.

### Etapa 4 - Dados sensiveis e LGPD

- DTOs de resposta por papel.
- Mascaras para CPF/CNPJ/telefone.
- Soft delete e retencao.
- Auditoria de exportacoes e relatorios.
- Politica de logs.

### Etapa 5 - Supply chain e operacao

- Atualizacao de dependencias vulneraveis.
- Remocao de dependencias nao usadas.
- `npm audit` em rotina de release.
- Build bloqueando erro.
- Backup, restore testado e controle de acesso ao banco.

## Checklist de Seguranca Para Go-Live

- Nenhuma rota sensivel sem `authorize(...)`.
- `APRENDIZ` so edita campos permitidos do proprio cadastro.
- Login, primeiro acesso e reset com rate limit e auditoria.
- Reset e primeiro acesso usam tokens de uso unico.
- CSRF definido e testado para todos os metodos de escrita.
- SQL unsafe removido ou encapsulado com allowlist e parametros.
- Logs nao contem body completo nem segredos.
- Dependencias sem vulnerabilidades conhecidas altas.
- Build falha em erro de TypeScript/ESLint.
- Cookies revisados: `HttpOnly`, `Secure`, `SameSite` adequado.
- CSP mantida e testada em producao.
- Dados sensiveis retornam somente quando necessarios.
- Backups protegidos e restauracao testada.


# Revisão de segurança — 25/09/2026

## Escopo e limites

Revisão estática do front `src`, API `apps/api/src`, configuração e inicialização, com testes locais de contratos e autenticação e `npm audit` nos dois pacotes. Não foi realizado pentest contra a Hostinger, alteração de banco, tentativa de acesso a dados de usuários ou inspeção de segredos. Ausência de um achado não comprova ausência de vulnerabilidades. O login em produção foi confirmado pelo responsável em 25/09.

## Achados priorizados

| Prioridade | Situação | Evidência e consequência | Próximo passo |
|---|---|---|---|
| Alta | Corrigido localmente | `server.ts` verificava assinatura JWT sem exigir claims de sessão. `auth.routes.ts` assina tokens de recuperação com a mesma chave, contendo email/resetSubject, sem sub/role. Um token de recuperação válido podia passar pelo hook global e alcançar rotas sem autorização adicional. | `sessionClaims.ts` agora exige identidade, perfil conhecido, expiração e tipo de acesso coerente nos dois pontos de autenticação. Publicar e testar. A verificação criptográfica continua obrigatória antes do parser. |
| Alta | Pendente | Hook global limita APRENDIZ, EDUCADOR e EMPRESA, mas usuários internos têm acesso amplo onde não há autorização de função. Exemplos: criação de parceiros e criação/alteração de aprendizes. `/users` já exige A/DEV. | Aprovar matriz recurso × ação × perfil e aplicar negação por padrão. Não inventar essa matriz a partir dos menus. |
| Alta | Pendente | `/primeiro-acesso` permite definir senha para cadastro sem senha usando identificador (CPF/CNPJ/código), sem prova de posse de e-mail ou convite. Rate limit não comprova identidade. | Adotar convite de uso único ou confirmação no e-mail já cadastrado antes de definir a senha. |
| Média | Pendente | API escuta em `0.0.0.0:3333`, `trustProxy: true` aceita cabeçalhos encaminhados. Log da Hostinger lista interfaces públicas; isso não prova que a porta está acessível externamente. | Confirmar isolamento da rede. No modelo interno, avaliar bind em 127.0.0.1 e confiança explícita no proxy. Testar na Hostinger antes de alterar a topologia. |
| Média | Pendente | Login via Next não encaminha identidade de IP; rate limit da API pode agrupar usuários no IP interno. `isTrustedLoginProxy` libera acesso se segredo não existir. | Definir propagação de IP com origem confiável e falhar fechado se LOGIN_PROXY_SECRET faltar em produção. Não confiar cegamente em cabeçalhos enviados pelo cliente. |
| Média | Pendente | Algumas rotas devolvem `error.message`, por exemplo CA_Aprendiz e exclusão de usuário; o error handler global não substitui respostas já enviadas. | Padronizar erros de negócio e ocultar exceções internas, preservando informações úteis no log com redação. |
| Média | Pendente | JWT dura oito horas. Não há consulta de revogação em cada chamada; desligar usuário ou mudar senha não invalida imediatamente token de sessão já emitido. | Definir versão de sessão/revogação e comportamento esperado ao desligar usuário. |
| Média | Pendente | Há limites de paginação sem teto em schemas como `CA_AprendizSchema`; lista de chamados não é paginada. | Limites por endpoint e paginação de chamados para controlar carga e exposição desnecessária. |
| Média | Revisar | `POST /api/auth/login` e logout não verificam explicitamente Origin; Fastify tem proteção de origem, porém o proxy de login constrói novos headers. | Testar CSRF/login CSRF e exigir origem válida no ponto público, considerando integrações autorizadas. |
| Operacional | Pendente | Segredos foram expostos em capturas durante o atendimento anterior. Esta revisão não leu nem copiou os valores. | Confirmar rotação no banco, SMTP, JWT, cookies e segredo de proxy. |

## SQL injection: resultado da inspeção

Não encontrei SQL injection evidente nas consultas de produção examinadas. Em `apps/api/src`, não foram encontrados `$queryRawUnsafe`/`$executeRawUnsafe`. Os SQLs de cronogramas, presença, attendance e estatísticas usam tagged templates Prisma ou composição `Prisma.sql`/`Prisma.join`, mantendo valores como parâmetros. Pesquisas interpoladas como valores não se tornam comandos SQL.

As duas ocorrências de `Prisma.raw` em `lib/nextId.ts` são identificadores de tabela/coluna. Antes delas existe uma lista fixa `allowedNextIdTargets`; manter essa lista fechada é essencial, pois identificadores não podem ser tratados como parâmetros comuns.

O script legado `apps/api/fix_db.js` ainda usa métodos Unsafe com SQL literal estático. Não há entrada de usuário nessas duas consultas, portanto o nome Unsafe sozinho não caracteriza injeção. O script altera schema e não deve ser executado como manutenção rotineira ou no deploy. Não foi executado nesta revisão.

## Controles já existentes e confirmados

- Prisma ORM, schemas Zod nas entradas de diversas rotas e allowlist de identificadores SQL.
- JWT assinado; cookie público HTTP-only, Secure em produção e SameSite=Lax no Next.
- `/users` administrativo protegido por A/DEV; chamados restringem acesso por solicitante/técnico dentro do serviço.
- Atualização do próprio aprendiz usa schema de campos permitidos; campos administrativos são removidos.
- Senhas bcrypt; recuperação vinculada ao fingerprint da senha atual, invalidando o token após alteração. O primeiro acesso ainda exige melhoria de identidade.
- CSP com nonce e headers no Next; CORS e bloqueio de origens nas escritas da API.
- Redação por nome de campo no logger; evitar mensagens livres e exceções com dados pessoais.
- `npm audit` em 25/09/2026: zero vulnerabilidades conhecidas tanto na raiz quanto em apps/api. Isso não avalia autorização, infraestrutura ou lógica de negócio.

## Testes e homologação

`npm run test:regression` cobre rejeição de claims de reset, roles desconhecidas/desligadas, incompatibilidade de tipo e aceitação dos perfis de sessão emitidos pelo login. O parser não verifica assinatura sozinho: ambos os pontos em server.ts chamam app.jwt.verify antes dele. Nenhuma consulta ao banco é necessária para esses testes.

Após publicar: validar login e ações autorizadas de cada perfil; verificar que tokens de reset não funcionam como cookie de sessão; testar negações por propriedade nos chamados; confirmar rede, IP/rate limit e política de revogação. Os itens pendentes acima continuam pendentes; esta revisão não os apresenta como corrigidos.

## Referências

- [Prisma: consultas SQL e parametrização](https://www.prisma.io/docs/orm/v6/prisma-client/using-raw-sql/raw-queries).
- [OWASP: autorização, privilégio mínimo e negação por padrão](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

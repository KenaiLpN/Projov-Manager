# Plano do Sistema de Chamados

Data inicial: 09/07/2026

## Objetivo

Criar dentro do ProSis uma area separada para abertura e acompanhamento de chamados internos de TI, reduzindo a dependencia de WhatsApp e substituindo a organizacao manual feita hoje no Notion.

O modulo deve funcionar como um portal simples:

- usuario acessa com credenciais do ProSis;
- sistema identifica automaticamente quem abriu o chamado;
- chamado registra data e horario de abertura;
- solicitante informa apenas a descricao;
- equipe tecnica faz a triagem, define prioridade interna e acompanha o status.

## Escopo do MVP

### Tela de entrada

Primeira mudanca visual:

- login do ProSis em layout dividido;
- lado direito: login normal do ProSis;
- lado esquerdo: entrada visual para o futuro Portal de Chamados;
- botao "Entrar para abrir chamado" prepara o login como `Usuario`.

Quando o modulo existir, esse botao deve levar para um fluxo com `returnTo=/chamados/novo`, mantendo o mesmo login por cookie httpOnly.

### Portal do solicitante

Rota sugerida:

- `/chamados/novo`

Campos iniciais:

- descricao do problema;
- anexo opcional em etapa futura;
- unidade/departamento quando essa informacao existir no cadastro do usuario.

Campos preenchidos automaticamente:

- usuario solicitante;
- nome do solicitante;
- tipo/perfil do usuario;
- data e horario de abertura;
- status inicial: `ABERTO`.

Nao incluir prioridade no formulario do solicitante. A prioridade deve ser definida pela equipe tecnica depois da triagem.

### Painel tecnico

Rotas sugeridas:

- `/chamados`
- `/chamados/[id]`

Visualizacoes:

- lista do dia;
- calendario por data de abertura;
- quadro por status.

Status iniciais:

- `ABERTO`
- `EM_ANALISE`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `RESOLVIDO`
- `CANCELADO`

Prioridade interna:

- `BAIXA`
- `MEDIA`
- `ALTA`
- `CRITICA`

Essa prioridade fica visivel apenas para tecnico, administrador e desenvolvedor.

## Regras de acesso

Ponto a confirmar antes da API:

- opcao A: qualquer usuario ativo do ProSis pode abrir chamado;
- opcao B: apenas usuarios ativos com perfil `T`, `A` ou `DEV` podem acessar o portal de chamados.

Recomendacao tecnica:

- solicitante: qualquer usuario ativo da tabela de usuarios do ProSis, excluindo desativados;
- gestao/triagem: apenas `T`, `A` e `DEV`.

Motivo:

- se apenas `T` e `A` puderem abrir chamados, outros departamentos continuam dependendo de WhatsApp;
- se todos os usuarios ativos puderem abrir, o TI centraliza a fila e mantem a prioridade sob controle interno.

## Modelo de dados proposto

Tabela principal: `TI_Chamados`

Campos:

- `ChaCodigo`: chave primaria;
- `ChaTitulo`: texto curto opcional ou gerado a partir da descricao;
- `ChaDescricao`: texto obrigatorio;
- `ChaStatus`: enum;
- `ChaPrioridade`: enum nullable, preenchido pela equipe tecnica;
- `ChaSolicitanteCodigo`: codigo do usuario solicitante;
- `ChaSolicitanteNome`: snapshot do nome no momento da abertura;
- `ChaSolicitantePerfil`: snapshot do perfil;
- `ChaDepartamento`: nullable ate existir cadastro estruturado;
- `ChaTecnicoResponsavel`: nullable;
- `ChaDataAbertura`: datetime;
- `ChaDataAtualizacao`: datetime;
- `ChaDataResolucao`: nullable;
- `ChaAtivo`: boolean.

Tabela de historico: `TI_ChamadoHistorico`

Campos:

- `HisCodigo`: chave primaria;
- `HisChamadoCodigo`: FK do chamado;
- `HisUsuarioCodigo`: usuario que fez a acao;
- `HisAcao`: texto/enum;
- `HisDescricao`: comentario da alteracao;
- `HisCriadoEm`: datetime.

## Fluxo recomendado

1. Usuario ativo entra pelo portal de chamados.
2. Sistema identifica usuario pelo cookie JWT e/ou endpoint `/users/me`.
3. Usuario descreve o problema.
4. Backend cria o chamado com status `ABERTO` e data atual.
5. Tecnico visualiza na lista do dia.
6. Tecnico define prioridade interna e status.
7. Ao resolver, chamado recebe `RESOLVIDO` e `ChaDataResolucao`.

## API sugerida

Rotas:

- `GET /chamados`: lista com filtros por data, status, solicitante e tecnico;
- `GET /chamados/:id`: detalhe;
- `POST /chamados`: abre chamado;
- `PATCH /chamados/:id/status`: altera status;
- `PATCH /chamados/:id/prioridade`: altera prioridade;
- `PATCH /chamados/:id/responsavel`: atribui tecnico;
- `POST /chamados/:id/historico`: comentario ou registro manual;

Autorizacao:

- `POST /chamados`: usuario ativo permitido conforme decisao de regra;
- alteracoes de status/prioridade/responsavel: somente `T`, `A`, `DEV`;
- `GET /chamados`: tecnico/admin/dev ve todos; solicitante ve apenas os proprios.

## Front-end sugerido

Componentes:

- `ChamadoForm`
- `ChamadosTable`
- `ChamadoStatusBadge`
- `ChamadoDayView`
- `ChamadoTimeline`

Hooks:

- `useChamados`
- `useChamadoDetail`
- `useCriarChamado`

Servicos:

- `src/services/chamadoService.ts`

Rotas:

- `src/app/chamados/page.tsx`
- `src/app/chamados/novo/page.tsx`
- `src/app/chamados/[id]/page.tsx`

## Proximas decisoes

1. Confirmar regra de quem pode abrir chamado.
2. Confirmar se vamos usar o banco da API atual ou se o modulo entra depois do monorepo.
3. Definir se o solicitante podera anexar print/arquivo no MVP.
4. Definir se o chamado tera titulo manual ou titulo automatico.
5. Criar tabelas no backend e rotas protegidas.
6. Implementar telas do portal e painel tecnico.

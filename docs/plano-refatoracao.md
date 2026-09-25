# Refatoração: situação verificada em 25/09/2026

## O que já foi feito

A refatoração anterior é parcial. O código já está no monorepo, possui componentes de formulário/tabela, menus por módulo, hooks e funções comuns. Não é necessário recomeçar do zero.

| Estrutura | Uso observado | Avaliação |
|---|---|---|
| `src/hooks/useCrud.ts` | Oito páginas de cadastros | Reutilização real; várias outras páginas mantêm implementação própria. |
| `apps/api/src/lib/baseService.ts` | Somente GrauParentescoService herda | A afirmação antiga de que a maioria herda era incorreta. Expandir apenas onde os contratos forem compatíveis. |
| `src/services/cepService.ts` | Diversos formulários de endereço | Requisição de CEP já centralizada; callbacks locais preenchem campos distintos e não precisam ser idênticos. Cadastro de aprendiz ainda tem chamada própria. |
| `src/utils/roles.ts`, `apps/api/src/lib/authorization.ts` | Front e API | Já existe centralização dentro de cada camada, mas middleware e ChamadoService ainda repetem normalização/rótulos. |
| `src/components/chamados` | Portal e painel técnico | Modais de conversa, formulário, resolução e notificações já reutilizados. |
| `next.config.ts` | Build atual | Não ignora erros TypeScript/ESLint. O plano de maio estava desatualizado nesse ponto. |

## O que foi centralizado nesta revisão

- `src/utils/apiResponse.ts`: validação estrutural de JSON, listas e paginação; erro seguro e único.
- `src/services/chamadoResponse.ts`: contrato de chamados, conversas e notificações validado com Zod antes de alterar estado.
- `chamadoErrorMessage` reutiliza `getApiErrorMessage`; remove implementação duplicada.
- `useCrud`: rejeita paginação inválida, preserva lista anterior em falha e ignora respostas de requisições anteriores que terminam depois das novas.
- 27 páginas legadas passaram a usar a mesma validação estrutural nos pontos de atribuição de listas identificados. Essa checagem não valida todos os campos de cada objeto.
- Login Next valida resposta de sucesso antes de emitir cookie. Resposta inválida da API resulta em 502 controlado.

## O que ainda vale refatorar

| Ordem | Arquivo/área | Tamanho aproximado na revisão | Extração proposta |
|---|---|---|---|
| 1 | `src/app/pedagogico/presenca-data-turma/page.tsx` | 2.455 linhas | Hooks de consulta/salvamento, filtros, grade e exportação, preservando regras de presença. |
| 2 | `apps/api/src/services/PresencaService.ts` | 1.926 linhas | Regras de calendário, consulta de presença e gravação em serviços pequenos. |
| 3 | `src/app/estatisticas/geral_aprendiz/page.tsx` | 1.440 linhas | Registro de relatórios, componentes de filtros e renderizadores de tabela/gráfico. |
| 4 | `src/app/aprendizes/cadaprendizes/page.tsx` | 1.370 linhas | Hook de formulário, abas, rascunho e endereços. |
| 5 | `src/components/forms/aprendiz/CalendarioForm.tsx` | 1.152 linhas | Cálculo de dias separado da apresentação. |
| 6 | Chamados dashboard/portal | 833 / 606 linhas | Compartilhar formatação de datas e estado fechado; extrair toolbar/fila e hook de atualização. Manter permissões e diferenças de UX explícitas. |

Também há `getResponseArray` repetido em cronogramas, alunos-turma e geração de cronogramas; formatos de API são inconsistentes (lista direta, envelope data, campos nomeados). Antes de unificar todos, definir contratos e exemplos reais. Não transformar toda falha em `[]`, pois isso mascara erro como lista vazia.

## Como executar com controle

1. Um módulo por alteração. Primeiro testes de comportamento atual, depois extração sem mudança visual, depois melhorias funcionais.
2. Evitar componente universal com dezenas de flags. Compartilhar só o que possui mesma regra e contrato.
3. Padronizar leitura/erro nas fronteiras HTTP; manter validação de entrada e autorização na API.
4. Introduzir política de autorização antes de ampliar BaseService para operações sensíveis.
5. Revisar diff, rodar testes de regressão, tipos, lint e build isolado; homologar no ambiente publicado.

Nesta rodada não foram reescritas as páginas grandes. Foram corrigidas as fronteiras que provocavam falhas e documentadas extrações concretas para próximas alterações. Inventário completo de arquivos: [MAPA_CODIGO.md](MAPA_CODIGO.md). Riscos: [auditoria-seguranca.md](auditoria-seguranca.md).

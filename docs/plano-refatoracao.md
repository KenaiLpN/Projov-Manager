# Plano de Refatoracao Tecnica

Data da analise: 30/05/2026

Escopo analisado:

- Front-end: `ProSis` (`Next.js 15`, `React 19`, `TypeScript`, `Tailwind`, `PrimeReact`)
- API: `../bot-api-ff` (`Fastify`, `Prisma`, `MySQL`, `Zod`, `JWT/cookies`)

Este documento e um roteiro de melhoria gradual. Ele nao pressupoe reescrever o sistema inteiro; a ideia e reduzir risco, duplicacao e dificuldade de manutencao por partes pequenas, testaveis e reversiveis.

## Resumo Executivo

O projeto ja tem bons pontos de base: separacao entre front e API, uso de schemas Zod em varias rotas, `httpOnly cookie` para sessao, CSP no middleware do front, headers de seguranca no Next e um padrao CRUD reconhecivel no front.

Os principais gargalos atuais estao em quatro frentes:

1. Algumas telas e services ficaram grandes demais e misturam busca, estado, regra de negocio, formatacao e UI no mesmo arquivo.
2. Existem pontos duplicados ou parcialmente padronizados entre CRUDs, listas, formularios, presenca, faltas e relatorios.
3. A tipagem ainda depende bastante de `any`, `passthrough()` e respostas genericas, o que deixa bugs escaparem para runtime.
4. O build do front esta configurado para ignorar erros de TypeScript e ESLint, entao problemas reais podem chegar em producao sem bloquear deploy.

## Prioridades

| Prioridade | Tema | Por que fazer |
|---|---|---|
| P0 | Reativar qualidade de build do front | Hoje `next.config.ts` ignora erros de ESLint e TypeScript. Isso enfraquece a confianca do deploy. |
| P0 | Separar paginas criticas gigantes | Telas de aprendiz, estatisticas e presenca concentram muita regra e dificultam qualquer ajuste seguro. |
| P1 | Padronizar CRUDs e formularios | Reduz duplicacao e acelera futuras telas. |
| P1 | Componentizar UI, hooks e funcoes compartilhadas | Facilita manutencao, evita codigo repetido e deixa as paginas menores. |
| P1 | Reduzir `any`, `z.any()` e `passthrough()` | Aumenta seguranca, previsibilidade e documentacao viva dos contratos. |
| P1 | Extrair regras de presenca/faltas | Evita divergencia entre "presenca normal", "capacitacao" e "informatica". |
| P2 | Revisar scripts e codigo legado | Remove ruido, pontos mortos e risco de scripts acidentais. |
| P2 | Criar suite minima de testes | Garante que refatoracoes futuras nao quebrem fluxos sensiveis. |

## Achados de Refatoracao

### 1. Build do front esta permissivo demais

Evidencias:

- `next.config.ts` usa `eslint.ignoreDuringBuilds: true`
- `next.config.ts` usa `typescript.ignoreBuildErrors: true`
- `npx tsc --noEmit --pretty false` no front ainda acusa erros em `estatisticas/geral_aprendiz`, `estatisticas/relatorio_log` e `calendarioAprendizagem.test.ts`

Risco:

- Erros de tipo e regressao podem ir para producao.
- Refatoracoes ficam menos confiaveis porque o build nao serve como rede de protecao.

Acoes recomendadas:

1. Corrigir os erros atuais de TypeScript.
2. Reativar falha de build para TypeScript.
3. Depois reativar falha de build para ESLint.
4. Criar comando de validacao padrao: `npm run lint && npx tsc --noEmit && npm run build`.

### 2. Telas grandes demais no front

Arquivos mais criticos por tamanho e responsabilidade acumulada:

- `src/app/estatisticas/geral_aprendiz/page.tsx`
- `src/app/aprendizes/cadaprendizes/page.tsx`
- `src/app/pedagogico/presenca-data-turma/page.tsx`
- `src/components/forms/aprendiz/CalendarioForm.tsx`
- `src/app/aprendizes/page.tsx`
- `src/app/pedagogico/faltas-capacitacao/page.tsx`
- `src/app/pedagogico/monitores/page.tsx`
- `src/app/pedagogico/turmas/page.tsx`

Padrao observado:

- Um mesmo arquivo cuida de estado, chamadas HTTP, formatacao, validacao, layout, tabela, modal e regra de negocio.

Acoes recomendadas:

1. Dividir cada tela grande em:
   - `page.tsx`: composicao da tela
   - `hooks/useNomeDaTela.ts`: estado, busca e handlers
   - `components/NomeDaTelaFilters.tsx`: filtros
   - `components/NomeDaTelaTable.tsx`: tabela
   - `components/NomeDaTelaActions.tsx`: botoes e acoes
   - `services/nomeDaTelaService.ts`: chamadas HTTP especificas
2. Comecar pelas telas que mudam com frequencia: presenca, aprendiz e faltas.
3. Evitar refatorar visual e regra ao mesmo tempo, salvo quando a tela ja estiver quebrada.

### 2.1. Componentizacao visual e extracao de funcoes compartilhadas

Contexto:

- A ideia original de criar componentes, importar na pagina e preencher com props esta correta.
- Exemplo bom: cards da Home como componente reutilizavel, recebendo valores pela pagina.
- O mesmo principio deve valer para funcoes usadas por varias telas, hooks de estado e chamadas para APIs publicas.

Evidencias encontradas:

- `buscaCEP` aparece repetido em varias paginas:
  - `src/app/cadastros/unidades/page.tsx`
  - `src/app/cadastros/instituicoes/page.tsx`
  - `src/app/cadastros/instituicoes-parceiras/page.tsx`
  - `src/app/aprendizes/cadaprendizes/page.tsx`
  - `src/app/empresa/cadregistrogi/page.tsx`
- Ja existe uma rota interna para CEP:
  - `src/app/api/cep/[cep]/route.ts`
- Algumas abas e partes de formularios ja caminham para componentes, como `src/components/forms/aprendiz/*`, mas ainda ha muita logica presa dentro das paginas.

Objetivo:

- Fazer as paginas ficarem mais parecidas com uma composicao de blocos.
- Concentrar regras reaproveitaveis em um lugar so.
- Diminuir arquivos de 800 a 1300 linhas para arquivos menores, com responsabilidades claras.

Convencao sugerida de organizacao:

```txt
src/
  components/
    cards/
    forms/
    inputs/
    tables/
    ui/
  hooks/
    useCep.ts
    useCrud.ts
    useDebouncedValue.ts
  services/
    cepService.ts
    aprendizService.ts
  utils/
    formatters/
      date.ts
      document.ts
      phone.ts
    validators/
      cep.ts
      cpf.ts
      cnpj.ts
```

Exemplos de extracao:

| Codigo repetido | Destino sugerido | Uso esperado |
|---|---|---|
| `buscaCEP` | `src/services/cepService.ts` ou `src/hooks/useCep.ts` | Cadastros chamam a mesma funcao/hook e recebem endereco normalizado. |
| Mascara de data | `src/utils/formatters/date.ts` e `DateInput` | Presenca, faltas, relatorios e filtros usam o mesmo comportamento. |
| Campos de formulario | `src/components/forms/fields/*` | Labels, erros, tema claro/escuro e layout ficam uniformes. |
| Tabelas CRUD | `src/components/tables/*` | Loading, vazio, acoes e paginacao ficam padronizados. |
| Cards da Home | `src/components/cards/*` | Home so passa titulo, icone, valor e rota. |
| Normalizacao de CPF/CNPJ/telefone | `src/utils/formatters/document.ts` | Evita regex repetida e bugs diferentes por tela. |

Regra pratica para decidir quando componentizar:

1. Se aparece em duas telas, pode virar candidato.
2. Se aparece em tres telas, deve virar componente, hook, service ou util.
3. Se mistura regra de negocio com visual, separar primeiro a regra em hook/service.
4. Se e apenas layout visual, extrair componente visual.
5. Se depende de API ou efeito colateral, preferir service ou hook.

Acoes recomendadas:

1. Criar `cepService` para centralizar a chamada da rota `/api/cep/:cep`.
2. Criar `useCep` para telas que precisam preencher campos automaticamente.
3. Criar componentes de formulario reutilizaveis para campos comuns: CEP, cidade, UF, bairro, endereco, telefone, CPF/CNPJ.
4. Mapear funcoes repetidas por dominio antes de refatorar cada tela.
5. Manter a pagina como orquestradora: ela importa componentes, hooks e services, mas nao concentra tudo.

### 3. Duplicacao no dominio de presenca, faltas e relatorios

Arquivos relacionados:

- Front: `src/app/pedagogico/presenca-data-turma/page.tsx`
- Front: `src/app/pedagogico/faltas-capacitacao/page.tsx`
- Front: `src/app/pedagogico/presenca/page.tsx`
- API: `../bot-api-ff/src/services/PresencaService.ts`
- API: `../bot-api-ff/src/services/AttendanceService.ts`
- API: `../bot-api-ff/src/routes/presenca.routes.ts`
- API: `../bot-api-ff/src/routes/attendance.routes.ts`

Problema:

- Existem fluxos muito parecidos para presenca por data/turma, presenca capacitacao, faltas e relatorios.
- A tendencia e cada aba ganhar sua propria variacao, aumentando divergencia visual e funcional.

Acoes recomendadas:

1. Criar uma camada de dominio para presenca:
   - tipos de filtro
   - normalizacao de data `dd/MM/yyyy` e `yyyy-MM-dd`
   - montagem de lista de alunos
   - status de presenca/falta
   - payloads de salvar/imprimir
2. Extrair componentes reutilizaveis:
   - `PresenceFilters`
   - `PresenceTextareaGroup`
   - `PresenceResultTable`
   - `PresenceEmptyState`
3. Na API, separar consultas de presenca em funcoes menores:
   - buscar alunos por turma e periodo
   - buscar presencas existentes
   - consolidar contadores
   - montar DTO final

### 4. CRUDs podem ficar mais uniformes

Base existente:

- `src/hooks/useCrud.ts`
- services por dominio em `src/services/`
- tabelas em `src/components/tabelas/`
- formularios em `src/components/forms/`

Problema:

- O padrao existe, mas varias telas ainda fazem sua propria versao.
- Isso aumenta repeticao de loading, erro, pagina, busca, modal, submit e toast.

Acoes recomendadas:

1. Fortalecer `useCrud` com generics mais especificos.
2. Criar um contrato comum para services CRUD:
   - `list(params)`
   - `get(id)`
   - `create(payload)`
   - `update(id, payload)`
   - `remove(id)`
3. Criar componentes base:
   - `CrudToolbar`
   - `CrudTableShell`
   - `CrudModal`
   - `SearchInput`
   - `PaginationBar`
4. Migrar CRUDs em ondas, comecando pelos menores.

### 5. Excesso de `any`, respostas genericas e schemas permissivos

Evidencias no front:

- `src/app/aprendizes/cadaprendizes/page.tsx`
- `src/components/forms/aprendiz/CalendarioForm.tsx`
- `src/hooks/useCrud.ts`
- `src/components/vagas/VagaForm.tsx`
- `src/components/vagas/VagaList.tsx`

Evidencias na API:

- `../bot-api-ff/src/lib/baseService.ts`
- `../bot-api-ff/src/routes/educador.routes.ts` com `z.any()`
- `../bot-api-ff/src/routes/alocacao.routes.ts` com `passthrough()`
- `../bot-api-ff/src/routes/CA_Capacitacao.routes.ts` com `passthrough()`
- `../bot-api-ff/src/routes/faltasCapacitacao.routes.ts` com objetos permissivos
- `../bot-api-ff/src/schemas/CA_AprendizSchema.ts` e `aprendizSchema.ts` com `passthrough()`

Risco:

- Campos inesperados podem atravessar camadas sem serem percebidos.
- Refatoracoes podem quebrar contratos sem erro de compilacao.
- O front pode depender de campos que a API nao garante formalmente.

Acoes recomendadas:

1. Trocar `any` por `unknown` quando o dado ainda precisa ser validado.
2. Criar DTOs explicitos por tela/endpoint.
3. Remover `passthrough()` onde nao houver motivo claro.
4. Usar `strict()` em schemas de entrada sensiveis.
5. Separar schema de entrada, schema de banco e schema de resposta.

### 6. API tem services grandes e responsabilidades misturadas

Arquivos principais:

- `../bot-api-ff/src/services/PresencaService.ts`
- `../bot-api-ff/src/services/AttendanceService.ts`
- `../bot-api-ff/src/routes/auth.routes.ts`
- `../bot-api-ff/src/services/CA_AprendizService.ts`
- `../bot-api-ff/src/server.ts`
- `../bot-api-ff/src/services/Estatistica_Gestao_Avaliacoes_Service.ts`

Acoes recomendadas:

1. Separar services grandes por caso de uso.
2. Manter routes finas, apenas validando entrada, chamando service e devolvendo resposta.
3. Criar `repositories` apenas para consultas complexas ou SQL especifico.
4. Centralizar formatacao de BigInt/data em helpers testados.
5. Criar testes unitarios para cada funcao extraida antes de trocar a tela.

### 7. Geracao manual de IDs com `MAX + 1`

Evidencias:

- `../bot-api-ff/src/lib/nextId.ts`
- `../bot-api-ff/src/lib/baseService.ts`
- varios services chamam `getNextId(...)`

Problema:

- `MAX(id) + 1` tem risco de corrida quando duas criacoes acontecem ao mesmo tempo.
- Tambem obriga mais services a conhecerem detalhes de chave primaria.

Acoes recomendadas:

1. Mapear tabelas que podem migrar para `AUTO_INCREMENT`.
2. Onde nao for possivel, usar transacao com bloqueio adequado.
3. Encapsular geracao de ID por tabela para nao espalhar a decisao.
4. Adicionar testes de concorrencia para endpoints de criacao mais usados.

### 8. Codigo legado, scripts e logs de desenvolvimento

Evidencias:

- `../bot-api-ff/src/alterTable.ts`
- `../bot-api-ff/scripts/check-usuarios.ts`
- `../bot-api-ff/src/services/CA_AprendizService.ts` contem `getStats_new`, `getById_new`, `findCount`
- `console.log` em `src/app/home/page.tsx`, `src/app/pedagogico/turmas/page.tsx`, `src/app/cadastros/usuarios/page.tsx`
- `console.log` em services e scripts da API
- templates antigos em `src/utils/layouts/*.txt`

Acoes recomendadas:

1. Criar uma pasta `archive/` fora de `src` para material historico que ainda precise ser guardado.
2. Remover scripts one-off do bundle principal ou marcar no `package.json` como scripts manuais.
3. Trocar `console.log` por logger controlado por ambiente.
4. Remover metodos `_new` ou promover para versao oficial com teste.

### 9. Data, mascara e componentes de input precisam de padrao unico

Contexto:

- Varias telas precisam aceitar digitacao manual de data e tambem picker.
- O mesmo problema apareceu em presenca, lista de presenca, faltas e capacitacao.

Acoes recomendadas:

1. Criar `DateInput` unico com:
   - valor interno normalizado
   - exibicao `dd/MM/yyyy`
   - digitacao manual
   - parse tolerante e validacao clara
   - suporte a tema claro/escuro
2. Reusar em todas as telas pedagogicas.
3. Testar datas invalidas, datas vazias e conversao para payload da API.

### 10. Testes devem acompanhar as refatoracoes

Suite minima recomendada:

- Unitarios para formatadores de data, BigInt e CPF/CNPJ.
- Unitarios para services de presenca/faltas.
- Unitarios para autorizacao na API.
- Testes de contrato para endpoints principais.
- E2E visual ou funcional para login, cadastro de aprendiz, presenca por data/turma e faltas.

## Roadmap Sugerido

### Fase 0 - Congelar base de qualidade

- Corrigir TypeScript atual.
- Rodar `npm audit` nos dois repositorios.
- Atualizar dependencias vulneraveis com teste de regressao.
- Reativar falha de build do front.

### Fase 1 - Segurança e contratos antes de refatorar pesado

- Implementar autorizacao central por papel/acao.
- Restringir payloads sensiveis.
- Remover schemas permissivos em endpoints criticos.
- Padronizar DTOs de resposta.

### Fase 2 - Presenca e faltas

- Extrair hook e componentes de filtros/tabela.
- Extrair services e DTOs de presenca.
- Unificar tratamento de data.
- Cobrir regras com testes.

### Fase 3 - Cadastro de aprendiz

- Dividir `cadaprendizes/page.tsx`.
- Separar abas em hooks/componentes.
- Criar schemas especificos por aba.
- Revisar campos editaveis por perfil.

### Fase 4 - CRUDs administrativos

- Migrar paginas pequenas para o padrao comum.
- Reduzir duplicacao de tabelas, modais e busca.
- Tipar services e respostas.
- Extrair funcoes repetidas como CEP, mascaras e validadores para `services`, `hooks` e `utils`.
- Transformar blocos visuais repetidos em componentes pequenos e bem nomeados.

### Fase 5 - API services grandes

- Quebrar `PresencaService`, `AttendanceService` e `CA_AprendizService`.
- Remover SQL inseguro ou encapsular como repository parametrizado.
- Eliminar `MAX + 1` onde for possivel.

### Fase 6 - Limpeza final

- Remover templates antigos e scripts one-off de `src`.
- Padronizar logger.
- Criar documentacao de arquitetura viva.

## Checklist de Aceite

- `npm run lint` passa no front.
- `npx tsc --noEmit` passa no front e na API.
- `npm run build` passa no front e na API.
- `npm audit --audit-level=moderate` nao retorna vulnerabilidades conhecidas sem justificativa.
- Rotas criticas tem schema de entrada e resposta.
- Nenhum endpoint sensivel depende apenas de regra visual do front.
- Perfis tem matriz de permissao documentada.
- Refatoracoes de presenca/faltas mantem comportamento validado com testes.

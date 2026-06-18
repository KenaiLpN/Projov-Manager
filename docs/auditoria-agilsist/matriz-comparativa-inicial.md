# Matriz comparativa inicial: Agilsist x ProSis

Comparacao inicial realizada em 15/06/2026.

Esta matriz combina:

- menus observados no Agilsist de producao, em navegacao somente leitura;
- rotas, menus e implementacoes encontrados no codigo-fonte atual do ProSis.

Ela ainda nao substitui a comparacao detalhada de cada pagina.

## Resumo executivo

O ProSis ja cobre o conjunto de paginas aprovado para o novo sistema. Paginas
como Hollerit, Boleto, Nota Fiscal e Backup foram deliberadamente retiradas do
escopo e nao representam lacunas.

Os pontos pendentes confirmados nesta etapa sao:

- funcionalidades pontuais do Controle de Presenca;
- validacao da matriz de autorizacao dos usuarios internos;
- aprofundamento do perfil Educador/Funcionario;
- comparacao detalhada das paginas existentes no ProSis.

## Perfil Aprendiz

| Agilsist | ProSis | Situacao | Evidencia inicial |
|---|---|---|---|
| Meus Dados | `/aprendizes/cadaprendizes?id=<codigo>` | Parcial | O ProSis restringe o aprendiz a sua propria ficha e permite atualizacao dos dados. A comparacao campo a campo ainda nao foi feita. |
| Hollerit | Fora do escopo atual | Removido intencionalmente | Pode ser reavaliado futuramente, mas nao pertence ao projeto aprovado atual. |

## Perfil Parceiro

| Agilsist | ProSis | Situacao | Evidencia inicial |
|---|---|---|---|
| Detalhes Parceiros | `/empresa/perfil` | Equivalente aparente | A pagina carrega e permite atualizar o cadastro da empresa. Requer comparacao de campos e permissoes. |
| Aprendizes Alocados | `/empresa/aprendizes-alocados` | Equivalente aparente | Implementacao funcional com busca, detalhes, frequencia, documentos e calendario. |
| Presenca por Periodo | `/empresa/controle-presenca/por-periodo` | Equivalente aparente | Rota e pagina implementadas. |
| Total Periodo | `/empresa/controle-presenca/total-periodo` | Equivalente aparente | Rota e pagina implementadas. |
| Cadastrado de vagas | `/empresa/cadastro-vagas` | Implementado | Lista e permite cadastrar vagas sempre vinculadas a empresa autenticada. |
| Avaliacao Desempenho | `/empresa/avaliacao-desempenho` | Parcial | Lista avaliacoes pendentes da empresa. O fluxo de resposta ainda requer definicao detalhada. |
| Contagem Faltas | `/empresa/contagem-faltas` | Implementado | Consulta faltas por periodo somente dos aprendizes vinculados a empresa. |
| Avaliacoes Realizada | `/empresa/avaliacoes-realizadas` | Implementado | Consulta o historico de avaliacoes realizadas da empresa. |

### Requisitos observados nos placeholders do parceiro

As paginas abaixo foram abertas somente para leitura. Nenhum botao de acao,
pesquisa, resposta, impressao ou cadastro foi acionado.

#### Cadastro de Vagas

No Agilsist, a pagina possui:

- abas ou acoes `Vagas` e `Nova Vaga`;
- filtro por parceiro e numero maximo de registros;
- pesquisa e paginacao da tabela;
- colunas de codigo da vaga, area de atuacao, empresa, situacao, sexo, data,
  atividades, encaminhamentos e impressao.

O placeholder `/empresa/cadastro-vagas` precisa, no minimo, cobrir a listagem,
os filtros, a criacao de vaga, os encaminhamentos e a emissao/visualizacao.

#### Avaliacao de Desempenho

No Agilsist, a pagina `Avaliacoes Disponiveis Empresa` possui:

- filtros por unidade, matricula, ano e mes;
- pesquisa, paginacao e filtro local da tabela;
- colunas de parceiro, unidade, aprendiz, pesquisa, mes, ano, situacao,
  matricula e turma;
- acoes `Responder` e `Gerar Link`.

O placeholder `/empresa/avaliacao-desempenho` precisa implementar esse fluxo
sem expor avaliacoes de outras empresas.

#### Contagem de Faltas

No Agilsist, a pagina possui:

- periodo inicial e final;
- acao de pesquisa;
- acao de impressao.

O placeholder `/empresa/contagem-faltas` precisa consultar somente os
aprendizes vinculados ao parceiro autenticado.

#### Avaliacoes Realizadas

No Agilsist, a pagina possui:

- acoes `Listar` e `Imprimir`;
- filtro por data inicial e data final;
- pesquisa das avaliacoes de ensino-aprendizagem realizadas no periodo.

O placeholder `/empresa/avaliacoes-realizadas` precisa implementar a consulta
historica e a emissao correspondente.

## Usuario Interno: funcoes removidas ou divergentes

| Agilsist | ProSis | Situacao | Observacao |
|---|---|---|---|
| Consulta Parceiros | Nao encontrada como rota separada | Sem equivalente evidente | O cadastro de empresas possui busca, mas a equivalencia funcional precisa ser confirmada. |
| Consulta Unidades do Parceiro | Nao encontrada como rota separada | Sem equivalente evidente | O cadastro de unidades possui busca, mas a equivalencia funcional precisa ser confirmada. |
| Boleto | Fora do escopo atual | Removido intencionalmente | Nao pertence ao conjunto aprovado de paginas. |
| Nota Fiscal | Fora do escopo atual | Removido intencionalmente | Nao pertence ao conjunto aprovado de paginas. |
| Backup | Fora do escopo atual | Removido intencionalmente | Nao pertence ao conjunto aprovado de paginas. |
| Cadastro de Perfil | `/acessos/funcoes` e `/acessos/designar` | Parcial/nao confirmado | O modelo de acesso do ProSis parece diferente; requer comparacao detalhada. |
| Pesquisa de vagas | `/vagas` | Parcial/nao confirmado | O ProSis possui gestao de vagas, mas ainda e necessario comparar cadastro e pesquisa do legado. |
| Datas encontros | `/pedagogico/datas-encontros` | Implementado, navegacao divergente | A rota existe, mas nao aparece no menu principal pedagogico atual. |

## Controle de Presenca

A maior parte dos itens do menu legado foi consolidada em
`/pedagogico/presenca-data-turma`, com abas e paineis equivalentes.

| Funcao do Agilsist | Situacao inicial no ProSis |
|---|---|
| Por Data/Turma e variacoes por periodo, parceiro e total | Implementadas ou representadas por abas na pagina consolidada. |
| Comunicado Faltas | Parcial: a pagina informa que a logica ainda sera implementada. |
| Conteudos Lecionados no Periodo | Parcial: a consulta existe, mas a gravacao ainda depende de endpoint. |
| Aulas dadas, Controle de Faltas e Estatisticas de Presenca | Existem como paineis na pagina consolidada; requerem comparacao de resultados. |

## Cobertura administrativa aparente

Existem rotas correspondentes no ProSis para a maior parte dos seguintes grupos:

- cadastros gerais;
- empresas, unidades e orientadores;
- usuarios e designacao de funcoes;
- aprendizes, ocorrencias, aniversariantes, ativos e candidatos;
- cadastros pedagogicos;
- listas de presenca;
- cronogramas;
- aprendizes e alunos por turma;
- lancamentos de faltas;
- estatisticas e avaliacoes administrativas.

Essas correspondencias ainda estao classificadas como aparentes ate que cada
pagina seja comparada em profundidade com o Agilsist.

## Perfil Educador/Funcionario

O ProSis possui a rota `/educador/perfil`, que permite ao educador atualizar o
proprio cadastro. A comparacao com o Agilsist permanece `Nao verificado` ate que
uma conta de teste do legado esteja disponivel.

## Prioridade sugerida para a proxima auditoria

1. Perfil Parceiro, porque ha quatro placeholders confirmados.
2. Perfil Aprendiz, principalmente a ausencia de Hollerit e a comparacao de
   `Meus Dados`.
3. Vagas e funcoes de Empresa do usuario interno.
4. Controle de Presenca, focando nas funcoes ainda parciais.
5. Perfil Educador/Funcionario quando houver acesso.

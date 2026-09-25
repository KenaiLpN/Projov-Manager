# Mapa do código ProSis

Gerado em 2026-09-25 por `node scripts/generate-code-map.mjs`. Inventário de arquivos, não uma certificação funcional de cada linha. Exclui dependências, builds, logs e segredos.

## Por onde começar

| Responsabilidade | Local |
|---|---|
| Navegação e telas | src/app; page.tsx define a página, layout.tsx envolve páginas |
| Componentes reutilizáveis | src/components |
| Estado e requisições reutilizáveis | src/hooks |
| Chamadas HTTP e contratos de chamados | src/services |
| Validação de respostas e utilitários | src/utils |
| Sessão e CSP de navegação | src/middleware.ts |
| API: registro, autenticação e HTTP | apps/api/src/server.ts |
| API: endpoints e validação de entrada | apps/api/src/routes e schemas |
| API: regras e acesso aos dados | apps/api/src/services |
| Banco: modelos e relações | apps/api/prisma/schema.prisma |
| Produção Hostinger | scripts/start-production.mjs e run-api-production.mjs |

## Fluxo de uma alteração

1. Localize a página e o componente. Identifique endpoint e contrato esperado.
2. Siga a rota da API até o service e o modelo Prisma.
3. Confirme autorização e schema de entrada antes de alterar gravações.
4. Valide a resposta antes de atualizar estado.
5. Rode testes e tipos; revise o diff; depois publique e homologue.

## Interface e lógica do navegador (180 arquivos)

| Arquivo | Linhas | Rotas declaradas |
|---|---:|---|
| [src/app/acessos/designar/page.tsx](../src/app/acessos/designar/page.tsx) | 198 | — |
| [src/app/acessos/funcoes/page.tsx](../src/app/acessos/funcoes/page.tsx) | 302 | — |
| [src/app/acessos/page.tsx](../src/app/acessos/page.tsx) | 13 | — |
| [src/app/api/auth/login/route.ts](../src/app/api/auth/login/route.ts) | 84 | — |
| [src/app/api/auth/logout/route.ts](../src/app/api/auth/logout/route.ts) | 17 | — |
| [src/app/api/cep/[cep]/route.ts](../src/app/api/cep/[cep]/route.ts) | 26 | — |
| [src/app/aprendizes/aniversariantes/page.tsx](../src/app/aprendizes/aniversariantes/page.tsx) | 7 | — |
| [src/app/aprendizes/ativos/page.tsx](../src/app/aprendizes/ativos/page.tsx) | 7 | — |
| [src/app/aprendizes/cadaprendizes/candidatos/page.tsx](../src/app/aprendizes/cadaprendizes/candidatos/page.tsx) | 7 | — |
| [src/app/aprendizes/cadaprendizes/page.tsx](../src/app/aprendizes/cadaprendizes/page.tsx) | 1370 | — |
| [src/app/aprendizes/ocorrencias/page.tsx](../src/app/aprendizes/ocorrencias/page.tsx) | 171 | — |
| [src/app/aprendizes/page.tsx](../src/app/aprendizes/page.tsx) | 689 | — |
| [src/app/cadastros/feriados/page.tsx](../src/app/cadastros/feriados/page.tsx) | 249 | — |
| [src/app/cadastros/grau-parentesco/page.tsx](../src/app/cadastros/grau-parentesco/page.tsx) | 182 | — |
| [src/app/cadastros/graus-escolaridade/page.tsx](../src/app/cadastros/graus-escolaridade/page.tsx) | 195 | — |
| [src/app/cadastros/instituicoes-parceiras/page.tsx](../src/app/cadastros/instituicoes-parceiras/page.tsx) | 558 | — |
| [src/app/cadastros/instituicoes/page.tsx](../src/app/cadastros/instituicoes/page.tsx) | 481 | — |
| [src/app/cadastros/motivos-desligamento/page.tsx](../src/app/cadastros/motivos-desligamento/page.tsx) | 195 | — |
| [src/app/cadastros/ocorrencias/page.tsx](../src/app/cadastros/ocorrencias/page.tsx) | 319 | — |
| [src/app/cadastros/profissoes/page.tsx](../src/app/cadastros/profissoes/page.tsx) | 195 | — |
| [src/app/cadastros/regioes/page.tsx](../src/app/cadastros/regioes/page.tsx) | 178 | — |
| [src/app/cadastros/situacoes-participante/page.tsx](../src/app/cadastros/situacoes-participante/page.tsx) | 219 | — |
| [src/app/cadastros/status-encaminhamento/page.tsx](../src/app/cadastros/status-encaminhamento/page.tsx) | 218 | — |
| [src/app/cadastros/unidades/page.tsx](../src/app/cadastros/unidades/page.tsx) | 550 | — |
| [src/app/cadastros/usuarios/page.tsx](../src/app/cadastros/usuarios/page.tsx) | 357 | — |
| [src/app/chamados/admin/dashboard/page.tsx](../src/app/chamados/admin/dashboard/page.tsx) | 833 | — |
| [src/app/chamados/page.tsx](../src/app/chamados/page.tsx) | 6 | — |
| [src/app/chamados/portal/page.tsx](../src/app/chamados/portal/page.tsx) | 606 | — |
| [src/app/configuracoes/page.tsx](../src/app/configuracoes/page.tsx) | 5 | — |
| [src/app/educador/perfil/page.tsx](../src/app/educador/perfil/page.tsx) | 114 | — |
| [src/app/empresa/aprendizes-alocados/page.tsx](../src/app/empresa/aprendizes-alocados/page.tsx) | 549 | — |
| [src/app/empresa/avaliacao-desempenho/page.tsx](../src/app/empresa/avaliacao-desempenho/page.tsx) | 3 | — |
| [src/app/empresa/avaliacoes-realizadas/page.tsx](../src/app/empresa/avaliacoes-realizadas/page.tsx) | 3 | — |
| [src/app/empresa/cadastro-vagas/page.tsx](../src/app/empresa/cadastro-vagas/page.tsx) | 84 | — |
| [src/app/empresa/cadempresas/page.tsx](../src/app/empresa/cadempresas/page.tsx) | 571 | — |
| [src/app/empresa/cadoriantadores/page.tsx](../src/app/empresa/cadoriantadores/page.tsx) | 335 | — |
| [src/app/empresa/cadramosatividade/page.tsx](../src/app/empresa/cadramosatividade/page.tsx) | 328 | — |
| [src/app/empresa/cadregistrogi/page.tsx](../src/app/empresa/cadregistrogi/page.tsx) | 911 | — |
| [src/app/empresa/cadunidadeparceiro/page.tsx](../src/app/empresa/cadunidadeparceiro/page.tsx) | 479 | — |
| [src/app/empresa/contagem-faltas/page.tsx](../src/app/empresa/contagem-faltas/page.tsx) | 80 | — |
| [src/app/empresa/controle-presenca/por-periodo/page.tsx](../src/app/empresa/controle-presenca/por-periodo/page.tsx) | 300 | — |
| [src/app/empresa/controle-presenca/total-periodo/page.tsx](../src/app/empresa/controle-presenca/total-periodo/page.tsx) | 260 | — |
| [src/app/empresa/perfil/page.tsx](../src/app/empresa/perfil/page.tsx) | 119 | — |
| [src/app/error.tsx](../src/app/error.tsx) | 36 | — |
| [src/app/estatisticas/aprendiz_por_parceiro/page.tsx](../src/app/estatisticas/aprendiz_por_parceiro/page.tsx) | 127 | — |
| [src/app/estatisticas/avaliacoes_educadores/page.tsx](../src/app/estatisticas/avaliacoes_educadores/page.tsx) | 130 | — |
| [src/app/estatisticas/avaliacoes_empresa/page.tsx](../src/app/estatisticas/avaliacoes_empresa/page.tsx) | 130 | — |
| [src/app/estatisticas/avaliacoes_realizadas/page.tsx](../src/app/estatisticas/avaliacoes_realizadas/page.tsx) | 130 | — |
| [src/app/estatisticas/geral_aprendiz/page.tsx](../src/app/estatisticas/geral_aprendiz/page.tsx) | 1440 | — |
| [src/app/estatisticas/gestao_avaliacao/page.tsx](../src/app/estatisticas/gestao_avaliacao/page.tsx) | 130 | — |
| [src/app/estatisticas/part_por_situacao/page.tsx](../src/app/estatisticas/part_por_situacao/page.tsx) | 114 | — |
| [src/app/estatisticas/relatorio_log/page.tsx](../src/app/estatisticas/relatorio_log/page.tsx) | 133 | — |
| [src/app/global-error.tsx](../src/app/global-error.tsx) | 35 | — |
| [src/app/home/page.tsx](../src/app/home/page.tsx) | 197 | — |
| [src/app/layout.tsx](../src/app/layout.tsx) | 72 | — |
| [src/app/login/page.tsx](../src/app/login/page.tsx) | 851 | — |
| [src/app/page.tsx](../src/app/page.tsx) | 21 | — |
| [src/app/pedagogico/alunos-turma/page.tsx](../src/app/pedagogico/alunos-turma/page.tsx) | 437 | — |
| [src/app/pedagogico/aprendizes-turma/page.tsx](../src/app/pedagogico/aprendizes-turma/page.tsx) | 330 | — |
| [src/app/pedagogico/areas/page.tsx](../src/app/pedagogico/areas/page.tsx) | 390 | — |
| [src/app/pedagogico/conceitos/page.tsx](../src/app/pedagogico/conceitos/page.tsx) | 305 | — |
| [src/app/pedagogico/cronogramas/page.tsx](../src/app/pedagogico/cronogramas/page.tsx) | 505 | — |
| [src/app/pedagogico/cursos/page.tsx](../src/app/pedagogico/cursos/page.tsx) | 315 | — |
| [src/app/pedagogico/datas-encontros/page.tsx](../src/app/pedagogico/datas-encontros/page.tsx) | 6 | — |
| [src/app/pedagogico/diario/page.tsx](../src/app/pedagogico/diario/page.tsx) | 6 | — |
| [src/app/pedagogico/disciplinas/page.tsx](../src/app/pedagogico/disciplinas/page.tsx) | 290 | — |
| [src/app/pedagogico/faltas-capacitacao/page.tsx](../src/app/pedagogico/faltas-capacitacao/page.tsx) | 508 | — |
| [src/app/pedagogico/faltas-informatica/page.tsx](../src/app/pedagogico/faltas-informatica/page.tsx) | 6 | — |
| [src/app/pedagogico/faltas/page.tsx](../src/app/pedagogico/faltas/page.tsx) | 346 | — |
| [src/app/pedagogico/gerar-cronograma-semanal/page.tsx](../src/app/pedagogico/gerar-cronograma-semanal/page.tsx) | 323 | — |
| [src/app/pedagogico/gerar-cronograma/page.tsx](../src/app/pedagogico/gerar-cronograma/page.tsx) | 413 | — |
| [src/app/pedagogico/lista-jovens/page.tsx](../src/app/pedagogico/lista-jovens/page.tsx) | 221 | — |
| [src/app/pedagogico/modulos/page.tsx](../src/app/pedagogico/modulos/page.tsx) | 308 | — |
| [src/app/pedagogico/monitores/page.tsx](../src/app/pedagogico/monitores/page.tsx) | 545 | — |
| [src/app/pedagogico/page.tsx](../src/app/pedagogico/page.tsx) | 8 | — |
| [src/app/pedagogico/planos/page.tsx](../src/app/pedagogico/planos/page.tsx) | 505 | — |
| [src/app/pedagogico/presenca-capacitacao/page.tsx](../src/app/pedagogico/presenca-capacitacao/page.tsx) | 279 | — |
| [src/app/pedagogico/presenca-data-turma/page.tsx](../src/app/pedagogico/presenca-data-turma/page.tsx) | 2455 | — |
| [src/app/pedagogico/presenca-introdutorio/page.tsx](../src/app/pedagogico/presenca-introdutorio/page.tsx) | 279 | — |
| [src/app/pedagogico/presenca/page.tsx](../src/app/pedagogico/presenca/page.tsx) | 348 | — |
| [src/app/pedagogico/turmas/page.tsx](../src/app/pedagogico/turmas/page.tsx) | 688 | — |
| [src/app/perfil/page.tsx](../src/app/perfil/page.tsx) | 233 | — |
| [src/app/reset-password/page.tsx](../src/app/reset-password/page.tsx) | 128 | — |
| [src/app/vagas/page.tsx](../src/app/vagas/page.tsx) | 220 | — |
| [src/components/LogoutButton/index.tsx](../src/components/LogoutButton/index.tsx) | 24 | — |
| [src/components/PaginaEmDesenvolvimento/index.tsx](../src/components/PaginaEmDesenvolvimento/index.tsx) | 47 | — |
| [src/components/PresencaCapacitacaoPDF.tsx](../src/components/PresencaCapacitacaoPDF.tsx) | 149 | — |
| [src/components/PresencaPDF.tsx](../src/components/PresencaPDF.tsx) | 169 | — |
| [src/components/PrivateLayout/index.tsx](../src/components/PrivateLayout/index.tsx) | 103 | — |
| [src/components/SearchBar/index.tsx](../src/components/SearchBar/index.tsx) | 60 | — |
| [src/components/acessosidebar/index.tsx](../src/components/acessosidebar/index.tsx) | 40 | — |
| [src/components/cadsidebar/index.tsx](../src/components/cadsidebar/index.tsx) | 50 | — |
| [src/components/chamados/ChamadoConversationModal.tsx](../src/components/chamados/ChamadoConversationModal.tsx) | 373 | — |
| [src/components/chamados/ChamadoFormModal.tsx](../src/components/chamados/ChamadoFormModal.tsx) | 256 | — |
| [src/components/chamados/ChamadoNotificationMenu.tsx](../src/components/chamados/ChamadoNotificationMenu.tsx) | 244 | — |
| [src/components/chamados/ChamadoResolveModal.tsx](../src/components/chamados/ChamadoResolveModal.tsx) | 119 | — |
| [src/components/chamados/ChamadoUpdateRoadmapModal.tsx](../src/components/chamados/ChamadoUpdateRoadmapModal.tsx) | 239 | — |
| [src/components/clicard/index.tsx](../src/components/clicard/index.tsx) | 211 | — |
| [src/components/empsidebar/index.tsx](../src/components/empsidebar/index.tsx) | 41 | — |
| [src/components/estatsidebar/index.tsx](../src/components/estatsidebar/index.tsx) | 119 | — |
| [src/components/forms/OcorrenciaTipoForm.tsx](../src/components/forms/OcorrenciaTipoForm.tsx) | 112 | — |
| [src/components/forms/aprendiz/CalendarioForm.tsx](../src/components/forms/aprendiz/CalendarioForm.tsx) | 1152 | — |
| [src/components/forms/aprendiz/CalendarioPreview.tsx](../src/components/forms/aprendiz/CalendarioPreview.tsx) | 355 | — |
| [src/components/forms/aprendiz/DadosPessoaisForm.tsx](../src/components/forms/aprendiz/DadosPessoaisForm.tsx) | 188 | — |
| [src/components/forms/aprendiz/DocumentacaoForm.tsx](../src/components/forms/aprendiz/DocumentacaoForm.tsx) | 159 | — |
| [src/components/forms/aprendiz/EnderecoContatoForm.tsx](../src/components/forms/aprendiz/EnderecoContatoForm.tsx) | 184 | — |
| [src/components/forms/aprendiz/EscolaridadeTurmasForm.tsx](../src/components/forms/aprendiz/EscolaridadeTurmasForm.tsx) | 169 | — |
| [src/components/forms/aprendiz/SaudeDeficienciaForm.tsx](../src/components/forms/aprendiz/SaudeDeficienciaForm.tsx) | 217 | — |
| [src/components/forms/aprendiz/TabAlocacao.tsx](../src/components/forms/aprendiz/TabAlocacao.tsx) | 596 | — |
| [src/components/forms/aprendiz/TabCapacitacao.tsx](../src/components/forms/aprendiz/TabCapacitacao.tsx) | 246 | — |
| [src/components/forms/aprendiz/VinculoContratoForm.tsx](../src/components/forms/aprendiz/VinculoContratoForm.tsx) | 297 | — |
| [src/components/forms/aprendiz/types.ts](../src/components/forms/aprendiz/types.ts) | 124 | — |
| [src/components/header/index.tsx](../src/components/header/index.tsx) | 384 | — |
| [src/components/modal/ConfirmModal.tsx](../src/components/modal/ConfirmModal.tsx) | 78 | — |
| [src/components/modal/index.tsx](../src/components/modal/index.tsx) | 34 | — |
| [src/components/notifications/index.tsx](../src/components/notifications/index.tsx) | 150 | — |
| [src/components/pagination/index.tsx](../src/components/pagination/index.tsx) | 91 | — |
| [src/components/parceiro/AvaliacoesParceiroPage.tsx](../src/components/parceiro/AvaliacoesParceiroPage.tsx) | 14 | — |
| [src/components/parceiro/ParceiroPageShell.tsx](../src/components/parceiro/ParceiroPageShell.tsx) | 11 | — |
| [src/components/parceiro/ParceiroPlaceholder.tsx](../src/components/parceiro/ParceiroPlaceholder.tsx) | 20 | — |
| [src/components/parceirosidebar/index.tsx](../src/components/parceirosidebar/index.tsx) | 123 | — |
| [src/components/pedagogicosidebar/index.tsx](../src/components/pedagogicosidebar/index.tsx) | 166 | — |
| [src/components/perfildropdown/index.tsx](../src/components/perfildropdown/index.tsx) | 161 | — |
| [src/components/searchbox/index.tsx](../src/components/searchbox/index.tsx) | 44 | — |
| [src/components/searchbox/searchbox.tsx](../src/components/searchbox/searchbox.tsx) | 19 | — |
| [src/components/tabelas/AprendizesTable.tsx](../src/components/tabelas/AprendizesTable.tsx) | 246 | — |
| [src/components/tabelas/CrudDataTable.tsx](../src/components/tabelas/CrudDataTable.tsx) | 121 | — |
| [src/components/tabelas/TabelaOcorrenciaTipo.tsx](../src/components/tabelas/TabelaOcorrenciaTipo.tsx) | 96 | — |
| [src/components/tabelas/TableActionButton.tsx](../src/components/tabelas/TableActionButton.tsx) | 31 | — |
| [src/components/tabelas/TableStatusBadge.tsx](../src/components/tabelas/TableStatusBadge.tsx) | 18 | — |
| [src/components/tabelas/tabelaPlanoCurricular.tsx](../src/components/tabelas/tabelaPlanoCurricular.tsx) | 154 | — |
| [src/components/tabelas/tabelaareasatuacao.tsx](../src/components/tabelas/tabelaareasatuacao.tsx) | 123 | — |
| [src/components/tabelas/tabelacadastroregiao/index.tsx](../src/components/tabelas/tabelacadastroregiao/index.tsx) | 46 | — |
| [src/components/tabelas/tabelaconceitos.tsx](../src/components/tabelas/tabelaconceitos.tsx) | 128 | — |
| [src/components/tabelas/tabelacursos.tsx](../src/components/tabelas/tabelacursos.tsx) | 127 | — |
| [src/components/tabelas/tabeladisciplinas.tsx](../src/components/tabelas/tabeladisciplinas.tsx) | 128 | — |
| [src/components/tabelas/tabelaferiados/index.tsx](../src/components/tabelas/tabelaferiados/index.tsx) | 57 | — |
| [src/components/tabelas/tabelagrauescolaridade/index.tsx](../src/components/tabelas/tabelagrauescolaridade/index.tsx) | 46 | — |
| [src/components/tabelas/tabelagrauparentesco/index.tsx](../src/components/tabelas/tabelagrauparentesco/index.tsx) | 46 | — |
| [src/components/tabelas/tabelainstituicoes/index.tsx](../src/components/tabelas/tabelainstituicoes/index.tsx) | 75 | — |
| [src/components/tabelas/tabelainstituicoesparceiras/index.tsx](../src/components/tabelas/tabelainstituicoesparceiras/index.tsx) | 70 | — |
| [src/components/tabelas/tabelamodulos.tsx](../src/components/tabelas/tabelamodulos.tsx) | 116 | — |
| [src/components/tabelas/tabelamotivodesligamento/index.tsx](../src/components/tabelas/tabelamotivodesligamento/index.tsx) | 46 | — |
| [src/components/tabelas/tabelaocorrencias/index.tsx](../src/components/tabelas/tabelaocorrencias/index.tsx) | 52 | — |
| [src/components/tabelas/tabelaorientadores/index.tsx](../src/components/tabelas/tabelaorientadores/index.tsx) | 55 | — |
| [src/components/tabelas/tabelaparceiros/index.tsx](../src/components/tabelas/tabelaparceiros/index.tsx) | 74 | — |
| [src/components/tabelas/tabelaprofissoes/index.tsx](../src/components/tabelas/tabelaprofissoes/index.tsx) | 50 | — |
| [src/components/tabelas/tabelaramosatividade/index.tsx](../src/components/tabelas/tabelaramosatividade/index.tsx) | 55 | — |
| [src/components/tabelas/tabelaregistrogi/index.tsx](../src/components/tabelas/tabelaregistrogi/index.tsx) | 70 | — |
| [src/components/tabelas/tabelasituacoes/index.tsx](../src/components/tabelas/tabelasituacoes/index.tsx) | 54 | — |
| [src/components/tabelas/tabelastatusencaminhamento/index.tsx](../src/components/tabelas/tabelastatusencaminhamento/index.tsx) | 46 | — |
| [src/components/tabelas/tabelaturmas.tsx](../src/components/tabelas/tabelaturmas.tsx) | 145 | — |
| [src/components/tabelas/tabelaunidadeparceiro/index.tsx](../src/components/tabelas/tabelaunidadeparceiro/index.tsx) | 62 | — |
| [src/components/tabelas/tabelaunidades/index.tsx](../src/components/tabelas/tabelaunidades/index.tsx) | 53 | — |
| [src/components/tabelas/tabelausuarios/index.tsx](../src/components/tabelas/tabelausuarios/index.tsx) | 49 | — |
| [src/components/tagstatus/index.tsx](../src/components/tagstatus/index.tsx) | 17 | — |
| [src/components/userdropdown/index.tsx](../src/components/userdropdown/index.tsx) | 26 | — |
| [src/components/vagas/VagaForm.tsx](../src/components/vagas/VagaForm.tsx) | 590 | — |
| [src/components/vagas/VagaList.tsx](../src/components/vagas/VagaList.tsx) | 217 | — |
| [src/hooks/useCep.ts](../src/hooks/useCep.ts) | 34 | — |
| [src/hooks/useChamadoNotifications.ts](../src/hooks/useChamadoNotifications.ts) | 215 | — |
| [src/hooks/useCrud.ts](../src/hooks/useCrud.ts) | 132 | — |
| [src/lib/schemas/forms.ts](../src/lib/schemas/forms.ts) | 32 | — |
| [src/lib/schemas/index.ts](../src/lib/schemas/index.ts) | 132 | — |
| [src/middleware.ts](../src/middleware.ts) | 273 | — |
| [src/services/api.ts](../src/services/api.ts) | 33 | — |
| [src/services/caAprendizService.ts](../src/services/caAprendizService.ts) | 43 | — |
| [src/services/cepService.ts](../src/services/cepService.ts) | 29 | — |
| [src/services/chamadoResponse.ts](../src/services/chamadoResponse.ts) | 47 | — |
| [src/services/chamadoService.ts](../src/services/chamadoService.ts) | 181 | — |
| [src/services/ocorrenciaTipoService.ts](../src/services/ocorrenciaTipoService.ts) | 43 | — |
| [src/types/api.ts](../src/types/api.ts) | 4 | — |
| [src/types/index.ts](../src/types/index.ts) | 213 | — |
| [src/utils/apiError.ts](../src/utils/apiError.ts) | 17 | — |
| [src/utils/apiResponse.ts](../src/utils/apiResponse.ts) | 41 | — |
| [src/utils/calendarioAprendizagem.test.ts](../src/utils/calendarioAprendizagem.test.ts) | 77 | — |
| [src/utils/calendarioAprendizagem.ts](../src/utils/calendarioAprendizagem.ts) | 458 | — |
| [src/utils/chamadoNotificationSounds.ts](../src/utils/chamadoNotificationSounds.ts) | 139 | — |
| [src/utils/downloadElementAsPdf.ts](../src/utils/downloadElementAsPdf.ts) | 60 | — |
| [src/utils/roles.ts](../src/utils/roles.ts) | 90 | — |

## API e regras de negócio (136 arquivos)

| Arquivo | Linhas | Rotas declaradas |
|---|---:|---|
| [apps/api/src/@types/fastify-jwt.d.ts](../apps/api/src/@types/fastify-jwt.d.ts) | 19 | — |
| [apps/api/src/lib/authorization.ts](../apps/api/src/lib/authorization.ts) | 85 | — |
| [apps/api/src/lib/baseService.ts](../apps/api/src/lib/baseService.ts) | 96 | — |
| [apps/api/src/lib/logger.ts](../apps/api/src/lib/logger.ts) | 141 | — |
| [apps/api/src/lib/nextId.ts](../apps/api/src/lib/nextId.ts) | 60 | — |
| [apps/api/src/lib/prisma.ts](../apps/api/src/lib/prisma.ts) | 44 | — |
| [apps/api/src/lib/sessionClaims.ts](../apps/api/src/lib/sessionClaims.ts) | 25 | — |
| [apps/api/src/routes/CA_Aprendiz.routes.ts](../apps/api/src/routes/CA_Aprendiz.routes.ts) | 212 | GET /ca-aprendiz; GET /ca-aprendiz/stats; GET /ca-aprendiz/:id; POST /ca-aprendiz; PUT /ca-aprendiz/:id; DELETE /ca-aprendiz/:id |
| [apps/api/src/routes/CA_Capacitacao.routes.ts](../apps/api/src/routes/CA_Capacitacao.routes.ts) | 87 | GET /ca-aprendiz/:id/capacitacoes; POST /ca-aprendiz/:id/capacitacoes; PUT /ca-aprendiz/capacitacoes/:seq; DELETE /ca-aprendiz/capacitacoes/:seq |
| [apps/api/src/routes/alocacao.routes.ts](../apps/api/src/routes/alocacao.routes.ts) | 141 | GET /alocacoes/filtros-ativos; GET /alocacoes/aprendizes-por-turma/:turmaId; GET /alocacoes/alunos-por-turma/:turmaId; GET /ca-aprendiz/:id/alocacoes; POST /ca-aprendiz/:id/alocacoes; PUT /ca-aprendiz/alocacoes/:ordem; DELETE /ca-aprendiz/alocacoes/:ordem |
| [apps/api/src/routes/aprendiz.routes.ts](../apps/api/src/routes/aprendiz.routes.ts) | 183 | POST /aprendiz; GET /aprendiz; GET /aprendiz/stats; GET /aprendiz/:id; PUT /aprendiz/:id; DELETE /aprendiz/:id |
| [apps/api/src/routes/areaAtuacao.routes.ts](../apps/api/src/routes/areaAtuacao.routes.ts) | 130 | POST /areas; GET /areas; PUT /areas/:id; DELETE /areas/:id |
| [apps/api/src/routes/attendance.routes.ts](../apps/api/src/routes/attendance.routes.ts) | 236 | GET /attendance/turmas/:id/disciplines; GET /attendance/turmas/:id/disciplines/:disciplineId/dates; GET /attendance/turmas/:id/disciplines/:disciplineId/students; GET /attendance/turmas/:id/dates; GET /attendance/turmas/:id/students; GET /attendance/turmas/:id/presenca-list; GET /attendance/disciplinas; GET /attendance/capacitacao/turmas; GET /attendance/capacitacao/presenca-list; POST /attendance/faltas; POST /attendance |
| [apps/api/src/routes/auth.routes.ts](../apps/api/src/routes/auth.routes.ts) | 850 | POST /login; POST /logout; POST /primeiro-acesso; POST /forgot-password; POST /reset-password; GET /debug/user-tipo |
| [apps/api/src/routes/cadastroRamoAtividade.routes.ts](../apps/api/src/routes/cadastroRamoAtividade.routes.ts) | 130 | POST /ramos-atividade; GET /ramos-atividade; PUT /ramos-atividade/:id; DELETE /ramos-atividade/:id |
| [apps/api/src/routes/cadastroRegiao.routes.ts](../apps/api/src/routes/cadastroRegiao.routes.ts) | 124 | POST /regiao; GET /regiao; PUT /regiao/:id; DELETE /regiao/:id |
| [apps/api/src/routes/chamado.routes.ts](../apps/api/src/routes/chamado.routes.ts) | 271 | GET /chamados; POST /chamados; GET /chamados/notificacoes; GET /chamados/:id/conversa; POST /chamados/:id/mensagens; POST /chamados/:id/confirmar-solucao; PATCH /chamados/:id; PATCH /chamados/:id/urgencia; POST /chamados/:id/resolver |
| [apps/api/src/routes/conceito.routes.ts](../apps/api/src/routes/conceito.routes.ts) | 128 | POST /conceitos; GET /conceitos; PUT /conceitos/:id; DELETE /conceitos/:id |
| [apps/api/src/routes/cronograma.routes.ts](../apps/api/src/routes/cronograma.routes.ts) | 38 | GET /cronogramas/turma |
| [apps/api/src/routes/curso.routes.ts](../apps/api/src/routes/curso.routes.ts) | 124 | POST /cursos; GET /cursos; PUT /cursos/:id; DELETE /cursos/:id |
| [apps/api/src/routes/disciplina.routes.ts](../apps/api/src/routes/disciplina.routes.ts) | 128 | POST /disciplinas; GET /disciplinas; PUT /disciplinas/:id; DELETE /disciplinas/:id |
| [apps/api/src/routes/educador.routes.ts](../apps/api/src/routes/educador.routes.ts) | 174 | POST /educadores; GET /educadores; GET /educadores/:id; PUT /educadores/:id; DELETE /educadores/:id |
| [apps/api/src/routes/empresaAprendiz.routes.ts](../apps/api/src/routes/empresaAprendiz.routes.ts) | 212 | GET /empresa/vagas; GET /empresa/vagas/areas; POST /empresa/vagas; GET /empresa/avaliacoes; GET /empresa/contagem-faltas; GET /empresa/controle-presenca/total-periodo; GET /empresa/controle-presenca/por-periodo; GET /empresa/aprendizes-alocados; GET /empresa/aprendizes-alocados/:aprendizId/detalhes; GET /empresa/aprendizes-alocados/:aprendizId/calendario |
| [apps/api/src/routes/escola.routes.ts](../apps/api/src/routes/escola.routes.ts) | 17 | GET /escolas |
| [apps/api/src/routes/estatistica_aprendiz_por_parceiro.routes.ts](../apps/api/src/routes/estatistica_aprendiz_por_parceiro.routes.ts) | 21 | GET /estatisticaaprendiz/porparceiro |
| [apps/api/src/routes/estatistica_gestao_avaliacoes.routes.ts](../apps/api/src/routes/estatistica_gestao_avaliacoes.routes.ts) | 105 | GET /estatisticagestaoavaliacoes; GET /estatisticaavaliacoespendentes; GET /estatisticaavaliacoesrealizadas; GET /estatisticaavaliacoesdisponiveisparceiro; GET /estatisticaavaliacoesdisponiveiseducador; GET /estatisticalogtransacoes |
| [apps/api/src/routes/faltasCapacitacao.routes.ts](../apps/api/src/routes/faltasCapacitacao.routes.ts) | 105 | GET /faltas-capacitacao/datas; GET /faltas-capacitacao/aprendizes; GET /faltas-capacitacao/presencas; POST /faltas-capacitacao/presencas; GET /faltas-capacitacao/turma-info/:id; POST /faltas-capacitacao/lancar-aula |
| [apps/api/src/routes/feriado.routes.ts](../apps/api/src/routes/feriado.routes.ts) | 131 | POST /feriado; GET /feriado; PUT /feriado/:unidade/:data; DELETE /feriado/:unidade/:data |
| [apps/api/src/routes/funcaoSistema.routes.ts](../apps/api/src/routes/funcaoSistema.routes.ts) | 83 | GET /funcoes-sistema; POST /funcoes-sistema; PUT /funcoes-sistema/:id; DELETE /funcoes-sistema/:id |
| [apps/api/src/routes/geracaoCronograma.routes.ts](../apps/api/src/routes/geracaoCronograma.routes.ts) | 105 | POST /geracao-cronogramas; GET /geracao-cronogramas; PUT /geracao-cronogramas/:id/educador |
| [apps/api/src/routes/geracaoCronogramaSemestre.routes.ts](../apps/api/src/routes/geracaoCronogramaSemestre.routes.ts) | 70 | GET /geracao-cronogramas-semestre; POST /geracao-cronogramas-semestre |
| [apps/api/src/routes/grauEscolaridade.routes.ts](../apps/api/src/routes/grauEscolaridade.routes.ts) | 130 | POST /grau-escolaridade; GET /grau-escolaridade; PUT /grau-escolaridade/:id; DELETE /grau-escolaridade/:id |
| [apps/api/src/routes/grauParentesco.routes.ts](../apps/api/src/routes/grauParentesco.routes.ts) | 135 | POST /grau-parentesco; GET /grau-parentesco; PUT /grau-parentesco/:id; DELETE /grau-parentesco/:id |
| [apps/api/src/routes/instituicao.routes.ts](../apps/api/src/routes/instituicao.routes.ts) | 158 | POST /instituicao; GET /instituicao; PUT /instituicao/:id; DELETE /instituicao/:id |
| [apps/api/src/routes/instituicoesParceiras.routes.ts](../apps/api/src/routes/instituicoesParceiras.routes.ts) | 129 | POST /instituicoes-parceiras; GET /instituicoes-parceiras; PUT /instituicoes-parceiras/:id; DELETE /instituicoes-parceiras/:id |
| [apps/api/src/routes/motivoDesligamento.routes.ts](../apps/api/src/routes/motivoDesligamento.routes.ts) | 130 | POST /motivo-desligamento; GET /motivo-desligamento; PUT /motivo-desligamento/:id; DELETE /motivo-desligamento/:id |
| [apps/api/src/routes/municipio.routes.ts](../apps/api/src/routes/municipio.routes.ts) | 19 | GET /municipios |
| [apps/api/src/routes/occurrenceType.routes.ts](../apps/api/src/routes/occurrenceType.routes.ts) | 129 | POST /tipo-ocorrencia; GET /tipo-ocorrencia; PUT /tipo-ocorrencia/:id; DELETE /tipo-ocorrencia/:id |
| [apps/api/src/routes/ocorrencias.routes.ts](../apps/api/src/routes/ocorrencias.routes.ts) | 131 | POST /ocorrencia; GET /ocorrencia; PUT /ocorrencia/:id; DELETE /ocorrencia/:id |
| [apps/api/src/routes/orientador.routes.ts](../apps/api/src/routes/orientador.routes.ts) | 137 | POST /orientadores; GET /orientadores; PUT /orientadores/:id; DELETE /orientadores/:id |
| [apps/api/src/routes/parceiro.routes.ts](../apps/api/src/routes/parceiro.routes.ts) | 173 | POST /parceiros; GET /parceiros; GET /parceiros/:id; PUT /parceiros/:id; DELETE /parceiros/:id |
| [apps/api/src/routes/participantessituacao.routes.ts](../apps/api/src/routes/participantessituacao.routes.ts) | 153 | GET /participantessituacao/carga_horaria_final; GET /participantessituacao/ativos_por_turma; GET /participantessituacao/ativos_por_area_atuacao; GET /participantessituacao/ativos_por_cidade; GET /participantessituacao/desligados_por_periodo; GET /participantessituacao/desligados_por_motivo; GET /participantessituacao/alocacao_no_periodo; GET /participantessituacao/ativos_por_unidade; GET /participantessituacao/tipo_pagamento; GET /participantessituacao/conheceu_projov |
| [apps/api/src/routes/plano.routes.ts](../apps/api/src/routes/plano.routes.ts) | 74 | GET /planos; GET /planos/:id; POST /planos; PUT /planos/:id; DELETE /planos/:id |
| [apps/api/src/routes/planoCurricular.routes.ts](../apps/api/src/routes/planoCurricular.routes.ts) | 103 | GET /plano-curricular; POST /plano-curricular; PUT /plano-curricular/:codigoPlano/:disciplina; DELETE /plano-curricular/:codigoPlano/:disciplina |
| [apps/api/src/routes/presenca.routes.ts](../apps/api/src/routes/presenca.routes.ts) | 370 | GET /presenca/estatisticas-jovem/filtros; GET /presenca/estatisticas-jovem; GET /presenca/data; GET /presenca/turma-periodo; GET /presenca/turma-periodo-matriz; GET /presenca/total-aulas-turma; GET /presenca/total-aulas-turma-capacitacao; GET /presenca/conteudos; GET /presenca/parceiro-periodo; GET /presenca/total-aulas-parceiro; GET /presenca/faltas-parceiro; GET /presenca/contagem-faltas; GET /presenca/aulas-dadas; GET /presenca/aprendizes-faltas |
| [apps/api/src/routes/profissao.routes.ts](../apps/api/src/routes/profissao.routes.ts) | 138 | POST /profissao; GET /profissao; PUT /profissao/:id; DELETE /profissao/:id |
| [apps/api/src/routes/rascunho.routes.ts](../apps/api/src/routes/rascunho.routes.ts) | 35 | GET /aprendiz/rascunho; PUT /aprendiz/rascunho; DELETE /aprendiz/rascunho |
| [apps/api/src/routes/registroGI.routes.ts](../apps/api/src/routes/registroGI.routes.ts) | 152 | POST /registro-gi; GET /registro-gi; GET /registro-gi/:id; PUT /registro-gi/:id; DELETE /registro-gi/:id |
| [apps/api/src/routes/relatorio.routes.ts](../apps/api/src/routes/relatorio.routes.ts) | 30 | GET /relatorio/carga_horaria_final |
| [apps/api/src/routes/situacaoParticipante.routes.ts](../apps/api/src/routes/situacaoParticipante.routes.ts) | 138 | POST /situacao-participante; GET /situacao-participante; PUT /situacao-participante/:id; DELETE /situacao-participante/:id |
| [apps/api/src/routes/statusEncaminhamento.routes.ts](../apps/api/src/routes/statusEncaminhamento.routes.ts) | 125 | POST /status-encaminhamento; GET /status-encaminhamento; PUT /status-encaminhamento/:id; DELETE /status-encaminhamento/:id |
| [apps/api/src/routes/turma.routes.ts](../apps/api/src/routes/turma.routes.ts) | 124 | POST /turmas; GET /turmas; PUT /turmas/:id; DELETE /turmas/:id |
| [apps/api/src/routes/unidadeParceiro.routes.ts](../apps/api/src/routes/unidadeParceiro.routes.ts) | 155 | POST /unidades-parceiro; GET /unidades-parceiro; GET /unidades-parceiro/:codigo/:parceiro; PUT /unidades-parceiro/:codigo/:parceiro; DELETE /unidades-parceiro/:codigo/:parceiro |
| [apps/api/src/routes/unity.routes.ts](../apps/api/src/routes/unity.routes.ts) | 154 | POST /unidade; GET /unidade; PUT /unidade/:id; DELETE /unidade/:id |
| [apps/api/src/routes/user.routes.ts](../apps/api/src/routes/user.routes.ts) | 220 | POST /users; GET /users; GET /users/me; PUT /users/:id; DELETE /users/:id |
| [apps/api/src/routes/vaga.routes.ts](../apps/api/src/routes/vaga.routes.ts) | 140 | POST /vagas; GET /vagas; GET /vagas/:id; PUT /vagas/:id; DELETE /vagas/:id |
| [apps/api/src/schemas/CA_AprendizSchema.ts](../apps/api/src/schemas/CA_AprendizSchema.ts) | 276 | — |
| [apps/api/src/schemas/aprendizSchema.ts](../apps/api/src/schemas/aprendizSchema.ts) | 127 | — |
| [apps/api/src/schemas/areaAtuacaoSchema.ts](../apps/api/src/schemas/areaAtuacaoSchema.ts) | 55 | — |
| [apps/api/src/schemas/cadastroRamoAtividadeSchema.ts](../apps/api/src/schemas/cadastroRamoAtividadeSchema.ts) | 57 | — |
| [apps/api/src/schemas/cadastroRegiaoSchema.ts](../apps/api/src/schemas/cadastroRegiaoSchema.ts) | 45 | — |
| [apps/api/src/schemas/chamadoSchema.ts](../apps/api/src/schemas/chamadoSchema.ts) | 71 | — |
| [apps/api/src/schemas/conceitoSchema.ts](../apps/api/src/schemas/conceitoSchema.ts) | 41 | — |
| [apps/api/src/schemas/cursoSchema.ts](../apps/api/src/schemas/cursoSchema.ts) | 46 | — |
| [apps/api/src/schemas/disciplinaSchema.ts](../apps/api/src/schemas/disciplinaSchema.ts) | 45 | — |
| [apps/api/src/schemas/educadorSchema.ts](../apps/api/src/schemas/educadorSchema.ts) | 54 | — |
| [apps/api/src/schemas/feriadoSchema.ts](../apps/api/src/schemas/feriadoSchema.ts) | 47 | — |
| [apps/api/src/schemas/funcaoSistemaSchema.ts](../apps/api/src/schemas/funcaoSistemaSchema.ts) | 31 | — |
| [apps/api/src/schemas/grauEscolaridadeSchema.ts](../apps/api/src/schemas/grauEscolaridadeSchema.ts) | 50 | — |
| [apps/api/src/schemas/grauParentescoSchema.ts](../apps/api/src/schemas/grauParentescoSchema.ts) | 50 | — |
| [apps/api/src/schemas/instituicaoSchema.ts](../apps/api/src/schemas/instituicaoSchema.ts) | 63 | — |
| [apps/api/src/schemas/instituicoesParceirasSchema.ts](../apps/api/src/schemas/instituicoesParceirasSchema.ts) | 70 | — |
| [apps/api/src/schemas/motivoDesligamentoSchema.ts](../apps/api/src/schemas/motivoDesligamentoSchema.ts) | 45 | — |
| [apps/api/src/schemas/occurrenceTypeSchema.ts](../apps/api/src/schemas/occurrenceTypeSchema.ts) | 50 | — |
| [apps/api/src/schemas/ocorrenciasSchema.ts](../apps/api/src/schemas/ocorrenciasSchema.ts) | 41 | — |
| [apps/api/src/schemas/orientadorSchema.ts](../apps/api/src/schemas/orientadorSchema.ts) | 47 | — |
| [apps/api/src/schemas/parceiroSchema.ts](../apps/api/src/schemas/parceiroSchema.ts) | 68 | — |
| [apps/api/src/schemas/participantesSituacaoSchema.ts](../apps/api/src/schemas/participantesSituacaoSchema.ts) | 24 | — |
| [apps/api/src/schemas/profissaoSchema.ts](../apps/api/src/schemas/profissaoSchema.ts) | 37 | — |
| [apps/api/src/schemas/registroGISchema.ts](../apps/api/src/schemas/registroGISchema.ts) | 110 | — |
| [apps/api/src/schemas/situacaoParticipanteSchema.ts](../apps/api/src/schemas/situacaoParticipanteSchema.ts) | 50 | — |
| [apps/api/src/schemas/statusEncaminhamentoSchema.ts](../apps/api/src/schemas/statusEncaminhamentoSchema.ts) | 49 | — |
| [apps/api/src/schemas/turmaSchema.ts](../apps/api/src/schemas/turmaSchema.ts) | 62 | — |
| [apps/api/src/schemas/unidadeParceiroSchema.ts](../apps/api/src/schemas/unidadeParceiroSchema.ts) | 62 | — |
| [apps/api/src/schemas/unitySchema.ts](../apps/api/src/schemas/unitySchema.ts) | 72 | — |
| [apps/api/src/schemas/update.ts](../apps/api/src/schemas/update.ts) | 2 | — |
| [apps/api/src/schemas/userSchema.ts](../apps/api/src/schemas/userSchema.ts) | 72 | — |
| [apps/api/src/schemas/vagaSchema.ts](../apps/api/src/schemas/vagaSchema.ts) | 65 | — |
| [apps/api/src/server.ts](../apps/api/src/server.ts) | 598 | GET /; GET /health |
| [apps/api/src/services/AprendizService.ts](../apps/api/src/services/AprendizService.ts) | 86 | — |
| [apps/api/src/services/AreaAtuacaoService.ts](../apps/api/src/services/AreaAtuacaoService.ts) | 91 | — |
| [apps/api/src/services/AttendanceService.ts](../apps/api/src/services/AttendanceService.ts) | 523 | — |
| [apps/api/src/services/CA_AlocacaoService.ts](../apps/api/src/services/CA_AlocacaoService.ts) | 299 | — |
| [apps/api/src/services/CA_AprendizService.ts](../apps/api/src/services/CA_AprendizService.ts) | 368 | — |
| [apps/api/src/services/CA_CapacitacaoService.ts](../apps/api/src/services/CA_CapacitacaoService.ts) | 89 | — |
| [apps/api/src/services/CA_FaltasCapacitacaoService.ts](../apps/api/src/services/CA_FaltasCapacitacaoService.ts) | 131 | — |
| [apps/api/src/services/CadastroRamoAtividadeService.ts](../apps/api/src/services/CadastroRamoAtividadeService.ts) | 97 | — |
| [apps/api/src/services/CadastroRegiaoService.ts](../apps/api/src/services/CadastroRegiaoService.ts) | 77 | — |
| [apps/api/src/services/ChamadoService.ts](../apps/api/src/services/ChamadoService.ts) | 551 | — |
| [apps/api/src/services/ConceitoService.ts](../apps/api/src/services/ConceitoService.ts) | 81 | — |
| [apps/api/src/services/CronogramaService.ts](../apps/api/src/services/CronogramaService.ts) | 150 | — |
| [apps/api/src/services/CursoService.ts](../apps/api/src/services/CursoService.ts) | 86 | — |
| [apps/api/src/services/DisciplinaService.ts](../apps/api/src/services/DisciplinaService.ts) | 83 | — |
| [apps/api/src/services/EducadorService.ts](../apps/api/src/services/EducadorService.ts) | 110 | — |
| [apps/api/src/services/EmpresaAprendizService.ts](../apps/api/src/services/EmpresaAprendizService.ts) | 256 | — |
| [apps/api/src/services/EmpresaPortalService.ts](../apps/api/src/services/EmpresaPortalService.ts) | 129 | — |
| [apps/api/src/services/Estatistica_Gestao_Avaliacoes_Service.ts](../apps/api/src/services/Estatistica_Gestao_Avaliacoes_Service.ts) | 338 | — |
| [apps/api/src/services/FeriadoService.ts](../apps/api/src/services/FeriadoService.ts) | 120 | — |
| [apps/api/src/services/FuncaoSistemaService.ts](../apps/api/src/services/FuncaoSistemaService.ts) | 75 | — |
| [apps/api/src/services/GeracaoCronogramaSemestreService.ts](../apps/api/src/services/GeracaoCronogramaSemestreService.ts) | 194 | — |
| [apps/api/src/services/GeracaoCronogramaService.ts](../apps/api/src/services/GeracaoCronogramaService.ts) | 330 | — |
| [apps/api/src/services/GrauEscolaridadeService.ts](../apps/api/src/services/GrauEscolaridadeService.ts) | 78 | — |
| [apps/api/src/services/GrauParentescoService.ts](../apps/api/src/services/GrauParentescoService.ts) | 22 | — |
| [apps/api/src/services/InstituicaoService.ts](../apps/api/src/services/InstituicaoService.ts) | 113 | — |
| [apps/api/src/services/InstituicoesParceirasService.ts](../apps/api/src/services/InstituicoesParceirasService.ts) | 141 | — |
| [apps/api/src/services/MotivoDesligamentoService.ts](../apps/api/src/services/MotivoDesligamentoService.ts) | 78 | — |
| [apps/api/src/services/OccurrenceTypeService.ts](../apps/api/src/services/OccurrenceTypeService.ts) | 80 | — |
| [apps/api/src/services/OcorrenciasService.ts](../apps/api/src/services/OcorrenciasService.ts) | 85 | — |
| [apps/api/src/services/OrientadorService.ts](../apps/api/src/services/OrientadorService.ts) | 116 | — |
| [apps/api/src/services/ParceiroService.ts](../apps/api/src/services/ParceiroService.ts) | 205 | — |
| [apps/api/src/services/ParticipanteSituacaoService.ts](../apps/api/src/services/ParticipanteSituacaoService.ts) | 281 | — |
| [apps/api/src/services/PlanoCurricularService.ts](../apps/api/src/services/PlanoCurricularService.ts) | 144 | — |
| [apps/api/src/services/PlanoService.ts](../apps/api/src/services/PlanoService.ts) | 82 | — |
| [apps/api/src/services/PresencaService.ts](../apps/api/src/services/PresencaService.ts) | 1926 | — |
| [apps/api/src/services/ProfissaoService.ts](../apps/api/src/services/ProfissaoService.ts) | 78 | — |
| [apps/api/src/services/RegistroGIService.ts](../apps/api/src/services/RegistroGIService.ts) | 176 | — |
| [apps/api/src/services/RelatorioService.ts](../apps/api/src/services/RelatorioService.ts) | 97 | — |
| [apps/api/src/services/SituacaoParticipanteService.ts](../apps/api/src/services/SituacaoParticipanteService.ts) | 87 | — |
| [apps/api/src/services/StatusEncaminhamentoService.ts](../apps/api/src/services/StatusEncaminhamentoService.ts) | 81 | — |
| [apps/api/src/services/TurmaService.ts](../apps/api/src/services/TurmaService.ts) | 102 | — |
| [apps/api/src/services/UnidadeParceiroService.ts](../apps/api/src/services/UnidadeParceiroService.ts) | 187 | — |
| [apps/api/src/services/UnityService.ts](../apps/api/src/services/UnityService.ts) | 103 | — |
| [apps/api/src/services/UserService.ts](../apps/api/src/services/UserService.ts) | 88 | — |
| [apps/api/src/services/VagaService.ts](../apps/api/src/services/VagaService.ts) | 153 | — |
| [apps/api/src/services/estatistica_aprendiz_por_parceiro_Service.ts](../apps/api/src/services/estatistica_aprendiz_por_parceiro_Service.ts) | 39 | — |
| [apps/api/src/services/mail.ts](../apps/api/src/services/mail.ts) | 115 | — |

## Inicialização e verificações (4 arquivos)

| Arquivo | Linhas | Rotas declaradas |
|---|---:|---|
| [scripts/check-development.mjs](../scripts/check-development.mjs) | 33 | — |
| [scripts/generate-code-map.mjs](../scripts/generate-code-map.mjs) | 32 | — |
| [scripts/run-api-production.mjs](../scripts/run-api-production.mjs) | 5 | — |
| [scripts/start-production.mjs](../scripts/start-production.mjs) | 108 | — |

## Testes (1 arquivos)

| Arquivo | Linhas | Rotas declaradas |
|---|---:|---|
| [tests/response-validation.test.ts](../tests/response-validation.test.ts) | 79 | — |

## Documentos complementares

- [Contexto atual](CONTEXTO_PROSIS.md)
- [Refatoração verificada](plano-refatoracao.md)
- [Segurança e pendências](auditoria-seguranca.md)
- [Deploy Hostinger](hostinger-deploy.md)
- [Alterações e validação desta revisão](REVISAO_2026-09-25.md)

export type PermissionAction = "view" | "edit";

export type PermissionCatalogItem = {
  key: string;
  section: string;
  group: string;
  label: string;
  routePattern: string | null;
  editable: boolean;
  order: number;
};

const item = (
  key: string,
  section: string,
  group: string,
  label: string,
  routePattern: string | null,
  order: number,
  editable = true,
): PermissionCatalogItem => ({ key, section, group, label, routePattern, editable, order });

export const PERMISSION_CATALOG: PermissionCatalogItem[] = [
  item("home", "Principal", "Principal", "Home", "/home", 10, false),
  item("aprendizes", "Aprendizes", "Aprendizes", "Aprendizes", "/aprendizes", 20),
  item("cadastros.usuarios", "Cadastros", "Pessoas e instituições", "Usuários", "/cadastros/usuarios", 30),
  item("cadastros.unidades", "Cadastros", "Pessoas e instituições", "Unidades", "/cadastros/unidades", 40),
  item("cadastros.instituicoes", "Cadastros", "Pessoas e instituições", "Instituições de Ensino", "/cadastros/instituicoes", 50),
  item("cadastros.instituicoes-parceiras", "Cadastros", "Pessoas e instituições", "Instituições Parceiras", "/cadastros/instituicoes-parceiras", 60),
  item("cadastros.situacoes-participante", "Cadastros", "Acompanhamento", "Situações do Participante", "/cadastros/situacoes-participante", 70),
  item("cadastros.ocorrencias", "Cadastros", "Acompanhamento", "Ocorrências", "/cadastros/ocorrencias", 80),
  item("cadastros.motivos-desligamento", "Cadastros", "Acompanhamento", "Motivos de Desligamento", "/cadastros/motivos-desligamento", 90),
  item("cadastros.status-encaminhamento", "Cadastros", "Acompanhamento", "Status Encaminhamento", "/cadastros/status-encaminhamento", 100),
  item("cadastros.profissoes", "Cadastros", "Dados de referência", "Profissões", "/cadastros/profissoes", 110),
  item("cadastros.grau-parentesco", "Cadastros", "Dados de referência", "Graus de Parentesco", "/cadastros/grau-parentesco", 120),
  item("cadastros.graus-escolaridade", "Cadastros", "Dados de referência", "Graus de Escolaridade", "/cadastros/graus-escolaridade", 130),
  item("cadastros.feriados", "Cadastros", "Dados de referência", "Feriados", "/cadastros/feriados", 140),
  item("cadastros.regioes", "Cadastros", "Dados de referência", "Regiões", "/cadastros/regioes", 150),
  item("pedagogico.cursos", "Pedagógico", "Cadastros pedagógicos", "Cadastro de Cursos", "/pedagogico/cursos", 160),
  item("pedagogico.disciplinas", "Pedagógico", "Cadastros pedagógicos", "Cadastro de Disciplinas", "/pedagogico/disciplinas", 170),
  item("pedagogico.turmas", "Pedagógico", "Cadastros pedagógicos", "Cadastro de Turmas", "/pedagogico/turmas", 180),
  item("pedagogico.conceitos", "Pedagógico", "Cadastros pedagógicos", "Cadastro de Conceitos", "/pedagogico/conceitos", 190),
  item("pedagogico.areas", "Pedagógico", "Cadastros pedagógicos", "Áreas de Atuação", "/pedagogico/areas", 200),
  item("pedagogico.monitores", "Pedagógico", "Formação e turmas", "Lista de Monitores e Funcionários", "/pedagogico/monitores", 210),
  item("pedagogico.modulos", "Pedagógico", "Formação e turmas", "Módulos de Aprendizagem", "/pedagogico/modulos", 220),
  item("pedagogico.planos", "Pedagógico", "Formação e turmas", "Planos Curriculares", "/pedagogico/planos", 230),
  item("pedagogico.aprendizes-turma", "Pedagógico", "Formação e turmas", "Aprendizes por Turma", "/pedagogico/aprendizes-turma", 240),
  item("pedagogico.alunos-turma", "Pedagógico", "Formação e turmas", "Alunos por Turma", "/pedagogico/alunos-turma", 250),
  item("pedagogico.lista-jovens", "Pedagógico", "Planejamento", "Lista Carga Horária Final", "/pedagogico/lista-jovens", 260),
  item("pedagogico.cronogramas", "Pedagógico", "Planejamento", "Cronogramas", "/pedagogico/cronogramas", 270),
  item("pedagogico.gerar-cronograma", "Pedagógico", "Planejamento", "Geração de Cronograma", "/pedagogico/gerar-cronograma", 280),
  item("pedagogico.gerar-cronograma-semanal", "Pedagógico", "Planejamento", "Cronograma Turma e Semestre", "/pedagogico/gerar-cronograma-semanal", 290),
  item("pedagogico.presenca", "Pedagógico", "Presença e faltas", "Lista de Presença", "/pedagogico/presenca", 300),
  item("pedagogico.presenca-capacitacao", "Pedagógico", "Presença e faltas", "Presença Capacitação", "/pedagogico/presenca-capacitacao", 310),
  item("pedagogico.presenca-introdutorio", "Pedagógico", "Presença e faltas", "Presença Introdutório", "/pedagogico/presenca-introdutorio", 320),
  item("pedagogico.faltas", "Pedagógico", "Presença e faltas", "Lançar Faltas", "/pedagogico/faltas", 330),
  item("pedagogico.faltas-capacitacao", "Pedagógico", "Presença e faltas", "Faltas Capacitação", "/pedagogico/faltas-capacitacao", 340),
  item("pedagogico.faltas-informatica", "Pedagógico", "Presença e faltas", "Faltas Informática", "/pedagogico/faltas-informatica", 350),
  item("pedagogico.presenca-data-turma", "Pedagógico", "Presença e faltas", "Controle de Presença", "/pedagogico/presenca-data-turma", 360),
  item("empresas.empresas", "Empresas", "Empresas e parceiros", "Empresas", "/empresa/cadempresas", 370),
  item("empresas.unidades-parceiro", "Empresas", "Empresas e parceiros", "Unidades de Parceiro", "/empresa/cadunidadeparceiro", 380),
  item("empresas.orientadores", "Empresas", "Empresas e parceiros", "Orientadores", "/empresa/cadoriantadores", 390),
  item("empresas.ramos-atividade", "Empresas", "Gestão empresarial", "Ramos de Atividade", "/empresa/cadramosatividade", 400),
  item("empresas.registro-gi", "Empresas", "Gestão empresarial", "Registro GI", "/empresa/cadregistrogi", 410),
  item("vagas", "Vagas", "Vagas", "Vagas", "/vagas", 420),
  item("estatisticas.participantes-situacao", "Estatísticas", "Indicadores do programa", "Participantes por Situação", "/estatisticas/part_por_situacao", 430, false),
  item("estatisticas.geral-aprendiz", "Estatísticas", "Indicadores do programa", "Estatística Geral Aprendizes", "/estatisticas/geral_aprendiz", 440, false),
  item("estatisticas.aprendiz-parceiro", "Estatísticas", "Indicadores do programa", "Aprendizes por Parceiro", "/estatisticas/aprendiz_por_parceiro", 450, false),
  item("estatisticas.gestao-avaliacao", "Estatísticas", "Avaliações", "Gestão de Avaliações", "/estatisticas/gestao_avaliacao", 460),
  item("estatisticas.avaliacoes-educadores", "Estatísticas", "Avaliações", "Avaliações de Educadores", "/estatisticas/avaliacoes_educadores", 470),
  item("estatisticas.avaliacoes-empresa", "Estatísticas", "Avaliações", "Avaliações de Empresa", "/estatisticas/avaliacoes_empresa", 480),
  item("estatisticas.avaliacoes-realizadas", "Estatísticas", "Avaliações", "Avaliações Realizadas", "/estatisticas/avaliacoes_realizadas", 490, false),
  item("estatisticas.relatorio-log", "Estatísticas", "Auditoria", "Relatório LOG", "/estatisticas/relatorio_log", 500, false),
  item("acessos.perfis", "Acessos", "Perfis e permissões", "Perfis e Permissões", "/acessos/perfis", 510),
  item("acessos.designacoes", "Acessos", "Perfis e permissões", "Designar Perfis", "/acessos/designar", 520),
  item("chamados.portal", "Chamados", "Suporte de TI", "Portal de Chamados", "/chamados/portal", 530),
  item("chamados.admin", "Chamados", "Suporte de TI", "Painel Técnico", "/chamados/admin/dashboard", 540),
];

export const PERMISSION_KEYS = new Set(PERMISSION_CATALOG.map(({ key }) => key));

export type EffectivePermission = {
  key: string;
  canView: boolean;
  canEdit: boolean;
};

const ADMINISTRATION_KEYS = new Set(["cadastros.usuarios", "acessos.perfis", "acessos.designacoes"]);

function legacyRoleCode(role: unknown) {
  if (typeof role !== "string") return "";
  const normalized = role.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
  return ({
    ADMINISTRADOR: "A", RECEPCAO: "C", PEDAGOGICO: "P", TECNICO: "T",
    EMPRESARIAL: "E", PESQUISA: "S", DESLIGADO: "D", DESENVOLVEDOR: "DEV",
  } as Record<string, string>)[normalized] ?? normalized;
}

export function getLegacyPermissions(role: unknown): EffectivePermission[] {
  const normalized = legacyRoleCode(role);
  const isInternal = ["A", "C", "P", "T", "E", "S", "D", "DEV"].includes(normalized);
  if (!isInternal) return [];

  return PERMISSION_CATALOG.flatMap((permission) => {
    if (ADMINISTRATION_KEYS.has(permission.key) && !["A", "DEV"].includes(normalized)) return [];
    if (permission.key === "chamados.portal" && !["A", "P", "T", "DEV"].includes(normalized)) return [];
    if (permission.key === "chamados.admin" && !["T", "DEV"].includes(normalized)) return [];
    return [{
      key: permission.key,
      canView: true,
      canEdit: permission.editable,
    }];
  });
}

type ApiPermissionRule = { test: RegExp; key: string };

const API_PERMISSION_RULES: ApiPermissionRule[] = [
  { test: /^\/funcoes-sistema(?:\/|$)/, key: "acessos.perfis" },
  { test: /^\/access-profiles(?:\/|$)|^\/permissions\/catalog$/, key: "acessos.perfis" },
  { test: /^\/(?:access-profile-users|assignable-access-profiles)(?:\/|$)|^\/users\/[^/]+\/profile$/, key: "acessos.designacoes" },
  { test: /^\/users(?:\/|$)/, key: "cadastros.usuarios" },
  { test: /^\/ca-aprendiz(?:\/|$)|^\/aprendiz(?:\/|$)|^\/alocacoes(?:\/|$)|^\/capacitacoes(?:\/|$)/, key: "aprendizes" },
  { test: /^\/unidade(?:\/|$)/, key: "cadastros.unidades" },
  { test: /^\/(?:instituicao|instituicoes|escolas)(?:\/|$)/, key: "cadastros.instituicoes" },
  { test: /^\/instituicoes-parceiras(?:\/|$)/, key: "cadastros.instituicoes-parceiras" },
  { test: /^\/situacao-participante(?:\/|$)/, key: "cadastros.situacoes-participante" },
  { test: /^\/(?:ocorrencia|ocorrencias|ocorrencia-tipos|tipo-ocorrencia)(?:\/|$)/, key: "cadastros.ocorrencias" },
  { test: /^\/motivo-desligamento(?:\/|$)/, key: "cadastros.motivos-desligamento" },
  { test: /^\/status-encaminhamento(?:\/|$)/, key: "cadastros.status-encaminhamento" },
  { test: /^\/(?:profissao|profissoes)(?:\/|$)/, key: "cadastros.profissoes" },
  { test: /^\/grau-parentesco(?:\/|$)/, key: "cadastros.grau-parentesco" },
  { test: /^\/grau-escolaridade(?:\/|$)/, key: "cadastros.graus-escolaridade" },
  { test: /^\/(?:feriado|feriados)(?:\/|$)/, key: "cadastros.feriados" },
  { test: /^\/(?:regiao|regioes|municipios)(?:\/|$)/, key: "cadastros.regioes" },
  { test: /^\/cursos(?:\/|$)/, key: "pedagogico.cursos" },
  { test: /^\/disciplinas(?:\/|$)/, key: "pedagogico.disciplinas" },
  { test: /^\/turmas(?:\/|$)/, key: "pedagogico.turmas" },
  { test: /^\/conceitos(?:\/|$)/, key: "pedagogico.conceitos" },
  { test: /^\/areas(?:\/|$)/, key: "pedagogico.areas" },
  { test: /^\/educadores(?:\/|$)/, key: "pedagogico.monitores" },
  { test: /^\/modulos(?:\/|$)/, key: "pedagogico.modulos" },
  { test: /^\/(?:planos|plano-curricular)(?:\/|$)/, key: "pedagogico.planos" },
  { test: /^\/cronogramas(?:\/|$)/, key: "pedagogico.cronogramas" },
  { test: /^\/geracao-cronogramas-semestre(?:\/|$)/, key: "pedagogico.gerar-cronograma-semanal" },
  { test: /^\/geracao-cronogramas(?:\/|$)/, key: "pedagogico.gerar-cronograma" },
  { test: /^\/(?:attendance|presenca)(?:\/|$)/, key: "pedagogico.presenca" },
  { test: /^\/faltas-capacitacao(?:\/|$)/, key: "pedagogico.faltas-capacitacao" },
  { test: /^\/(?:parceiros-unidades|unidades-parceiro)(?:\/|$)/, key: "empresas.unidades-parceiro" },
  { test: /^\/orientadores(?:\/|$)/, key: "empresas.orientadores" },
  { test: /^\/ramos-atividade(?:\/|$)/, key: "empresas.ramos-atividade" },
  { test: /^\/registro-gi(?:\/|$)/, key: "empresas.registro-gi" },
  { test: /^\/parceiros(?:\/|$)/, key: "empresas.empresas" },
  { test: /^\/vagas(?:\/|$)/, key: "vagas" },
  { test: /^\/estatisticaavaliacoesdisponiveiseducador(?:\/|$)/, key: "estatisticas.avaliacoes-educadores" },
  { test: /^\/estatisticaavaliacoesdisponiveisparceiro(?:\/|$)/, key: "estatisticas.avaliacoes-empresa" },
  { test: /^\/estatisticaavaliacoesrealizadas(?:\/|$)/, key: "estatisticas.avaliacoes-realizadas" },
  { test: /^\/(?:estatisticagestaoavaliacoes|estatisticaavaliacoespendentes)(?:\/|$)/, key: "estatisticas.gestao-avaliacao" },
  { test: /^\/estatisticaaprendiz\/porparceiro(?:\/|$)/, key: "estatisticas.aprendiz-parceiro" },
  { test: /^\/participantessituacao(?:\/|$)/, key: "estatisticas.participantes-situacao" },
  { test: /^\/estatisticalogtransacoes(?:\/|$)/, key: "estatisticas.relatorio-log" },
  { test: /^\/relatorio(?:\/|$)/, key: "pedagogico.lista-jovens" },
  { test: /^\/chamados(?:\/|$)/, key: "chamados.portal" },
];

export function permissionForApiRequest(method: string, path: string) {
  if (path === "/users/me" || path === "/auth/me/permissions") return null;
  if (/^\/chamados\/[^/]+\/(?:urgencia|resolver)$/.test(path)) {
    return { key: "chamados.admin", action: "edit" as const };
  }
  const rule = API_PERMISSION_RULES.find(({ test }) => test.test(path));
  if (!rule) return null;
  const action: PermissionAction = ["GET", "HEAD", "OPTIONS"].includes(method.toUpperCase()) ? "view" : "edit";
  return { key: rule.key, action };
}

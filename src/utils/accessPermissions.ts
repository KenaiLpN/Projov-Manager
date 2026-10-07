export type PermissionAction = "view" | "edit";

export type EffectivePermission = {
  key: string;
  canView: boolean;
  canEdit: boolean;
};

const ROUTE_PERMISSION_ENTRIES: Array<[string, string]> = [
  ["/acessos/perfis", "acessos.perfis"],
  ["/acessos/funcoes", "acessos.perfis"],
  ["/acessos/designar", "acessos.designacoes"],
  ["/cadastros/usuarios", "cadastros.usuarios"],
  ["/cadastros/unidades", "cadastros.unidades"],
  ["/cadastros/instituicoes-parceiras", "cadastros.instituicoes-parceiras"],
  ["/cadastros/instituicoes", "cadastros.instituicoes"],
  ["/cadastros/situacoes-participante", "cadastros.situacoes-participante"],
  ["/cadastros/ocorrencias", "cadastros.ocorrencias"],
  ["/cadastros/motivos-desligamento", "cadastros.motivos-desligamento"],
  ["/cadastros/status-encaminhamento", "cadastros.status-encaminhamento"],
  ["/cadastros/profissoes", "cadastros.profissoes"],
  ["/cadastros/grau-parentesco", "cadastros.grau-parentesco"],
  ["/cadastros/graus-escolaridade", "cadastros.graus-escolaridade"],
  ["/cadastros/feriados", "cadastros.feriados"],
  ["/cadastros/regioes", "cadastros.regioes"],
  ["/pedagogico/gerar-cronograma-semanal", "pedagogico.gerar-cronograma-semanal"],
  ["/pedagogico/gerar-cronograma", "pedagogico.gerar-cronograma"],
  ["/pedagogico/presenca-data-turma", "pedagogico.presenca-data-turma"],
  ["/pedagogico/presenca-capacitacao", "pedagogico.presenca-capacitacao"],
  ["/pedagogico/presenca-introdutorio", "pedagogico.presenca-introdutorio"],
  ["/pedagogico/faltas-capacitacao", "pedagogico.faltas-capacitacao"],
  ["/pedagogico/faltas-informatica", "pedagogico.faltas-informatica"],
  ["/pedagogico/aprendizes-turma", "pedagogico.aprendizes-turma"],
  ["/pedagogico/alunos-turma", "pedagogico.alunos-turma"],
  ["/pedagogico/lista-jovens", "pedagogico.lista-jovens"],
  ["/pedagogico/cursos", "pedagogico.cursos"],
  ["/pedagogico/disciplinas", "pedagogico.disciplinas"],
  ["/pedagogico/turmas", "pedagogico.turmas"],
  ["/pedagogico/conceitos", "pedagogico.conceitos"],
  ["/pedagogico/areas", "pedagogico.areas"],
  ["/pedagogico/monitores", "pedagogico.monitores"],
  ["/pedagogico/modulos", "pedagogico.modulos"],
  ["/pedagogico/planos", "pedagogico.planos"],
  ["/pedagogico/cronogramas", "pedagogico.cronogramas"],
  ["/pedagogico/presenca", "pedagogico.presenca"],
  ["/pedagogico/faltas", "pedagogico.faltas"],
  ["/empresa/cadunidadeparceiro", "empresas.unidades-parceiro"],
  ["/empresa/cadoriantadores", "empresas.orientadores"],
  ["/empresa/cadramosatividade", "empresas.ramos-atividade"],
  ["/empresa/cadregistrogi", "empresas.registro-gi"],
  ["/empresa/cadempresas", "empresas.empresas"],
  ["/estatisticas/part_por_situacao", "estatisticas.participantes-situacao"],
  ["/estatisticas/geral_aprendiz", "estatisticas.geral-aprendiz"],
  ["/estatisticas/aprendiz_por_parceiro", "estatisticas.aprendiz-parceiro"],
  ["/estatisticas/gestao_avaliacao", "estatisticas.gestao-avaliacao"],
  ["/estatisticas/avaliacoes_educadores", "estatisticas.avaliacoes-educadores"],
  ["/estatisticas/avaliacoes_empresa", "estatisticas.avaliacoes-empresa"],
  ["/estatisticas/avaliacoes_realizadas", "estatisticas.avaliacoes-realizadas"],
  ["/estatisticas/relatorio_log", "estatisticas.relatorio-log"],
  ["/chamados/admin", "chamados.admin"],
  ["/chamados/portal", "chamados.portal"],
  ["/aprendizes", "aprendizes"],
  ["/vagas", "vagas"],
  ["/home", "home"],
];

export function permissionKeyForPath(pathname: string) {
  const path = pathname.split(/[?#]/)[0].replace(/\/$/, "") || "/";
  return ROUTE_PERMISSION_ENTRIES.find(([route]) => path === route || path.startsWith(`${route}/`))?.[1] ?? null;
}

export function hasPermission(permissions: EffectivePermission[] | null, key: string, action: PermissionAction) {
  if (permissions === null) return true;
  const permission = permissions.find((entry) => entry.key === key);
  return Boolean(permission && (action === "view" ? permission.canView : permission.canEdit));
}

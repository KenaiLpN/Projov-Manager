import test from "node:test";
import assert from "node:assert/strict";
import { flattenNavigation, getNavigationSections } from "../src/components/navigation/navigation";
import { permissionKeyForPath, type EffectivePermission } from "../src/utils/accessPermissions";
import { PERMISSION_CATALOG, getLegacyPermissions, permissionForApiRequest } from "../apps/api/src/lib/permissionCatalog";

test("catálogo de permissões usa chaves e ordens únicas", () => {
  assert.equal(new Set(PERMISSION_CATALOG.map(({ key }) => key)).size, PERMISSION_CATALOG.length);
  assert.equal(new Set(PERMISSION_CATALOG.map(({ order }) => order)).size, PERMISSION_CATALOG.length);
  assert.ok(PERMISSION_CATALOG.every(({ key, section, group, label }) => key && section && group && label));
});

test("editar no catálogo legado sempre inclui visualização", () => {
  for (const role of ["A", "C", "P", "T", "E", "S", "DEV"]) {
    const permissions = getLegacyPermissions(role);
    assert.ok(permissions.every(({ canView, canEdit }) => !canEdit || canView), role);
  }
});

test("perfil personalizado filtra seções e submenus sem alterar o catálogo legado", () => {
  const permissions: EffectivePermission[] = [
    { key: "cadastros.unidades", canView: true, canEdit: false },
    { key: "chamados.portal", canView: true, canEdit: true },
  ];
  const sections = getNavigationSections("C", "17", permissions);
  assert.deepEqual(sections.map(({ id }) => id), ["cadastros", "chamados"]);
  assert.deepEqual(flattenNavigation(sections).map(({ href }) => href).sort(), [
    "/cadastros/unidades",
    "/chamados/portal",
  ]);
  assert.ok(getNavigationSections("C", "17").length > sections.length);
});

test("rotas administrativas e operações de escrita exigem as ações corretas", () => {
  assert.deepEqual(permissionForApiRequest("GET", "/users"), { key: "cadastros.usuarios", action: "view" });
  assert.deepEqual(permissionForApiRequest("POST", "/users"), { key: "cadastros.usuarios", action: "edit" });
  assert.deepEqual(permissionForApiRequest("GET", "/access-profile-users"), { key: "acessos.designacoes", action: "view" });
  assert.deepEqual(permissionForApiRequest("PUT", "/users/ABC/profile"), { key: "acessos.designacoes", action: "edit" });
  assert.deepEqual(permissionForApiRequest("PATCH", "/chamados/15/urgencia"), { key: "chamados.admin", action: "edit" });
  assert.deepEqual(permissionForApiRequest("GET", "/auth/me/permissions"), null);
});

test("prefixos reais da API são associados ao catálogo modular", () => {
  const cases: Array<[string, string]> = [
    ["/instituicao", "cadastros.instituicoes"],
    ["/ocorrencia/2", "cadastros.ocorrencias"],
    ["/tipo-ocorrencia", "cadastros.ocorrencias"],
    ["/profissao", "cadastros.profissoes"],
    ["/feriado", "cadastros.feriados"],
    ["/regiao", "cadastros.regioes"],
    ["/unidades-parceiro", "empresas.unidades-parceiro"],
    ["/estatisticaavaliacoespendentes", "estatisticas.gestao-avaliacao"],
    ["/estatisticalogtransacoes", "estatisticas.relatorio-log"],
  ];
  for (const [path, key] of cases) {
    assert.deepEqual(permissionForApiRequest("GET", path), { key, action: "view" }, path);
  }
});

test("destinos configuráveis da navegação possuem chave de permissão", () => {
  const destinations = flattenNavigation(getNavigationSections("DEV", "17"));
  for (const destination of destinations) {
    if (destination.href === "/pedagogico") continue;
    assert.ok(permissionKeyForPath(destination.href), destination.href);
  }
});

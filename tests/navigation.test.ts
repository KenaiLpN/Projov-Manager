import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  flattenNavigation,
  getNavigationMatch,
  getNavigationSections,
  type NavigationItem,
  type NavigationSection,
} from "../src/components/navigation/navigation";

const appDirectory = join(dirname(fileURLToPath(import.meta.url)), "../src/app");
const roles = ["A", "C", "P", "T", "E", "S", "D", "DEV", "APRENDIZ", "EDUCADOR", "EMPRESA"];
const internalSections = ["home", "aprendizes", "cadastros", "pedagogico", "empresa", "vagas", "estatisticas", "acessos"];
const partnerDestinations = [
  "/empresa/perfil",
  "/empresa/aprendizes-alocados",
  "/empresa/controle-presenca/por-periodo",
  "/empresa/controle-presenca/total-periodo",
  "/empresa/cadastro-vagas",
  "/empresa/avaliacao-desempenho",
  "/empresa/contagem-faltas",
  "/empresa/avaliacoes-realizadas",
];

function destinations(role: string, userId: string | number = 42): string[] {
  return flattenNavigation(getNavigationSections(role, userId)).map((item) => item.href);
}

test("Catálogo: os destinos de todos os perfis correspondem a páginas existentes", () => {
  function verifyPage(item: NavigationItem, role: string) {
    if (item.href !== "#") {
      assert.ok(item.href.startsWith("/"), `${role}: destino não local ${item.href}`);
      const pathname = new URL(item.href, "https://prosis.invalid").pathname;
      assert.ok(existsSync(join(appDirectory, pathname, "page.tsx")), `${role}: página ausente para ${item.href}`);
    }
    item.subMenu?.forEach((child) => verifyPage(child, role));
  }

  for (const role of roles) {
    const sections = getNavigationSections(role, 42);
    assert.ok(sections.length > 0, `${role}: catálogo inesperadamente vazio`);
    for (const section of sections) {
      verifyPage(section, role);
      for (const group of section.groups) {
        group.items.forEach((item) => verifyPage(item, role));
      }
    }
  }
});

test("Perfis: os onze perfis veem somente as seções correspondentes ao seu acesso", () => {
  const expected: Record<string, string[]> = {
    A: [...internalSections, "chamados"],
    C: internalSections,
    P: [...internalSections, "chamados"],
    T: [...internalSections, "chamados"],
    E: internalSections,
    S: internalSections,
    D: internalSections,
    DEV: [...internalSections, "chamados"],
    APRENDIZ: ["minha-ficha"],
    EDUCADOR: ["aprendizes", "pedagogico"],
    EMPRESA: ["parceiro"],
  };

  for (const role of roles) {
    assert.deepEqual(getNavigationSections(role, 42).map((section) => section.id), expected[role], role);
  }
});

test("Perfis: sessão ainda não carregada e perfis desconhecidos não exibem destinos", () => {
  for (const role of ["", " ", "SEM_CARGO", "INVENTADO"]) {
    assert.deepEqual(getNavigationSections(role, 42), [], role);
  }
});

test("Perfis: códigos e nomes normalizados preservam a mesma navegação", () => {
  for (const [alias, code] of [["Administrador", "A"], ["Técnico", "T"], [" desenvolvedor ", "DEV"], ["Empresa Parceira", "EMPRESA"]]) {
    assert.deepEqual(destinations(alias), destinations(code), alias);
  }
});

test("Aprendiz: o único destino é a própria ficha, com o ID codificado na consulta", () => {
  for (const userId of [42, "0052", "aluno 42&next=/home"]) {
    const hrefs = destinations("APRENDIZ", userId);
    assert.equal(hrefs.length, 1);
    const url = new URL(hrefs[0], "https://prosis.invalid");
    assert.equal(url.pathname, "/aprendizes/cadaprendizes");
    assert.deepEqual([...url.searchParams.entries()], [["id", String(userId)]]);
  }
});

test("Aprendiz: ID ausente não produz um atalho para cadastro sem identidade", () => {
  assert.deepEqual(getNavigationSections("APRENDIZ"), []);
  assert.deepEqual(getNavigationSections("APRENDIZ", ""), []);
  assert.deepEqual(getNavigationSections("APRENDIZ", "  "), []);
});

test("Empresa: os oito destinos do portal parceiro são preservados sem páginas internas", () => {
  assert.deepEqual(destinations("EMPRESA").sort(), [...partnerDestinations].sort());
});

test("Educador: navega em aprendizes e pedagógico sem atalho de criação de ficha", () => {
  const hrefs = destinations("EDUCADOR");
  assert.ok(hrefs.includes("/aprendizes"));
  assert.ok(hrefs.includes("/pedagogico/presenca"));
  for (const href of hrefs) {
    assert.ok(href === "/aprendizes" || href === "/pedagogico" || href.startsWith("/pedagogico/"), href);
  }
  assert.ok(!hrefs.some((href) => href.startsWith("/aprendizes/cadaprendizes")));
});

test("Chamados: portal apenas para A/P/T/DEV e painel técnico apenas para T/DEV", () => {
  for (const role of [...roles, "INVENTADO", ""]) {
    const hrefs = destinations(role);
    assert.equal(hrefs.includes("/chamados/portal"), ["A", "P", "T", "DEV"].includes(role), `${role}: portal`);
    assert.equal(hrefs.includes("/chamados/admin/dashboard"), ["T", "DEV"].includes(role), `${role}: técnico`);
  }
});

test("Busca: nenhum perfil tem destinos repetidos ou links de agrupamento", () => {
  for (const role of roles) {
    const items = flattenNavigation(getNavigationSections(role, 42));
    assert.equal(new Set(items.map((item) => item.href)).size, items.length, role);
    assert.ok(items.every((item) => item.href !== "#"), role);
    assert.ok(items.every((item) => item.sectionId && item.sectionName), role);
  }
});

test("Busca: encontra destinos aninhados e mantém o nome específico em links duplicados", () => {
  const section: NavigationSection = {
    ...getNavigationSections("DEV")[2],
    groups: [{
      name: "Pessoas",
      items: [{
        name: "Agrupamento",
        href: "#",
        subMenu: [
          { name: "Usuários", href: "/cadastros/usuarios" },
          { name: "Usuários repetido", href: "/cadastros/usuarios" },
          { name: "Subgrupo", href: "#", subMenu: [{ name: "Unidades", href: "/cadastros/unidades" }] },
        ],
      }],
    }],
  };
  const items = flattenNavigation([section]);
  assert.deepEqual(items.map(({ name, href, groupName }) => ({ name, href, groupName })), [
    { name: "Usuários", href: "/cadastros/usuarios", groupName: "Pessoas" },
    { name: "Unidades", href: "/cadastros/unidades", groupName: "Pessoas" },
  ]);
});

test("Rota ativa: usa o destino mais específico mesmo com nomes de rotas sobrepostos", () => {
  const sections = getNavigationSections("DEV");
  const partner = getNavigationMatch(sections, "/cadastros/instituicoes-parceiras");
  assert.equal(partner?.section.id, "cadastros");
  assert.equal(partner?.item?.href, "/cadastros/instituicoes-parceiras");
  const absence = getNavigationMatch(sections, "/pedagogico/faltas-capacitacao");
  assert.equal(absence?.item?.href, "/pedagogico/faltas-capacitacao");
  assert.equal(absence?.group?.name, "Presença e faltas");
});

test("Rota ativa: remove consulta, fragmento e barra final e reconhece subpáginas", () => {
  const sections = getNavigationSections("DEV");
  const match = getNavigationMatch(sections, "/pedagogico/presenca/?turma=42#lista");
  assert.equal(match?.item?.href, "/pedagogico/presenca");
  assert.equal(getNavigationMatch(sections, "/aprendizes/cadaprendizes?id=42")?.section.id, "aprendizes");
  assert.equal(getNavigationMatch(getNavigationSections("APRENDIZ", 42), "/aprendizes/cadaprendizes")?.section.id, "minha-ficha");
});

test("Rota ativa: prefixos parciais não selecionam destinos de outros segmentos", () => {
  const sections = getNavigationSections("DEV");
  for (const pathname of ["/aprendizes-outro", "/home-extra", "/cadastros/instituicoes-extra", "/rota-inexistente"]) {
    assert.equal(getNavigationMatch(sections, pathname), undefined, pathname);
  }
  const partialChild = getNavigationMatch(sections, "/pedagogico/faltas-capacitacao-extra");
  assert.equal(partialChild?.section.id, "pedagogico");
  assert.equal(partialChild?.item, undefined);
  assert.equal(getNavigationMatch(getNavigationSections("EMPRESA"), "/chamados/portal"), undefined);
});

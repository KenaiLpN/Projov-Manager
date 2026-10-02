import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  FolderKanban,
  GraduationCap,
  Headset,
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { normalizeRoleCode } from "@/utils/roles";

export interface NavigationItem {
  name: string;
  href: string;
  description?: string;
  subMenu?: NavigationItem[];
}

export interface NavigationGroup {
  name: string;
  items: NavigationItem[];
}

export interface NavigationSection extends NavigationItem {
  id: string;
  icon: LucideIcon;
  description: string;
  groups: NavigationGroup[];
}

export interface NavigationSearchItem extends NavigationItem {
  sectionId: string;
  sectionName: string;
  groupName?: string;
}

export interface NavigationMatch {
  section: NavigationSection;
  item?: NavigationItem;
  group?: NavigationGroup;
}

const homeSection: NavigationSection = {
  id: "home",
  name: "Visão geral",
  href: "/home",
  icon: LayoutDashboard,
  description: "Acompanhe os indicadores do programa.",
  groups: [],
};

const aprendizesSection: NavigationSection = {
  id: "aprendizes",
  name: "Aprendizes",
  href: "/aprendizes",
  icon: GraduationCap,
  description: "Consulte e acompanhe os jovens do programa.",
  groups: [],
};

const cadastrosSection: NavigationSection = {
  id: "cadastros",
  name: "Cadastros",
  href: "/cadastros/usuarios",
  icon: FolderKanban,
  description: "Organize os dados que fazem o programa acontecer.",
  groups: [
    {
      name: "Pessoas e instituições",
      items: [
        { name: "Usuários", href: "/cadastros/usuarios", description: "Pessoas com acesso ao sistema." },
        { name: "Unidades", href: "/cadastros/unidades", description: "Unidades de atendimento do programa." },
        { name: "Instituições de Ensino", href: "/cadastros/instituicoes", description: "Escolas e instituições de ensino." },
        { name: "Instituições Parceiras", href: "/cadastros/instituicoes-parceiras", description: "Organizações parceiras do programa." },
      ],
    },
    {
      name: "Acompanhamento",
      items: [
        { name: "Situações do Participante", href: "/cadastros/situacoes-participante", description: "Situações do jovem no programa." },
        { name: "Ocorrências", href: "/cadastros/ocorrencias", description: "Tipos de ocorrência para os registros." },
        { name: "Motivos de Desligamento", href: "/cadastros/motivos-desligamento", description: "Motivos de encerramento do vínculo." },
        { name: "Status Encaminhamento", href: "/cadastros/status-encaminhamento", description: "Etapas de encaminhamento dos jovens." },
      ],
    },
    {
      name: "Dados de referência",
      items: [
        { name: "Profissões", href: "/cadastros/profissoes" },
        { name: "Graus de Parentesco", href: "/cadastros/grau-parentesco" },
        { name: "Graus de Escolaridade", href: "/cadastros/graus-escolaridade" },
        { name: "Feriados", href: "/cadastros/feriados" },
        { name: "Regiões", href: "/cadastros/regioes" },
      ],
    },
  ],
};

const pedagogicoSection: NavigationSection = {
  id: "pedagogico",
  name: "Pedagógico",
  href: "/pedagogico",
  icon: BookOpen,
  description: "Planeje a formação e acompanhe a aprendizagem.",
  groups: [
    {
      name: "Cadastros pedagógicos",
      items: [
        { name: "Cadastro de Cursos", href: "/pedagogico/cursos" },
        { name: "Cadastro de Disciplinas", href: "/pedagogico/disciplinas" },
        { name: "Cadastro de Turmas", href: "/pedagogico/turmas" },
        { name: "Cadastro de Conceitos", href: "/pedagogico/conceitos" },
        { name: "Áreas de Atuação", href: "/pedagogico/areas" },
      ],
    },
    {
      name: "Formação e turmas",
      items: [
        { name: "Lista de Monitores/Funcionário", href: "/pedagogico/monitores" },
        { name: "Módulos de Aprendizagem", href: "/pedagogico/modulos" },
        { name: "Planos Curriculares", href: "/pedagogico/planos" },
        { name: "Aprendizes por Turma", href: "/pedagogico/aprendizes-turma" },
        { name: "Alunos por Turma", href: "/pedagogico/alunos-turma" },
      ],
    },
    {
      name: "Planejamento",
      items: [
        { name: "Lista Carga Horária Final", href: "/pedagogico/lista-jovens" },
        { name: "Cronogramas", href: "/pedagogico/cronogramas" },
        { name: "Geração de Cronograma", href: "/pedagogico/gerar-cronograma" },
        { name: "Gerar Cronograma Turma/Semestre", href: "/pedagogico/gerar-cronograma-semanal" },
      ],
    },
    {
      name: "Presença e faltas",
      items: [
        { name: "Lista de Presença", href: "/pedagogico/presenca" },
        { name: "Lista Presença Capacitação", href: "/pedagogico/presenca-capacitacao" },
        { name: "Lista Presença Introdutório", href: "/pedagogico/presenca-introdutorio" },
        { name: "Lançar Faltas", href: "/pedagogico/faltas" },
        { name: "Lançar Faltas Capacitação", href: "/pedagogico/faltas-capacitacao" },
        { name: "Lançar Faltas Informática", href: "/pedagogico/faltas-informatica" },
        { name: "Controle de Presença", href: "/pedagogico/presenca-data-turma" },
      ],
    },
  ],
};

const empresaSection: NavigationSection = {
  id: "empresa",
  name: "Empresas",
  href: "/empresa/cadempresas",
  icon: Building2,
  description: "Gerencie empresas, parceiros e orientadores.",
  groups: [
    {
      name: "Empresas e parceiros",
      items: [
        { name: "Empresas", href: "/empresa/cadempresas", description: "Cadastro e informações das empresas." },
        { name: "Unidades de Parceiro", href: "/empresa/cadunidadeparceiro", description: "Unidades das organizações parceiras." },
        { name: "Orientadores", href: "/empresa/cadoriantadores", description: "Responsáveis pela orientação dos aprendizes." },
      ],
    },
    {
      name: "Gestão empresarial",
      items: [
        { name: "Ramos de Atividade", href: "/empresa/cadramosatividade" },
        { name: "Registro GI", href: "/empresa/cadregistrogi" },
      ],
    },
  ],
};

const vagasSection: NavigationSection = {
  id: "vagas",
  name: "Vagas",
  href: "/vagas",
  icon: BriefcaseBusiness,
  description: "Acompanhe as oportunidades para os aprendizes.",
  groups: [],
};

const estatisticasSection: NavigationSection = {
  id: "estatisticas",
  name: "Estatísticas",
  href: "/estatisticas/part_por_situacao",
  icon: BarChart3,
  description: "Transforme o acompanhamento em informações para decidir.",
  groups: [
    {
      name: "Indicadores do programa",
      items: [
        { name: "Participantes Por Situação", href: "/estatisticas/part_por_situacao" },
        { name: "Estatística Geral Aprendizes", href: "/estatisticas/geral_aprendiz" },
        { name: "Aprendizes Por Parceiro", href: "/estatisticas/aprendiz_por_parceiro" },
      ],
    },
    {
      name: "Avaliações",
      items: [
        { name: "Gestão De Avaliações", href: "/estatisticas/gestao_avaliacao" },
        { name: "Avaliações Disponíveis Educadores", href: "/estatisticas/avaliacoes_educadores" },
        { name: "Avaliações Disponíveis Empresa", href: "/estatisticas/avaliacoes_empresa" },
        { name: "Avaliações Realizadas", href: "/estatisticas/avaliacoes_realizadas" },
      ],
    },
    {
      name: "Auditoria",
      items: [{ name: "Relatório LOG", href: "/estatisticas/relatorio_log", description: "Consulte os registros de atividade." }],
    },
  ],
};

const acessosSection: NavigationSection = {
  id: "acessos",
  name: "Acessos",
  href: "/acessos/funcoes",
  icon: ShieldCheck,
  description: "Organize as funções e os acessos da equipe.",
  groups: [
    {
      name: "Funções e permissões",
      items: [
        { name: "Cadastro de Funções", href: "/acessos/funcoes", description: "Gerencie as funções do sistema." },
        { name: "Designar Funções", href: "/acessos/designar", description: "Associe funções aos usuários." },
      ],
    },
  ],
};

const parceiroSection: NavigationSection = {
  id: "parceiro",
  name: "Minha empresa",
  href: "/empresa/perfil",
  icon: Building2,
  description: "Acompanhe os aprendizes e a participação da sua empresa.",
  groups: [
    {
      name: "Empresa e aprendizes",
      items: [
        { name: "Detalhes Parceiros", href: "/empresa/perfil" },
        { name: "Aprendizes Alocados", href: "/empresa/aprendizes-alocados" },
        { name: "Cadastro de Vagas", href: "/empresa/cadastro-vagas" },
      ],
    },
    {
      name: "Controle de presença",
      items: [
        { name: "Presença Por Período", href: "/empresa/controle-presenca/por-periodo" },
        { name: "Presença Total Período", href: "/empresa/controle-presenca/total-periodo" },
        { name: "Contagem Faltas", href: "/empresa/contagem-faltas" },
      ],
    },
    {
      name: "Avaliações",
      items: [
        { name: "Avaliação Desempenho", href: "/empresa/avaliacao-desempenho" },
        { name: "Avaliações Realizadas", href: "/empresa/avaliacoes-realizadas" },
      ],
    },
  ],
};

const internalRoles = new Set(["A", "C", "P", "T", "E", "S", "D", "DEV"]);
const chamadosRoles = new Set(["A", "P", "T", "DEV"]);
const technicalRoles = new Set(["T", "DEV"]);

/** Navigation visibility mirrors the existing route guards; the API enforces authorization. */
export function getNavigationSections(role: string, userId?: string | number): NavigationSection[] {
  const normalizedRole = normalizeRoleCode(role);

  if (normalizedRole === "APRENDIZ") {
    if (userId === undefined || String(userId).trim() === "") return [];
    return [{
      id: "minha-ficha",
      name: "Minha ficha",
      href: `/aprendizes/cadaprendizes?id=${encodeURIComponent(String(userId))}`,
      icon: UserRound,
      description: "Consulte seus dados e acompanhe sua aprendizagem.",
      groups: [],
    }];
  }

  if (normalizedRole === "EMPRESA") return [parceiroSection];
  if (normalizedRole === "EDUCADOR") return [aprendizesSection, pedagogicoSection];
  if (!internalRoles.has(normalizedRole)) return [];

  const sections = [
    homeSection,
    aprendizesSection,
    cadastrosSection,
    pedagogicoSection,
    empresaSection,
    vagasSection,
    estatisticasSection,
    acessosSection,
  ];

  if (chamadosRoles.has(normalizedRole)) {
    const items: NavigationItem[] = [{
      name: "Portal de Chamados",
      href: "/chamados/portal",
      description: "Abra solicitações e acompanhe seus atendimentos.",
    }];

    if (technicalRoles.has(normalizedRole)) {
      items.push({
        name: "Painel Técnico",
        href: "/chamados/admin/dashboard",
        description: "Gerencie a fila de chamados da equipe de TI.",
      });
    }

    sections.push({
      id: "chamados",
      name: "Chamados",
      href: "/chamados/portal",
      icon: Headset,
      description: "Conte com o suporte e acompanhe suas solicitações.",
      groups: [{ name: "Suporte de TI", items }],
    });
  }

  return sections;
}

/** Search only contains actual destinations, with duplicate section links removed. */
export function flattenNavigation(sections: NavigationSection[]): NavigationSearchItem[] {
  const result: NavigationSearchItem[] = [];
  const visited = new Set<string>();

  function append(item: NavigationItem, section: NavigationSection, groupName?: string) {
    if (item.href !== "#" && !visited.has(item.href)) {
      visited.add(item.href);
      result.push({
        ...item,
        sectionId: section.id,
        sectionName: section.name,
        groupName,
      });
    }
    item.subMenu?.forEach((child) => append(child, section, groupName));
  }

  sections.forEach((section) => {
    section.groups.forEach((group) => group.items.forEach((item) => append(item, section, group.name)));
    append(section, section);
  });

  return result;
}

function routePath(href: string): string {
  return href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
}

/** Matches the most specific route and respects segment boundaries. */
export function getNavigationMatch(sections: NavigationSection[], pathname: string): NavigationMatch | undefined {
  const currentPath = routePath(pathname);
  let result: NavigationMatch | undefined;
  let bestLength = -1;

  function consider(section: NavigationSection, item?: NavigationItem, group?: NavigationGroup) {
    const href = item?.href ?? section.href;
    if (href === "#") return;
    const candidate = routePath(href);
    if (currentPath !== candidate && !(candidate !== "/" && currentPath.startsWith(`${candidate}/`))) return;
    if (candidate.length > bestLength || (candidate.length === bestLength && item)) {
      bestLength = candidate.length;
      result = { section, item, group };
    }
  }

  function visit(item: NavigationItem, section: NavigationSection, group: NavigationGroup) {
    consider(section, item, group);
    item.subMenu?.forEach((child) => visit(child, section, group));
  }

  sections.forEach((section) => {
    consider(section);
    section.groups.forEach((group) => group.items.forEach((item) => visit(item, section, group)));
  });

  return result;
}

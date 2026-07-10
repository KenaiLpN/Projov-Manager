export const ROLE_MAP: Record<string, string> = {
  A: "Administrador",
  C: "Recepção",
  D: "Desligado",
  E: "Empresarial",
  P: "Pedagógico",
  S: "Pesquisa",
  T: "Técnico",
  DEV: "Desenvolvedor",
  APRENDIZ: "Aprendiz",
  EDUCADOR: "Educador",
  EMPRESA: "Empresa Parceira",
};

const ROLE_ALIASES: Record<string, string> = {
  ADMINISTRADOR: "A",
  RECEPCAO: "C",
  DESLIGADO: "D",
  EMPRESARIAL: "E",
  PEDAGOGICO: "P",
  PESQUISA: "S",
  TECNICO: "T",
  DESENVOLVEDOR: "DEV",
  EDUCADOR: "EDUCADOR",
  APRENDIZ: "APRENDIZ",
  EMPRESA: "EMPRESA",
  "EMPRESA PARCEIRA": "EMPRESA",
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

export const normalizeRoleCode = (role: unknown): string => {
  if (typeof role !== "string") return "";

  const trimmedRole = role.trim();
  if (!trimmedRole) return "";

  const upperRole = trimmedRole.toUpperCase();
  if (ROLE_MAP[upperRole]) return upperRole;

  return ROLE_ALIASES[normalizeText(trimmedRole)] || upperRole;
};

export const getRoleLabel = (code: string | null | undefined): string => {
  if (!code) return "Não definido";
  const upperCode = normalizeRoleCode(code);
  return ROLE_MAP[upperCode] || code;
};

export const getSessionUserRole = (
  user: Record<string, unknown> | null | undefined,
): string => {
  if (!user) return "";

  const candidates = [
    user.UsuTipo,
    user.role,
    user.tipo,
    user.perfil,
    user.tipoUsuario,
    user.userType,
  ]
    .map(normalizeRoleCode)
    .filter(Boolean);

  return candidates.includes("DEV") ? "DEV" : candidates[0] || "";
};

export const canDeleteAprendiz = (role: unknown): boolean => {
  const normalizedRole = normalizeRoleCode(role);
  return normalizedRole === "A" || normalizedRole === "DEV";
};

export const ROLE_OPTIONS = [
  { value: "A", label: "Administrador" },
  { value: "DEV", label: "Desenvolvedor" },
  { value: "C", label: "Recepção" },
  { value: "E", label: "Empresarial" },
  { value: "P", label: "Pedagógico" },
  { value: "S", label: "Pesquisa" },
  { value: "T", label: "Técnico" },
  { value: "D", label: "Desligado" },
  { value: "APRENDIZ", label: "Aprendiz" },
];

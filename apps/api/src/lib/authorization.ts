import { FastifyReply, FastifyRequest } from "fastify";

export type RoleCode =
  | "A"
  | "C"
  | "P"
  | "T"
  | "E"
  | "S"
  | "D"
  | "DEV"
  | "APRENDIZ"
  | "EDUCADOR"
  | "EMPRESA";

type AuthenticatedUser = {
  role?: string;
  tokenTipo?: string;
  tipoAcesso?: string;
};

const ROLE_ALIASES: Record<string, RoleCode> = {
  ADMINISTRADOR: "A",
  RECEPCAO: "C",
  RECEPÇÃO: "C",
  PEDAGOGICO: "P",
  PEDAGÓGICO: "P",
  TECNICO: "T",
  TÉCNICO: "T",
  EMPRESARIAL: "E",
  PESQUISA: "S",
  DESLIGADO: "D",
  DESENVOLVEDOR: "DEV",
  APRENDIZ: "APRENDIZ",
  EDUCADOR: "EDUCADOR",
  EMPRESA: "EMPRESA",
  "EMPRESA PARCEIRA": "EMPRESA",
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

export function normalizeRoleCode(role: unknown): RoleCode | "" {
  if (typeof role !== "string") return "";
  const trimmedRole = role.trim();
  if (!trimmedRole) return "";

  const upperRole = trimmedRole.toUpperCase();
  if (upperRole in ROLE_ALIASES) return ROLE_ALIASES[upperRole];

  const normalizedRole = normalizeText(trimmedRole);
  return ROLE_ALIASES[normalizedRole] ?? (normalizedRole as RoleCode);
}

export function getUserRole(user?: AuthenticatedUser | null): RoleCode | "" {
  if (!user) return "";
  const candidates = [user.role, user.tokenTipo, user.tipoAcesso]
    .map(normalizeRoleCode)
    .filter(Boolean);

  return candidates.includes("DEV") ? "DEV" : candidates[0] || "";
}

export function hasAnyRole(
  user: AuthenticatedUser | null | undefined,
  allowedRoles: readonly RoleCode[],
) {
  const role = getUserRole(user);
  return Boolean(role && allowedRoles.includes(role));
}

export function authorizeRoles(allowedRoles: readonly RoleCode[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!hasAnyRole(request.user as AuthenticatedUser | undefined, allowedRoles)) {
      return reply.status(403).send({ message: "Acesso nao permitido." });
    }
  };
}

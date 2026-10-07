import { FastifyReply, FastifyRequest } from "fastify";
import type {} from "@fastify/jwt";
import { AccessControlService } from "../services/AccessControlService";
import { permissionForApiRequest, type PermissionAction } from "./permissionCatalog";

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

const accessControl = new AccessControlService();

function isExternalRole(role: string) {
  return ["APRENDIZ", "EDUCADOR", "EMPRESA"].includes(role);
}

function hasAttachedPermission(user: { permissions?: string[] }, key: string, action: PermissionAction) {
  if (!Array.isArray(user.permissions)) return null;
  return user.permissions.includes(action === "edit" ? `${key}:edit` : key);
}

export function authorizePermission(key: string, action: PermissionAction) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as (AuthenticatedUser & { sub?: string; permissions?: string[] }) | undefined;
    const role = getUserRole(user);
    if (!user?.sub || isExternalRole(role)) return reply.status(403).send({ message: "Acesso nao permitido." });
    const attachedPermission = hasAttachedPermission(user, key, action);
    if (attachedPermission !== null) {
      if (!attachedPermission) return reply.status(403).send({ message: "Acesso nao permitido." });
      return;
    }
    const result = await accessControl.hasPermission(String(user.sub), role, key, action);
    if (!result.allowed) return reply.status(403).send({ message: "Acesso nao permitido." });
    user.permissions = result.access.permissions
      .filter((permission: { canView: boolean }) => permission.canView)
      .flatMap((permission: { key: string; canEdit: boolean }) => [permission.key, ...(permission.canEdit ? [`${permission.key}:edit`] : [])]);
  };
}

export async function authorizeMappedPermission(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as (AuthenticatedUser & { sub?: string; permissions?: string[] }) | undefined;
  const role = getUserRole(user);
  if (!user?.sub || isExternalRole(role)) return;
  const path = request.url.split("?")[0];
  const required = permissionForApiRequest(request.method, path);
  if (!required) return;
  const result = await accessControl.hasPermission(String(user.sub), role, required.key, required.action);
  if (!result.allowed) return reply.status(403).send({ message: "Acesso nao permitido." });
  user.permissions = result.access.permissions
    .filter((permission: { canView: boolean }) => permission.canView)
    .flatMap((permission: { key: string; canEdit: boolean }) => [permission.key, ...(permission.canEdit ? [`${permission.key}:edit`] : [])]);
}

import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import {
  PERMISSION_CATALOG,
  PERMISSION_KEYS,
  getLegacyPermissions,
  type EffectivePermission,
  type PermissionAction,
} from "../lib/permissionCatalog";

export type PermissionSelection = {
  key: string;
  canView: boolean;
  canEdit: boolean;
};

type ProfileInput = {
  name: string;
  parentId?: number | null;
  isCoordinator?: boolean;
  active?: boolean;
  expectedVersion?: number;
  permissions?: PermissionSelection[];
};

const PROFILE_INCLUDE = {
  parent: { select: { id: true, name: true } },
  permissions: { include: { permission: true } },
  _count: { select: { users: true, children: true } },
} as const;

function isAccessSchemaUnavailable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && ["P2021", "P2022"].includes(error.code);
}

function normalizeSelections(selections: PermissionSelection[] = []) {
  const byKey = new Map<string, PermissionSelection>();
  for (const selection of selections) {
    if (!PERMISSION_KEYS.has(selection.key)) continue;
    const catalog = PERMISSION_CATALOG.find(({ key }) => key === selection.key)!;
    const canEdit = catalog.editable && Boolean(selection.canEdit);
    byKey.set(selection.key, { key: selection.key, canView: Boolean(selection.canView) || canEdit, canEdit });
  }
  return [...byKey.values()];
}

function serializeProfile(profile: any) {
  const stored = (profile.permissions ?? []).map((entry: any) => ({
    key: entry.permission.key,
    canView: Boolean(entry.canView),
    canEdit: Boolean(entry.canEdit),
  }));
  const permissions = stored.length === 0 && profile.isSystem
    ? getLegacyPermissions(profile.code)
    : stored;
  const visualizacao = permissions.filter((entry: EffectivePermission) => entry.canView).map((entry: EffectivePermission) => entry.key);
  const edicao = permissions.filter((entry: EffectivePermission) => entry.canEdit).map((entry: EffectivePermission) => entry.key);
  return {
    id: profile.id,
    code: profile.code,
    name: profile.name,
    parentId: profile.parentId,
    parent: profile.parent ?? null,
    isCoordinator: profile.isCoordinator,
    isSystem: profile.isSystem,
    active: profile.active,
    version: profile.version,
    userCount: profile._count?.users ?? 0,
    childCount: profile._count?.children ?? 0,
    permissions,
    visualizacao,
    edicao,
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function profileCode(name: string) {
  const base = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "").toUpperCase().slice(0, 48) || "PERFIL";
  return `${base}_${Date.now().toString(36).toUpperCase()}`;
}

export class AccessControlService {
  async resolveUserAccess(userCode: string, legacyRole: unknown) {
    const fallback = {
      source: "legacy" as const,
      profile: null,
      permissions: getLegacyPermissions(legacyRole),
    };
    try {
      const assignment = await (prisma as any).accessUserProfile.findUnique({
        where: { userCode },
        include: { profile: { include: PROFILE_INCLUDE } },
      });
      const now = new Date();
      if (!assignment?.profile?.active || assignment.validFrom > now || (assignment.validUntil && assignment.validUntil <= now)) return fallback;
      const serialized = serializeProfile(assignment.profile);
      return { source: "profile" as const, profile: serialized, permissions: serialized.permissions };
    } catch (error) {
      if (isAccessSchemaUnavailable(error)) return fallback;
      throw error;
    }
  }

  async hasPermission(userCode: string, legacyRole: unknown, key: string, action: PermissionAction) {
    const access = await this.resolveUserAccess(userCode, legacyRole);
    const permission = access.permissions.find((entry: EffectivePermission) => entry.key === key);
    return { allowed: Boolean(permission && (action === "view" ? permission.canView : permission.canEdit)), access };
  }

  getCatalog() {
    return PERMISSION_CATALOG;
  }

  async listProfiles(page: number, limit: number, search?: string, active?: boolean) {
    const where: any = {
      ...(typeof active === "boolean" ? { active } : {}),
      ...(search ? { name: { contains: search } } : {}),
    };
    const [profiles, total] = await Promise.all([
      (prisma as any).accessProfile.findMany({ where, include: PROFILE_INCLUDE, orderBy: [{ active: "desc" }, { name: "asc" }], skip: (page - 1) * limit, take: limit }),
      (prisma as any).accessProfile.count({ where }),
    ]);
    return { data: profiles.map(serializeProfile), meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async listAssignableProfiles() {
    return await (prisma as any).accessProfile.findMany({
      where: { active: true },
      select: { id: true, code: true, name: true, active: true },
      orderBy: { name: "asc" },
    });
  }

  async listAssignableUsers(page: number, limit: number, search?: string) {
    const where = search ? {
      OR: [
        { UsuNome: { contains: search } },
        { UsuEmail: { contains: search } },
        { UsuCodigo: { contains: search } },
      ],
    } : {};
    const [users, total] = await Promise.all([
      (prisma as any).cA_Usuarios.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { UsuNome: "asc" },
        select: { UsuCodigo: true, UsuNome: true, UsuEmail: true, UsuTipo: true, chk_ativo: true },
      }),
      (prisma as any).cA_Usuarios.count({ where }),
    ]);
    const assignments = await (prisma as any).accessUserProfile.findMany({
      where: { userCode: { in: users.map((user: { UsuCodigo: string }) => user.UsuCodigo) } },
      include: { profile: { select: { id: true, code: true, name: true, active: true } } },
    });
    const assignmentByUser = new Map(assignments.map((assignment: any) => [assignment.userCode, assignment.profile]));
    return {
      data: users.map((user: { UsuCodigo: string }) => ({ ...user, AccessProfile: assignmentByUser.get(user.UsuCodigo) ?? null })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProfile(id: number) {
    const profile = await (prisma as any).accessProfile.findUnique({ where: { id }, include: PROFILE_INCLUDE });
    return profile ? serializeProfile(profile) : null;
  }

  private async syncCatalog(tx: any) {
    for (const permission of PERMISSION_CATALOG) {
      await tx.accessPermission.upsert({
        where: { key: permission.key },
        create: {
          key: permission.key, section: permission.section, groupName: permission.group,
          label: permission.label, routePattern: permission.routePattern,
          editable: permission.editable, displayOrder: permission.order,
        },
        update: {
          section: permission.section, groupName: permission.group, label: permission.label,
          routePattern: permission.routePattern, editable: permission.editable,
          displayOrder: permission.order, active: true,
        },
      });
    }
  }

  private async writePermissions(tx: any, profileId: number, selections: PermissionSelection[]) {
    const normalized = normalizeSelections(selections);
    await tx.accessProfilePermission.deleteMany({ where: { profileId } });
    if (normalized.length === 0) return;
    const permissions = await tx.accessPermission.findMany({ where: { key: { in: normalized.map(({ key }) => key) } }, select: { id: true, key: true } });
    const ids = new Map(permissions.map((permission: any) => [permission.key, permission.id]));
    await tx.accessProfilePermission.createMany({ data: normalized.map((selection) => ({
      profileId,
      permissionId: ids.get(selection.key),
      canView: selection.canView,
      canEdit: selection.canEdit,
    })).filter((entry) => typeof entry.permissionId === "number") });
  }

  async createProfile(input: ProfileInput, actorCode: string) {
    return await prisma.$transaction(async (tx: any) => {
      await this.syncCatalog(tx);
      let permissions = normalizeSelections(input.permissions);
      if (permissions.length === 0 && input.parentId) {
        const parent = await tx.accessProfile.findUnique({ where: { id: input.parentId }, include: PROFILE_INCLUDE });
        if (!parent) throw Object.assign(new Error("Perfil pai não encontrado."), { statusCode: 400 });
        permissions = serializeProfile(parent).permissions;
      }
      const created = await tx.accessProfile.create({ data: {
        code: profileCode(input.name), name: input.name.trim(), parentId: input.parentId ?? null,
        isCoordinator: Boolean(input.isCoordinator), active: input.active ?? true,
      } });
      await this.writePermissions(tx, created.id, permissions);
      const after = await tx.accessProfile.findUnique({ where: { id: created.id }, include: PROFILE_INCLUDE });
      await tx.accessPermissionAuditLog.create({ data: { actorCode, event: "profile.created", targetType: "profile", targetId: String(created.id), afterJson: serializeProfile(after) } });
      return serializeProfile(after);
    });
  }

  private async assertParentIsValid(tx: any, id: number, parentId?: number | null) {
    if (!parentId) return;
    if (parentId === id) throw Object.assign(new Error("O perfil não pode ser pai dele mesmo."), { statusCode: 400 });
    let cursor: number | null = parentId;
    const visited = new Set<number>();
    while (cursor) {
      if (cursor === id || visited.has(cursor)) throw Object.assign(new Error("A hierarquia de perfis não pode formar ciclos."), { statusCode: 400 });
      visited.add(cursor);
      const parent: { parentId: number | null } | null = await tx.accessProfile.findUnique({ where: { id: cursor }, select: { parentId: true } });
      if (!parent) throw Object.assign(new Error("Perfil pai não encontrado."), { statusCode: 400 });
      cursor = parent.parentId;
    }
  }

  async updateProfile(id: number, input: ProfileInput, actorCode: string) {
    return await prisma.$transaction(async (tx: any) => {
      const before = await tx.accessProfile.findUnique({ where: { id }, include: PROFILE_INCLUDE });
      if (!before) throw Object.assign(new Error("Perfil não encontrado."), { statusCode: 404 });
      if (input.expectedVersion !== undefined && input.expectedVersion !== before.version) {
        throw Object.assign(new Error("O perfil foi alterado por outra pessoa. Recarregue e tente novamente."), { statusCode: 409 });
      }
      if (["A", "DEV"].includes(before.code) && input.permissions) {
        const administration = normalizeSelections(input.permissions).find(({ key }) => key === "acessos.perfis");
        if (!administration?.canEdit) {
          throw Object.assign(new Error("Administrador e Desenvolvedor devem manter a permissão de administrar perfis."), { statusCode: 409 });
        }
      }
      await this.assertParentIsValid(tx, id, input.parentId);
      await this.syncCatalog(tx);
      await tx.accessProfile.update({ where: { id }, data: {
        name: input.name.trim(), parentId: input.parentId ?? null,
        isCoordinator: Boolean(input.isCoordinator), active: input.active ?? before.active,
        version: { increment: 1 },
      } });
      if (input.permissions) await this.writePermissions(tx, id, input.permissions);
      const after = await tx.accessProfile.findUnique({ where: { id }, include: PROFILE_INCLUDE });
      await tx.accessPermissionAuditLog.create({ data: { actorCode, event: "profile.updated", targetType: "profile", targetId: String(id), beforeJson: serializeProfile(before), afterJson: serializeProfile(after) } });
      return serializeProfile(after);
    });
  }

  async deactivateProfile(id: number, actorCode: string) {
    return await prisma.$transaction(async (tx: any) => {
      const before = await tx.accessProfile.findUnique({ where: { id }, include: PROFILE_INCLUDE });
      if (!before) throw Object.assign(new Error("Perfil não encontrado."), { statusCode: 404 });
      if (before.isSystem) throw Object.assign(new Error("Perfis do sistema não podem ser excluídos."), { statusCode: 409 });
      if (before._count.users > 0 || before._count.children > 0) throw Object.assign(new Error("Remova usuários e perfis filhos antes de desativar este perfil."), { statusCode: 409 });
      const after = await tx.accessProfile.update({ where: { id }, data: { active: false, version: { increment: 1 } }, include: PROFILE_INCLUDE });
      await tx.accessPermissionAuditLog.create({ data: { actorCode, event: "profile.deactivated", targetType: "profile", targetId: String(id), beforeJson: serializeProfile(before), afterJson: serializeProfile(after) } });
      return serializeProfile(after);
    });
  }

  async assignProfile(userCode: string, profileId: number, actorCode: string) {
    return await prisma.$transaction(async (tx: any) => {
      const [user, profile, before] = await Promise.all([
        tx.cA_Usuarios.findUnique({ where: { UsuCodigo: userCode }, select: { UsuCodigo: true } }),
        tx.accessProfile.findUnique({ where: { id: profileId }, select: { id: true, name: true, active: true } }),
        tx.accessUserProfile.findUnique({ where: { userCode }, include: { profile: { select: { id: true, name: true } } } }),
      ]);
      if (!user) throw Object.assign(new Error("Usuário não encontrado."), { statusCode: 404 });
      if (!profile?.active) throw Object.assign(new Error("Selecione um perfil ativo."), { statusCode: 400 });
      const assignment = await tx.accessUserProfile.upsert({
        where: { userCode }, create: { userCode, profileId }, update: { profileId, validFrom: new Date(), validUntil: null },
        include: { profile: { select: { id: true, name: true, code: true } } },
      });
      await tx.accessPermissionAuditLog.create({ data: { actorCode, event: "user.profile_assigned", targetType: "user", targetId: userCode, beforeJson: before, afterJson: assignment } });
      return assignment;
    });
  }

  async getUserProfile(userCode: string) {
    return await (prisma as any).accessUserProfile.findUnique({ where: { userCode }, include: { profile: { select: { id: true, name: true, code: true, active: true } } } });
  }
}

import api from "./api";
import type { EffectivePermission } from "@/utils/accessPermissions";

export type PermissionCatalogItem = {
  key: string;
  section: string;
  group: string;
  label: string;
  routePattern: string | null;
  editable: boolean;
  order: number;
};

export type AccessProfile = {
  id: number;
  code: string;
  name: string;
  parentId: number | null;
  parent: { id: number; name: string } | null;
  isCoordinator: boolean;
  isSystem: boolean;
  active: boolean;
  version: number;
  userCount: number;
  childCount: number;
  permissions: EffectivePermission[];
  visualizacao: string[];
  edicao: string[];
};

export type AccessProfileInput = {
  name: string;
  parentId: number | null;
  isCoordinator: boolean;
  active: boolean;
  expectedVersion?: number;
  permissions: EffectivePermission[];
};

export const accessProfileService = {
  async catalog() {
    const response = await api.get("/permissions/catalog");
    return response.data.data as PermissionCatalogItem[];
  },
  async list(params: { page?: number; limit?: number; search?: string; active?: boolean } = {}) {
    const response = await api.get("/access-profiles", { params });
    return response.data as { data: AccessProfile[]; meta: { page: number; limit: number; total: number; totalPages: number } };
  },
  async assignableProfiles() {
    const response = await api.get("/assignable-access-profiles");
    return response.data.data as Array<Pick<AccessProfile, "id" | "code" | "name" | "active">>;
  },
  async assignableUsers(params: { page?: number; limit?: number; search?: string } = {}) {
    const response = await api.get("/access-profile-users", { params });
    return response.data as {
      data: Array<{
        UsuCodigo: string;
        UsuNome: string | null;
        UsuEmail: string | null;
        UsuTipo: string | null;
        chk_ativo: boolean;
        AccessProfile?: { id: number; code: string; name: string; active: boolean } | null;
      }>;
      meta: { page: number; limit: number; total: number; totalPages: number };
    };
  },
  async create(data: AccessProfileInput) {
    const response = await api.post("/access-profiles", data);
    return response.data as AccessProfile;
  },
  async update(id: number, data: AccessProfileInput) {
    const response = await api.patch(`/access-profiles/${id}`, data);
    return response.data as AccessProfile;
  },
  async deactivate(id: number) {
    const response = await api.delete(`/access-profiles/${id}`);
    return response.data as AccessProfile;
  },
  async assign(userCode: string, profileId: number) {
    const response = await api.put(`/users/${encodeURIComponent(userCode)}/profile`, { profileId });
    return response.data.data;
  },
};

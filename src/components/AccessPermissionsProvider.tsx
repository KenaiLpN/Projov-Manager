"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import api from "@/services/api";
import { hasPermission, type EffectivePermission, type PermissionAction } from "@/utils/accessPermissions";

type AccessProfileSummary = { id: number; code: string; name: string; version: number } | null;

type AccessPermissionsContextValue = {
  loading: boolean;
  source: "profile" | "legacy" | null;
  profile: AccessProfileSummary;
  permissions: EffectivePermission[] | null;
  can: (key: string, action?: PermissionAction) => boolean;
  refresh: () => Promise<void>;
};

const AccessPermissionsContext = createContext<AccessPermissionsContextValue | null>(null);
const PUBLIC_PREFIXES = ["/login", "/cadastro", "/recuperar-senha", "/reset-password"];

export default function AccessPermissionsProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"profile" | "legacy" | null>(null);
  const [profile, setProfile] = useState<AccessProfileSummary>(null);
  const [permissions, setPermissions] = useState<EffectivePermission[] | null>(null);

  const refresh = useCallback(async () => {
    if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get("/auth/me/permissions");
      const access = response.data?.data;
      setSource(access?.source === "profile" ? "profile" : "legacy");
      setProfile(access?.profile ?? null);
      setPermissions(Array.isArray(access?.permissions) ? access.permissions : []);
    } catch {
      // Durante a implantação, uma API ainda sem a nova rota mantém o catálogo
      // legado do cliente em vez de bloquear a aplicação inteira.
      setSource(null);
      setProfile(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [pathname]);

  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<AccessPermissionsContextValue>(() => ({
    loading,
    source,
    profile,
    permissions,
    can: (key, action = "view") => hasPermission(permissions, key, action),
    refresh,
  }), [loading, permissions, profile, refresh, source]);

  return <AccessPermissionsContext.Provider value={value}>{children}</AccessPermissionsContext.Provider>;
}

export function useAccessPermissions() {
  const context = useContext(AccessPermissionsContext);
  if (!context) throw new Error("useAccessPermissions deve ser usado dentro de AccessPermissionsProvider.");
  return context;
}

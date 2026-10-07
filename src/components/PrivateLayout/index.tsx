"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import AppNavigation from "../navigation";
import { getSessionUserRole } from "@/utils/roles";
import { useAccessPermissions } from "@/components/AccessPermissionsProvider";
import { permissionKeyForPath } from "@/utils/accessPermissions";

const EMPRESA_ALLOWED_PATHS = new Set([
  "/empresa/perfil",
  "/empresa/aprendizes-alocados",
  "/empresa/controle-presenca/por-periodo",
  "/empresa/controle-presenca/total-periodo",
  "/empresa/cadastro-vagas",
  "/empresa/avaliacao-desempenho",
  "/empresa/contagem-faltas",
  "/empresa/avaliacoes-realizadas",
]);

function isEducadorAllowedPath(pathname: string): boolean {
  return (
    pathname === "/aprendizes" ||
    pathname === "/aprendizes/cadaprendizes" ||
    pathname.startsWith("/pedagogico")
  );
}

/**
 * PrivateLayout — redireciona acessos restritos para o cadastro correto.
 * A autenticação (JWT) é gerenciada exclusivamente
 * pelo middleware em src/middleware.ts.
 */
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const { can, loading: permissionsLoading } = useAccessPermissions();

  useEffect(() => {
    const publicRoutes = ["/login", "/cadastro", "/recuperar-senha", "/reset-password"];
    const isPublicPage = publicRoutes.some((r) => pathname.startsWith(r));

    if (isPublicPage) return;

    // Restrição de role: APRENDIZ só pode acessar a própria ficha
    const sessionRaw = localStorage.getItem("projov_user");
    if (!sessionRaw) return; // middleware já bloqueará rotas protegidas sem token

    try {
      const userObj = JSON.parse(sessionRaw);
      const role = getSessionUserRole(userObj);

      if (pathname.startsWith("/chamados")) {
        if (!permissionsLoading) {
          const permission = pathname.startsWith("/chamados/admin") ? "chamados.admin" : "chamados.portal";
          if (!can(permission, "view")) router.replace("/acesso-negado");
        }
        if (["APRENDIZ", "EDUCADOR", "EMPRESA"].includes(role)) {
          router.replace("/login");
          return;
        }
        return;
      }

      if (userObj.UsuTipo === "APRENDIZ") {
        const expectedPath = "/aprendizes/cadaprendizes";
        if (!pathname.startsWith(expectedPath)) {
          router.push(`${expectedPath}?id=${userObj.UsuCodigo}`);
        }
      } else if (userObj.UsuTipo === "EDUCADOR" && !isEducadorAllowedPath(pathname)) {
        router.push("/aprendizes");
      } else if (userObj.UsuTipo === "EMPRESA" && !EMPRESA_ALLOWED_PATHS.has(pathname)) {
        router.push("/empresa/perfil");
      } else if (!permissionsLoading && pathname !== "/acesso-negado") {
        const permission = permissionKeyForPath(pathname);
        if (permission && !can(permission, "view")) router.replace("/acesso-negado");
      }
    } catch (e) {
      // Dado corrompido — limpa o cache local; o middleware redirecionará se o cookie também expirou
      console.error("Cache de sessão inválido, limpando localStorage:", e);
      localStorage.removeItem("projov_user");
    }
  }, [can, pathname, permissionsLoading, router]);

  const isPublicPage = pathname === "/login" || pathname === "/cadastro" || pathname === "/reset-password";
  if (isPublicPage) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/chamados")) {
    return <>{children}</>;
  }

  return <AppNavigation>{children}</AppNavigation>;
}

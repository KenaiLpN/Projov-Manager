"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "../header";
import { getSessionUserRole } from "@/utils/roles";

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

const CHAMADOS_ALLOWED_ROLES = new Set(["A", "P", "T", "DEV"]);
const CHAMADOS_TECHNICAL_ROLES = new Set(["T", "DEV"]);

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
  const pathname = usePathname();
  const router = useRouter();

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
        if (!CHAMADOS_ALLOWED_ROLES.has(role)) {
          router.push("/login");
          return;
        }
        if (pathname.startsWith("/chamados/admin") && !CHAMADOS_TECHNICAL_ROLES.has(role)) {
          router.push("/chamados/portal");
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
      }
    } catch (e) {
      // Dado corrompido — limpa o cache local; o middleware redirecionará se o cookie também expirou
      console.error("Cache de sessão inválido, limpando localStorage:", e);
      localStorage.removeItem("projov_user");
    }
  }, [pathname, router]);

  const isPublicPage = pathname === "/login" || pathname === "/cadastro" || pathname === "/reset-password";
  if (isPublicPage) {
    return <>{children}</>;
  }

  if (pathname.startsWith("/chamados")) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
       <header className="flex-none h-20 z-50">
            <Header />
       </header>
        <main className="flex-1 flex flex-col bg-gray-100 overflow-y-auto">
           <div className="flex-1">
              {children}
           </div>
        </main>
    </div>
  );
}

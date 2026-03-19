"use client"; 

import { usePathname, useRouter } from "next/navigation"; // Adicionei useRouter
import { useEffect, useState } from "react"; // Adicionei os hooks
import { Header } from "../header";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Estado para controlar se podemos mostrar a tela ou não
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Defina quais rotas são públicas (não precisam de login)
    // Dica: Adicione '/' se sua home for pública, ou remova se for privada
    const publicRoutes = ["/login", "/cadastro", "/recuperar-senha", "/reset-password"];
    const isPublicPage = publicRoutes.includes(pathname);

    // 2. Função que verifica a autenticação
    const checkAuth = () => {
      // Como o cookie 'token' é httpOnly (segurança), o JS não consegue lê-lo via document.cookie.
      // E é por isso que a tela branca estava acontecendo!
      // Vamos verificar a sessão pelo user guardado no localStorage (que é setado no login).
      const hasUserSession = localStorage.getItem("projov_user");

      if (isPublicPage) {
        // Se é rota pública, libera geral
        setIsAuthorized(true);
      } else {
        // Se é rota privada...
        if (!hasUserSession) {
          // Não tem sessão guardada? Manda pro login e bloqueia a tela
          setIsAuthorized(false);
          router.push("/login"); // Aqui forçamos a volta real
        } else {
          // Verificação de restrição para APRENDIZ
          try {
            const userObj = JSON.parse(hasUserSession);
            if (userObj.UsuTipo === "APRENDIZ") {
              const expectedPath = "/aprendizes/cadaprendizes";
              if (!pathname.startsWith(expectedPath)) {
                // Se APRENDIZ tentar acessar rota não permitida, força para o edit dele
                setIsAuthorized(false);
                router.push(`${expectedPath}?id=${userObj.UsuCodigo}`);
                return;
              }
            }
          } catch (e) {}

          // Tem sessão local? Libera o layout
          setIsAuthorized(true);
        }
      }
    };

    checkAuth();
  }, [pathname, router]);

  // 3. Bloqueio de renderização (Loading)
  // Enquanto o useEffect não confirma a autorização, retornamos null (tela branca)
  // ou um Spinner de carregamento para não mostrar conteúdo proibido.
  if (!isAuthorized) {
    return null; 
  }

  // --- LÓGICA DE LAYOUT ORIGINAL ABAIXO ---

  const isPublicPageAtLayout = pathname === "/login" || pathname === "/cadastro" || pathname === "/reset-password";

  if (isPublicPageAtLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
        {/* TOPBAR FIXA */}
       <header className="flex-none h-20 z-50">
            <Header />
       </header>

        <main className="flex-1 flex flex-col bg-gray-100 overflow-y-auto">           
           <div className=" flex-1">
              {children}
           </div>
        </main>
    </div>
  );
}
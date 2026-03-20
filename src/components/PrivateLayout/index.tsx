"use client"; 
import { usePathname, useRouter } from "next/navigation"; 
import { useEffect, useState } from "react"; 
import { Header } from "../header";
export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  useEffect(() => {
    const publicRoutes = ["/login", "/cadastro", "/recuperar-senha", "/reset-password"];
    const isPublicPage = publicRoutes.includes(pathname);
    const checkAuth = () => {
      const hasUserSession = localStorage.getItem("projov_user");
      if (isPublicPage) {
        setIsAuthorized(true);
      } else {
        if (!hasUserSession) {
          setIsAuthorized(false);
          router.push("/login"); 
        } else {
          try {
            const userObj = JSON.parse(hasUserSession);
            if (userObj.UsuTipo === "APRENDIZ") {
              const expectedPath = "/aprendizes/cadaprendizes";
              if (!pathname.startsWith(expectedPath)) {
                setIsAuthorized(false);
                router.push(`${expectedPath}?id=${userObj.UsuCodigo}`);
                return;
              }
            }
          } catch (e) {}
          setIsAuthorized(true);
        }
      }
    };
    checkAuth();
  }, [pathname, router]);
  if (!isAuthorized) {
    return null; 
  }
  const isPublicPageAtLayout = pathname === "/login" || pathname === "/cadastro" || pathname === "/reset-password";
  if (isPublicPageAtLayout) {
    return <>{children}</>;
  }
  return (
    <div className="flex flex-col h-screen w-full bg-gray-100">
        {}
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
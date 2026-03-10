import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// F12: Função segura para decodificar JWT em Edge Runtime (onde Buffer pode não estar disponível) sem bibliotecas externas
function parseJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    // Decodifica lidando com caracteres Unicode adequadamente
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Verifica se um token é válido e ainda não expirou
function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;

  // exp no JWT é em segundos, o Date.now() é em ms
  return decoded.exp * 1000 > Date.now();
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isValidToken = isTokenValid(token);

  // Consideramos rotas públicas explicitamente:
  const isAuthRoute = pathname === "/login";
  const isRootRoute = pathname === "/";

  // Se tem token válido e está no /, manda pra home
  if (isRootRoute && isValidToken) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Se NÃO tem token válido e está no /, manda pro login
  if (isRootRoute && !isValidToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Se tentar acessar o /login já com token válido, não permite e manda pra home
  if (isAuthRoute && isValidToken) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // Se não tem token válido e não está em uma rota de auth, intercepta para o login
  if (!isValidToken && !isAuthRoute) {
    // Excluímos eventuais assets/public para não dar looping de CSS/JS caso o matcher falhe, segurança extra:
    if (!pathname.startsWith("/_next") && !pathname.startsWith("/favicon")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Se nada acima intercedeu, continua livre as rotas normais
  return NextResponse.next();
}

// F02: O matcher agora pega TUDO, exceto arquivos de build do next (_next/static, _next/image) e favicon
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

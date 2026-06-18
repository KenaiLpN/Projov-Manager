import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type JwtClaims = {
  exp?: number;
  sub?: string | number;
  role?: string;
  tokenTipo?: string;
  tipoAcesso?: string;
};

// ---------------------------------------------------------------------------
// JWT helpers (Edge Runtime — sem Node.js crypto)
// ---------------------------------------------------------------------------
function parseJwt(token: string): JwtClaims | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) {
      if (pad === 1) return null;
      base64 += new Array(5 - pad).join("=");
    }
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload) as JwtClaims;
  } catch {
    return null;
  }
}

function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 > Date.now();
}

function isAprendizToken(decoded: JwtClaims | null): boolean {
  return (
    decoded?.role === "APRENDIZ" ||
    decoded?.tokenTipo === "APRENDIZ" ||
    decoded?.tipoAcesso === "APRENDIZ"
  );
}

function isEducadorToken(decoded: JwtClaims | null): boolean {
  return (
    decoded?.role === "EDUCADOR" ||
    decoded?.tokenTipo === "EDUCADOR" ||
    decoded?.tipoAcesso === "EDUCADOR"
  );
}

function isEmpresaToken(decoded: JwtClaims | null): boolean {
  return (
    decoded?.role === "EMPRESA" ||
    decoded?.tokenTipo === "EMPRESA" ||
    decoded?.tipoAcesso === "EMPRESA"
  );
}

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

// ---------------------------------------------------------------------------
// CSP builder — nonce é gerado a cada requisição (Edge Runtime suporta WebCrypto)
// ---------------------------------------------------------------------------
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL?.trim() || "https://bot-api-ff.vercel.app";

  // Em dev, todas as chamadas passam pelo proxy /api/proxy → 'self' é suficiente.
  // Em prod, o Axios pode chamar o backend diretamente.
  const connectSrc = isDev ? "'self'" : `'self' ${apiUrl}`;

  const directives = [
    // Nega tudo por padrão; cada tipo de recurso é liberado explicitamente
    "default-src 'none'",
    // Scripts: apenas mesma origem + nonce. 'strict-dynamic' permite que
    // scripts confiáveis (com nonce) carreguem outros scripts dinamicamente
    // (necessário para o code-splitting do Next.js). Em dev, 'unsafe-eval'
    // é necessário para o react-refresh (hot reload).
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // Estilos: 'unsafe-inline' é necessário para PrimeReact e Tailwind CSS
    // que injetam estilos inline em runtime
    "style-src 'self' 'unsafe-inline'",
    // Imagens: data: para ícones base64 do PrimeReact
    "img-src 'self' data:",
    // Fontes: servidas pela mesma origem (next/font baixa no build)
    "font-src 'self'",
    // Conexões fetch/XHR/WebSocket
    `connect-src ${connectSrc}`,
    // Bloqueia carregamento em iframes (proteção contra clickjacking)
    "frame-ancestors 'none'",
    // Impede que <base> seja usada para redirecionar recursos
    "base-uri 'self'",
    // Restringe para onde formulários podem enviar dados
    "form-action 'self'",
    // Bloqueia Flash, Java e outros plugins
    "object-src 'none'",
    // Força upgrade de requisições HTTP para HTTPS
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Gera um nonce único para esta requisição (disponível no Edge Runtime)
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // --- Lógica de autenticação ---
  const token = request.cookies.get("token")?.value;
  const decodedToken = token ? parseJwt(token) : null;
  const isValidToken = isTokenValid(token);
  const isAuthRoute = pathname === "/login";
  const isPublicRoute = pathname.startsWith("/reset-password");
  const isNextInternal =
    pathname.startsWith("/_next") || pathname.startsWith("/favicon");
  const aprendizProfilePath = "/aprendizes/cadaprendizes";
  const empresaProfilePath = "/empresa/perfil";
  const aprendizCodigo = decodedToken?.sub ? String(decodedToken.sub) : "";
  const isOwnAprendizProfile =
    pathname === aprendizProfilePath &&
    request.nextUrl.searchParams.get("id") === aprendizCodigo;

  let response: NextResponse;

  if (!isValidToken && !isAuthRoute && !isPublicRoute && !isNextInternal) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else if (
    isValidToken &&
    isAprendizToken(decodedToken) &&
    !isAuthRoute &&
    !isPublicRoute &&
    !isNextInternal &&
    !isOwnAprendizProfile
  ) {
    const profileUrl = new URL(aprendizProfilePath, request.url);
    profileUrl.searchParams.set("id", aprendizCodigo);
    response = NextResponse.redirect(profileUrl);
  } else if (
    isValidToken &&
    isEducadorToken(decodedToken) &&
    !isAuthRoute &&
    !isPublicRoute &&
    !isNextInternal &&
    pathname === "/aprendizes/cadaprendizes" &&
    !request.nextUrl.searchParams.get("id")
  ) {
    response = NextResponse.redirect(new URL("/aprendizes", request.url));
  } else if (
    isValidToken &&
    isEducadorToken(decodedToken) &&
    !isAuthRoute &&
    !isPublicRoute &&
    !isNextInternal &&
    !isEducadorAllowedPath(pathname)
  ) {
    response = NextResponse.redirect(new URL("/aprendizes", request.url));
  } else if (
    isValidToken &&
    EMPRESA_ALLOWED_PATHS.has(pathname) &&
    !isEmpresaToken(decodedToken)
  ) {
    response = NextResponse.redirect(new URL("/home", request.url));
  } else if (
    isValidToken &&
    isEmpresaToken(decodedToken) &&
    !isAuthRoute &&
    !isPublicRoute &&
    !isNextInternal &&
    !EMPRESA_ALLOWED_PATHS.has(pathname)
  ) {
    response = NextResponse.redirect(new URL(empresaProfilePath, request.url));
  } else {
    // Passa o nonce para Server Components via cabeçalho de requisição
    // (lido no layout.tsx através de next/headers)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);

    response = NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // Aplica o CSP em todas as respostas (inclusive redirects)
  response.headers.set("Content-Security-Policy", csp);

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

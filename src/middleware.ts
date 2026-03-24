import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
function parseJwt(token: string) {
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
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Erro ao decodificar JWT:", e);
    return null;
  }
}
function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  return decoded.exp * 1000 > Date.now();
}
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  const isValidToken = isTokenValid(token);
  const isAuthRoute = pathname === "/login";
  const isRootRoute = pathname === "/";
  const isPublicRoute = pathname.startsWith("/reset-password");
  if (isRootRoute && isValidToken) {
    const response = NextResponse.redirect(new URL("/home", request.url));
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Vary", "RSC");
    return response;
  }

  if (isRootRoute && !isValidToken) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Vary", "RSC");
    return response;
  }

  if (isAuthRoute && isValidToken) {
    const response = NextResponse.redirect(new URL("/home", request.url));
    response.headers.set("Cache-Control", "no-store, max-age=0");
    response.headers.set("Vary", "RSC");
    return response;
  }

  if (!isValidToken && !isAuthRoute && !isPublicRoute) {
    if (!pathname.startsWith("/_next") && !pathname.startsWith("/favicon")) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.headers.set("Cache-Control", "no-store, max-age=0");
      response.headers.set("Vary", "RSC");
      return response;
    }
  }

  return NextResponse.next();
}


export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendLoginToApi } from "@/lib/server/embedded-api";

export const runtime = "nodejs";

const loginResponseSchema = z.object({
  token: z.string().min(1),
  message: z.string(),
  user: z.object({
    UsuCodigo: z.string().min(1), UsuNome: z.string(),
    UsuEmail: z.string().nullable().optional(), UsuTipo: z.string().nullable().optional(),
    TokenTipo: z.string(), TipoAcesso: z.string(),
  }),
});

const LOGIN_PROXY_SECRET = process.env.LOGIN_PROXY_SECRET?.trim();

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Requisição inválida." }, { status: 400 });
  }

  let backendRes: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // Preserve the same origin checks and client IP used by the API's guards.
    for (const name of ["origin", "referer", "sec-fetch-site", "x-forwarded-for", "user-agent"]) {
      const value = request.headers.get(name);
      if (value) headers[name] = value;
    }
    if (LOGIN_PROXY_SECRET) {
      headers["x-prosis-login-secret"] = LOGIN_PROXY_SECRET;
    }

    backendRes = await sendLoginToApi(body, headers);
  } catch (error) {
    // Registre somente o tipo/codigo, nunca URL, credenciais ou corpo do login.
    const failure = error as { name?: string; cause?: { code?: string } };
    console.error("[auth/login] API interna indisponivel", {
      code: failure?.cause?.code ?? failure?.name ?? "UNKNOWN",
    });
    return NextResponse.json(
      { message: "Erro ao conectar com o servidor." },
      { status: 503 }
    );
  }

  let data: unknown;
  try {
    data = await backendRes.json();
  } catch {
    return NextResponse.json({ message: "Resposta inválida do servidor de autenticação." }, { status: 502 });
  }

  if (!backendRes.ok) {
    const failure = z.object({ message: z.string(), code: z.string().optional() }).safeParse(data);
    return NextResponse.json(failure.success ? failure.data : { message: "Falha no servidor de autenticação." }, { status: backendRes.status });
  }

  const parsed = loginResponseSchema.safeParse(data);
  if (!parsed.success) {
    return NextResponse.json({ message: "Resposta inválida do servidor de autenticação." }, { status: 502 });
  }
  const { token, user, message } = parsed.data;

  const response = NextResponse.json({ user, message });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 28800,
  });

  return response;
}

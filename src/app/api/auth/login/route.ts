import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendLoginToApi } from "@/lib/server/embedded-api";
import { isTrustedBrowserMutation, readLimitedBody } from "@/lib/security/browserRequest";

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
  const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
    NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...extra } });
  if (!isTrustedBrowserMutation(request)) return json({ message: "Origem não permitida." }, 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return json({ message: "Utilize application/json." }, 415);
  }
  let body: string;
  try {
    body = await readLimitedBody(request);
  } catch (error) {
    return json({ message: "Requisição inválida." }, error instanceof RangeError ? 413 : 400);
  }

  let backendRes: Response;
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    // Preserve the same origin checks and client IP used by the API's guards.
    for (const name of ["origin", "referer", "sec-fetch-site", "user-agent"]) {
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
    return json(
      { message: "Erro ao conectar com o servidor." },
      503
    );
  }

  let data: unknown;
  try {
    data = await backendRes.json();
  } catch {
    return json({ message: "Resposta inválida do servidor de autenticação." }, 502);
  }

  if (!backendRes.ok) {
    const failure = z.object({ message: z.string(), code: z.string().optional() }).safeParse(data);
    const retryAfter = backendRes.headers.get("retry-after");
    return json(failure.success ? failure.data : { message: "Falha no servidor de autenticação." }, backendRes.status, retryAfter ? { "Retry-After": retryAfter } : {});
  }

  const parsed = loginResponseSchema.safeParse(data);
  if (!parsed.success) {
    return json({ message: "Resposta inválida do servidor de autenticação." }, 502);
  }
  const { token, user, message } = parsed.data;

  const response = json({ user, message });

  response.cookies.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 28800,
  });

  return response;
}

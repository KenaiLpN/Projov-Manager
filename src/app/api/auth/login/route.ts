import { NextRequest, NextResponse } from "next/server";

const apiPort = process.env.API_PORT?.trim() || "3333";
const BACKEND_URL =
  process.env.INTERNAL_API_URL?.trim() || `http://127.0.0.1:${apiPort}`;
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
    if (LOGIN_PROXY_SECRET) {
      headers["x-prosis-login-secret"] = LOGIN_PROXY_SECRET;
    }

    backendRes = await fetch(`${BACKEND_URL}/login`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: "Erro ao conectar com o servidor." },
      { status: 503 }
    );
  }

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const { token, user, message } = data as {
    token: string;
    user: object;
    message: string;
  };

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

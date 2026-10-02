import { NextResponse } from "next/server";
import { isTrustedBrowserMutation } from "@/lib/security/browserRequest";

export async function POST(request: Request) {
  if (!isTrustedBrowserMutation(request)) return NextResponse.json({ message: "Origem não permitida." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const response = NextResponse.json({ message: "Logout efetuado com sucesso" }, { headers: { "Cache-Control": "no-store" } });

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

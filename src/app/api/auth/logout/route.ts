import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Logout efetuado com sucesso" });

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

import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cep: string }> }) {
  const { cep } = await params;
  const clean = cep.replace(/\D/g, "");

  if (clean.length !== 8) {
    return NextResponse.json({ erro: true }, { status: 400 });
  }

  try {
    const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ erro: true }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ erro: true }, { status: 502 });
  }
}

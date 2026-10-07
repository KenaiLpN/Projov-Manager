"use client";

import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function AcessoNegadoPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldX size={34} aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-slate-950">Acesso não permitido</h1>
        <p className="mt-3 text-slate-600">
          Seu perfil não possui permissão para visualizar esta página. Se você precisa deste acesso, solicite a alteração ao administrador do sistema.
        </p>
        <Link href="/home" className="mt-7 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800">
          Voltar para o início
        </Link>
      </section>
    </main>
  );
}

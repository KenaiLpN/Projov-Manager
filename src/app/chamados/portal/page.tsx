"use client";

import { useEffect, useState } from "react";
import { LogOut, Plus, TicketCheck } from "lucide-react";

type SessionUser = {
  UsuNome?: string | null;
};

export default function ChamadosPortalPage() {
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const sessionRaw = localStorage.getItem("projov_user");
    if (!sessionRaw) return;

    try {
      setUser(JSON.parse(sessionRaw));
    } catch {
      localStorage.removeItem("projov_user");
    }
  }, []);

  async function handleLogout() {
    localStorage.removeItem("projov_user");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#214875] text-white">
              <TicketCheck size={21} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-950">Chamados TI</h1>
              <p className="text-sm text-slate-500">{user?.UsuNome || "Portal do solicitante"}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#214875]">
              Central de suporte
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Abertura de chamados
            </h2>
          </div>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#214875] px-4 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#2c5f98]"
          >
            <Plus size={18} />
            Abrir chamado
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="font-semibold text-slate-950">Meus chamados</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Numero</th>
                  <th className="px-5 py-3">Titulo</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Aberto em</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-500">
                    Nenhum chamado para exibir.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Inbox, LogOut, Moon, Search, Sun, TicketCheck } from "lucide-react";

type SessionUser = {
  UsuNome?: string | null;
};

type ThemeMode = "light" | "dark";

const metrics = [
  { label: "Abertos", value: 0, detail: "Aguardando primeira analise" },
  { label: "Nao classificados", value: 0, detail: "Sem prioridade definida" },
  { label: "Sem tecnico", value: 0, detail: "Disponiveis para assumir" },
  { label: "Resolvidos hoje", value: 0, detail: "Finalizados no dia" },
];

const menuItems = [
  "Dashboard",
  "Todos os chamados",
  "Nao atribuidos",
  "Meus chamados",
  "Resolvidos",
];

const themes = {
  light: {
    page: "bg-[#f6f3ec] text-[#1f2726]",
    header: "border-[#ded7ca] bg-[#fffdf8]",
    brandIcon: "bg-[#0f766e] text-white",
    brandText: "text-[#1f2726]",
    muted: "text-[#6d766f]",
    button: "border-[#d9d0c2] bg-[#fffdf8] text-[#31403d] hover:bg-[#f1ebe0]",
    layout: "lg:grid-cols-[248px_1fr]",
    sidebar: "border-[#ded7ca] bg-[#fffdf8]",
    sidebarActive: "bg-[#0f766e] text-white shadow-sm",
    sidebarItem: "text-[#53615d] hover:bg-[#f1ebe0] hover:text-[#1f2726]",
    eyebrow: "text-[#b45309]",
    title: "text-[#1f2726]",
    searchWrap: "border-[#d9d0c2] bg-[#fffdf8] text-[#6d766f]",
    searchInput: "text-[#1f2726] placeholder:text-[#8a928c]",
    metric: "border-[#ded7ca] bg-[#fffdf8]",
    metricLabel: "text-[#596761]",
    metricValue: "text-[#1f2726]",
    metricDetail: "text-[#8a7460]",
    table: "border-[#ded7ca] bg-[#fffdf8]",
    tableHead: "border-[#ded7ca] bg-[#f1ebe0] text-[#596761]",
    tableTitle: "text-[#1f2726]",
    tableBorder: "divide-[#ded7ca]",
    empty: "text-[#6d766f]",
  },
  dark: {
    page: "bg-[#151715] text-[#f2efe7]",
    header: "border-[#32372f] bg-[#1d211d]",
    brandIcon: "bg-[#2dd4bf] text-[#10201d]",
    brandText: "text-[#f2efe7]",
    muted: "text-[#a8b0a7]",
    button: "border-[#3b4238] bg-[#232821] text-[#e9e5d8] hover:bg-[#2e352b]",
    layout: "lg:grid-cols-[248px_1fr]",
    sidebar: "border-[#32372f] bg-[#1d211d]",
    sidebarActive: "bg-[#2dd4bf] text-[#10201d] shadow-sm",
    sidebarItem: "text-[#c0c8bc] hover:bg-[#2b3129] hover:text-white",
    eyebrow: "text-[#f2b66d]",
    title: "text-[#f2efe7]",
    searchWrap: "border-[#3b4238] bg-[#1d211d] text-[#a8b0a7]",
    searchInput: "text-[#f2efe7] placeholder:text-[#8b9389]",
    metric: "border-[#32372f] bg-[#1d211d]",
    metricLabel: "text-[#c0c8bc]",
    metricValue: "text-[#f2efe7]",
    metricDetail: "text-[#bfa582]",
    table: "border-[#32372f] bg-[#1d211d]",
    tableHead: "border-[#32372f] bg-[#232821] text-[#c0c8bc]",
    tableTitle: "text-[#f2efe7]",
    tableBorder: "divide-[#32372f]",
    empty: "text-[#c0c8bc]",
  },
};

export default function ChamadosAdminDashboardPage() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const styles = themes[theme];
  const isDark = theme === "dark";

  useEffect(() => {
    const sessionRaw = localStorage.getItem("projov_user");
    const savedTheme = localStorage.getItem("prosis-chamados-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    }

    if (!sessionRaw) return;

    try {
      setUser(JSON.parse(sessionRaw));
    } catch {
      localStorage.removeItem("projov_user");
    }
  }, []);

  function toggleTheme() {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "light" ? "dark" : "light";
      localStorage.setItem("prosis-chamados-theme", nextTheme);
      return nextTheme;
    });
  }

  async function handleLogout() {
    localStorage.removeItem("projov_user");
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className={`min-h-screen transition-colors ${styles.page}`}>
      <header className={`border-b transition-colors ${styles.header}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${styles.brandIcon}`}>
              <TicketCheck size={21} />
            </div>
            <div>
              <h1 className={`text-lg font-bold ${styles.brandText}`}>Chamados TI</h1>
              <p className={`text-sm ${styles.muted}`}>{user?.UsuNome || "Painel tecnico"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              title={isDark ? "Modo claro" : "Modo escuro"}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${styles.button}`}
            >
              {isDark ? <Sun size={18} strokeWidth={1.8} /> : <Moon size={18} strokeWidth={1.8} />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${styles.button}`}
            >
              <LogOut size={17} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className={`mx-auto grid max-w-7xl gap-6 px-5 py-6 ${styles.layout}`}>
        <aside className={`rounded-lg border p-3 transition-colors ${styles.sidebar}`}>
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-semibold transition-colors ${
                item === "Dashboard" ? styles.sidebarActive : styles.sidebarItem
              }`}
            >
              {item}
            </button>
          ))}
        </aside>

        <section>
          <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className={`text-sm font-bold uppercase tracking-[0.18em] ${styles.eyebrow}`}>
                Area tecnica
              </p>
              <h2 className={`mt-2 text-3xl font-bold ${styles.title}`}>Painel de chamados</h2>
            </div>

            <label className={`flex min-h-11 w-full max-w-md items-center gap-2 rounded-lg border px-3 transition-colors ${styles.searchWrap}`}>
              <Search size={18} />
              <input
                type="search"
                placeholder="Buscar chamado"
                className={`w-full bg-transparent text-sm font-medium outline-none ${styles.searchInput}`}
              />
            </label>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div key={metric.label} className={`rounded-lg border p-5 transition-colors ${styles.metric}`}>
                <p className={`text-sm font-semibold ${styles.metricLabel}`}>{metric.label}</p>
                <p className={`mt-3 text-3xl font-bold ${styles.metricValue}`}>{metric.value}</p>
                <p className={`mt-2 text-xs font-medium ${styles.metricDetail}`}>{metric.detail}</p>
              </div>
            ))}
          </div>

          <div className={`overflow-hidden rounded-lg border transition-colors ${styles.table}`}>
            <div className={`flex items-center justify-between border-b px-5 py-4 ${styles.tableHead}`}>
              <h3 className={`font-semibold ${styles.tableTitle}`}>Tabela de chamados</h3>
              <Inbox size={19} />
            </div>

            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y text-sm ${styles.tableBorder}`}>
                <thead className={`text-left text-xs font-bold uppercase tracking-wide ${styles.tableHead}`}>
                  <tr>
                    <th className="px-5 py-3">ID</th>
                    <th className="px-5 py-3">Solicitante</th>
                    <th className="px-5 py-3">Categoria</th>
                    <th className="px-5 py-3">Prioridade</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Responsavel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className={`px-5 py-14 text-center ${styles.empty}`}>
                      Nenhum chamado para exibir.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Building2, ChevronDown, ClipboardCheck, GraduationCap } from "lucide-react";

type MenuItem = {
  name: string;
  href: string;
  subMenu?: MenuItem[];
};

const menuItems: MenuItem[] = [
  { name: "Detalhes Parceiros", href: "/empresa/perfil" },
  {
    name: "Aprendiz",
    href: "#",
    subMenu: [
      { name: "Aprendizes Alocados", href: "/empresa/aprendizes-alocados" },
      {
        name: "Controle de Presença",
        href: "#",
        subMenu: [
          { name: "Por Período", href: "/empresa/controle-presenca/por-periodo" },
          { name: "Total Período", href: "/empresa/controle-presenca/total-periodo" },
        ],
      },
      { name: "Cadastro de Vagas", href: "/empresa/cadastro-vagas" },
      { name: "Avaliação Desempenho", href: "/empresa/avaliacao-desempenho" },
      { name: "Contagem Faltas", href: "/empresa/contagem-faltas" },
      { name: "Avaliações Realizadas", href: "/empresa/avaliacoes-realizadas" },
    ],
  },
];

function containsActiveRoute(item: MenuItem, pathname: string): boolean {
  return item.href !== "#" && pathname === item.href
    ? true
    : item.subMenu?.some((child) => containsActiveRoute(child, pathname)) ?? false;
}

function MenuGroup({ items, depth = 0 }: { items: MenuItem[]; depth?: number }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    setExpanded(
      items.filter((item) => item.subMenu && containsActiveRoute(item, pathname)).map((item) => item.name),
    );
  }, [items, pathname]);

  return (
    <div className="w-full">
      {items.map((item) => {
        const hasSubMenu = Boolean(item.subMenu?.length);
        const isExpanded = expanded.includes(item.name);
        const isActive = item.href !== "#" && pathname === item.href;

        return (
          <div key={`${depth}-${item.name}`} className="w-full">
            <div
              className={`flex min-h-12 w-full items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors ${
                isActive ? "bg-[#123A83] text-white" : "text-slate-100 hover:bg-[#123A83]"
              }`}
              style={{ paddingLeft: `${1 + depth * 1.1}rem` }}
            >
              {depth === 0 && (item.name === "Detalhes Parceiros" ? <Building2 size={17} /> : <GraduationCap size={17} />)}
              {depth === 1 && item.name === "Controle de Presença" && <ClipboardCheck size={16} />}
              <Link
                href={item.href}
                onClick={(event) => {
                  if (item.href !== "#") return;
                  event.preventDefault();
                  setExpanded((current) =>
                    current.includes(item.name)
                      ? current.filter((name) => name !== item.name)
                      : [...current, item.name],
                  );
                }}
                className="flex-1"
              >
                {item.name}
              </Link>
              {hasSubMenu && (
                <button
                  type="button"
                  aria-label={`${isExpanded ? "Fechar" : "Abrir"} ${item.name}`}
                  onClick={() => setExpanded((current) =>
                    current.includes(item.name)
                      ? current.filter((name) => name !== item.name)
                      : [...current, item.name],
                  )}
                  className="rounded p-1 hover:bg-white/10"
                >
                  <ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
            {hasSubMenu && isExpanded && (
              <div className="border-l-2 border-white/10 bg-[#0b2452]/60">
                <MenuGroup items={item.subMenu!} depth={depth + 1} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ParceiroSidebar() {
  return (
    <aside className="h-full w-72 shrink-0 overflow-y-auto border-r border-[#123A83] bg-[#0F306D]">
      <div className="border-b border-white/10 px-5 py-5 text-white">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-200">Área da Empresa</p>
        <h2 className="mt-1 text-lg font-bold">Menu Parceiro</h2>
      </div>
      <MenuGroup items={menuItems} />
    </aside>
  );
}

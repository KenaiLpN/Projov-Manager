"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
interface NavItem {
  name: string;
  href: string;
}
const navItems: NavItem[] = [
  { name: "Usuários", href: "/cadastros/usuarios" },
  { name: "Unidades", href: "/cadastros/unidades" },
  { name: "Instituições de Ensino", href: "/cadastros/instituicoes" },
  { name: "Situações do Participante", href: "/cadastros/situacoes-participante" },
  { name: "Ocorrências", href: "/cadastros/ocorrencias" },
  { name: "Profissões", href: "/cadastros/profissoes" },
  { name: "Graus de Parentesco", href: "/cadastros/grau-parentesco" },
  { name: "Graus de Escolaridade", href: "/cadastros/graus-escolaridade" },
  { name: "Feriados", href: "/cadastros/feriados" },
  { name: "Motivos de Desligamento", href: "/cadastros/motivos-desligamento" },
  { name: "Instituições Parceiras", href: "/cadastros/instituicoes-parceiras" },
  { name: "Status Encaminhamento", href: "/cadastros/status-encaminhamento" },
  { name: "Regiões", href: "/cadastros/regioes" },
];
export function CadSidebar() {
  const pathname = usePathname();
  const baseLinkClasses =
    "flex items-center transition font-medium duration-300 ease-in-out h-14 w-full justify-center hover:bg-[#123A83] ";
  const activeLinkClasses = "text-[#FFFF] bg-[#123A83] font-medium focus:ring-2 focus:ring-gray-500/10";
  const inactive = "text-[#F6F6F6] transition font-medium duration-300 ease-in-out hover:text-[#FDFDFD] hover:bg-[#123A83]";
  const getLinkClasses = (href: string) => {
    const isActive = pathname === href;
    return `${baseLinkClasses} ${isActive ? activeLinkClasses : inactive}`;
  };
  return (
    <div className="flex flex-col bg-[#0F306D] w-60 h-full items-center">
      {navItems.map((item) => {
        return (
          <Link
            key={item.href}
            href={item.href}
            className={getLinkClasses(item.href)}
          >
            <span>{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
